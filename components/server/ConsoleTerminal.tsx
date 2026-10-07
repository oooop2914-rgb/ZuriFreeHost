'use client';
import { useEffect, useRef, useState } from 'react';
import { Copy, Trash2, Download, Maximize2, Minimize2, ChevronUp, ChevronDown } from 'lucide-react';
import GlassButton from '@/components/ui/GlassButton';
import { useServerSocket } from '@/lib/store/serverSocket';

// Pewarnaan baris log sederhana sesuai kata kunci umum (brief 5.5) --
// xterm pake ANSI escape code buat warna, bukan CSS.
function colorize(line: string): string {
  if (/\[Pterodactyl Daemon\]/i.test(line)) return `\x1b[38;5;75m${line}\x1b[0m`;       // biru muted
  if (/\berror\b/i.test(line)) return `\x1b[38;5;203m${line}\x1b[0m`;                    // merah muted
  if (/\bwarn(ing)?\b/i.test(line)) return `\x1b[38;5;221m${line}\x1b[0m`;                // kuning muted
  if (/\bsuccess|done|started\b/i.test(line)) return `\x1b[38;5;114m${line}\x1b[0m`;      // hijau muted
  return `\x1b[38;5;252m${line}\x1b[0m`;                                                  // abu terang (info)
}

export default function ConsoleTerminal({ serverId }: { serverId: string }) {
  const { connect, disconnect, lines, connected, connecting, error, sendCommand, clearLines } = useServerSocket();
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<any>(null);
  const fitRef = useRef<any>(null);
  const [cmd, setCmd] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [autoScroll, setAutoScroll] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const lastLineCount = useRef(0);

  useEffect(() => {
    connect(serverId);
    return () => disconnect();
  }, [serverId]);

  // init xterm sekali
  useEffect(() => {
    let disposed = false;
    (async () => {
      const { Terminal } = await import('@xterm/xterm');
      const { FitAddon } = await import('@xterm/addon-fit');
      if (disposed || !containerRef.current) return;
      const term = new Terminal({
        convertEol: true, disableStdin: true, fontFamily: "'JetBrains Mono', monospace", fontSize: 13,
        theme: { background: '#0D0D0F', foreground: '#D4D4D8', cursor: '#A855F7' },
        scrollback: 2000,
      });
      const fit = new FitAddon();
      term.loadAddon(fit);
      term.open(containerRef.current);
      fit.fit();
      termRef.current = term; fitRef.current = fit;
      const onResize = () => fit.fit();
      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    })();
    return () => { disposed = true; termRef.current?.dispose?.(); };
  }, []);

  // tulis baris baru yang belum ditulis
  useEffect(() => {
    const term = termRef.current;
    if (!term) return;
    for (let i = lastLineCount.current; i < lines.length; i++) term.writeln(colorize(lines[i]));
    lastLineCount.current = lines.length;
    if (autoScroll) term.scrollToBottom();
  }, [lines, autoScroll]);

  useEffect(() => { fitRef.current?.fit(); }, [fullscreen]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!cmd.trim()) return;
    sendCommand(cmd);
    setHistory(h => [...h, cmd]);
    setHistIdx(-1);
    setCmd('');
  }

  function navHistory(dir: -1 | 1) {
    if (history.length === 0) return;
    const next = Math.min(Math.max(histIdx + dir, 0), history.length - 1);
    setHistIdx(next);
    setCmd(history[history.length - 1 - next] || '');
  }

  function copyAll() { navigator.clipboard?.writeText(lines.join('\n')); }
  function download() {
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${serverId}-console.log`; a.click();
    URL.revokeObjectURL(url);
  }
  function clearTerm() { termRef.current?.clear(); lastLineCount.current = 0; clearLines(); }

  return (
    <div
      ref={wrapRef}
      className="sv-card"
      style={fullscreen
        ? { position: 'fixed', inset: 16, zIndex: 90, display: 'flex', flexDirection: 'column' }
        : { display: 'flex', flexDirection: 'column', height: 420 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid var(--sv-surface-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, color: 'var(--sv-text-1)' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: connected ? '#10B981' : connecting ? '#F59E0B' : '#EF4444', flexShrink: 0 }} />
          {connected ? 'Terhubung' : connecting ? 'Menghubungkan...' : (error || 'Terputus')}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <GlassButton size="sm" icon={<ChevronDown size={13} />} onClick={() => setAutoScroll(a => !a)} style={{ opacity: autoScroll ? 1 : .55 }}>Auto-scroll</GlassButton>
          <GlassButton size="sm" icon={<Copy size={13} />} onClick={copyAll} />
          <GlassButton size="sm" icon={<Trash2 size={13} />} onClick={clearTerm} />
          <GlassButton size="sm" icon={<Download size={13} />} onClick={download} />
          <GlassButton size="sm" icon={fullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />} onClick={() => setFullscreen(f => !f)} />
        </div>
      </div>

      <div ref={containerRef} style={{ flex: 1, padding: '10px 14px', overflow: 'hidden' }} />

      <form onSubmit={submit} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderTop: '1px solid var(--sv-surface-border)' }}>
        <span className="sv-mono" style={{ color: 'var(--sv-grad-c)', fontSize: 13 }}>&gt;</span>
        <input
          value={cmd}
          onChange={e => setCmd(e.target.value)}
          onKeyDown={e => { if (e.key === 'ArrowUp') { e.preventDefault(); navHistory(1); } if (e.key === 'ArrowDown') { e.preventDefault(); navHistory(-1); } }}
          placeholder="Type a command..."
          disabled={!connected}
          className="sv-mono"
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 13 }}
        />
        <ChevronUp size={12} color="var(--sv-text-2)" />
      </form>
    </div>
  );
}
