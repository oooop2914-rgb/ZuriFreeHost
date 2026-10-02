'use client';
import { create } from 'zustand';
import { apiFetch } from '@/lib/api';

export type PowerState = 'running' | 'starting' | 'stopping' | 'offline' | 'unknown';

export interface Stats {
  cpu: number;            // persen (bisa >100 kalau multi-core)
  memoryBytes: number;
  diskBytes: number;
  networkRxBytes: number;
  networkTxBytes: number;
  uptimeMs: number;
  state: PowerState;
  at: number;              // Date.now() pas data ini diterima -- buat sumbu waktu chart
}

const MAX_HISTORY = 60; // ~5 menit kalau stats tiap 5 detik (default Wings)

interface ServerSocketState {
  serverId: string | null;
  connected: boolean;
  connecting: boolean;
  error: string | null;
  lines: string[];
  stats: Stats | null;
  history: Stats[];
  connect: (serverId: string) => Promise<void>;
  disconnect: () => void;
  sendCommand: (cmd: string) => void;
  clearLines: () => void;
}

let ws: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let currentServerId: string | null = null;

function parseStats(raw: string): Stats {
  const d = JSON.parse(raw);
  return {
    cpu: d.cpu_absolute ?? 0,
    memoryBytes: d.memory_bytes ?? 0,
    diskBytes: d.disk_bytes ?? 0,
    networkRxBytes: d.network?.rx_bytes ?? 0,
    networkTxBytes: d.network?.tx_bytes ?? 0,
    uptimeMs: d.uptime ?? 0,
    state: (d.state as PowerState) ?? 'unknown',
    at: Date.now(),
  };
}

export const useServerSocket = create<ServerSocketState>((set, get) => ({
  serverId: null,
  connected: false,
  connecting: false,
  error: null,
  lines: [],
  stats: null,
  history: [],

  async connect(serverId: string) {
    if (currentServerId === serverId && (get().connected || get().connecting)) return;
    get().disconnect();
    currentServerId = serverId;
    set({ serverId, connecting: true, error: null, lines: [], stats: null, history: [] });

    try {
      const res = await apiFetch(`/servers/${serverId}/console`);
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Gagal ambil akses console');

      const socket = new WebSocket(j.socket);
      ws = socket;

      socket.onopen = () => {
        socket.send(JSON.stringify({ event: 'auth', args: [j.token] }));
      };

      socket.onmessage = (ev) => {
        let msg: any;
        try { msg = JSON.parse(ev.data); } catch { return; }
        const [event, args] = [msg.event, msg.args || []];

        if (event === 'auth success') {
          set({ connected: true, connecting: false });
          socket.send(JSON.stringify({ event: 'send logs', args: [null] }));
        } else if (event === 'console output') {
          set(s => ({ lines: [...s.lines.slice(-800), args[0]] }));
        } else if (event === 'stats') {
          const stat = parseStats(args[0]);
          set(s => ({ stats: stat, history: [...s.history.slice(-(MAX_HISTORY - 1)), stat] }));
        } else if (event === 'status') {
          set(s => (s.stats ? { stats: { ...s.stats, state: args[0] } } : {}));
        } else if (event === 'token expiring') {
          // minta token baru biar koneksi gak keputus
          apiFetch(`/servers/${serverId}/console`).then(r => r.json()).then(nj => {
            if (nj.token) socket.send(JSON.stringify({ event: 'auth', args: [nj.token] }));
          });
        } else if (event === 'daemon error' || event === 'jwt error') {
          set({ error: String(args[0] || 'Error dari daemon') });
        }
      };

      socket.onerror = () => set({ error: 'Koneksi console terputus' });
      socket.onclose = () => {
        set({ connected: false });
        if (currentServerId === serverId) {
          reconnectTimer = setTimeout(() => get().connect(serverId), 4000);
        }
      };
    } catch (err: any) {
      set({ connecting: false, error: err.message || 'Gagal konek console' });
    }
  },

  disconnect() {
    currentServerId = null;
    if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
    if (ws) { ws.onclose = null; ws.close(); ws = null; }
    set({ connected: false, connecting: false });
  },

  sendCommand(cmd: string) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ event: 'send command', args: [cmd] }));
    }
  },

  clearLines() { set({ lines: [] }); },
}));
