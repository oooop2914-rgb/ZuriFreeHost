'use client';
import { useState } from 'react';
import { Play, RotateCw, Square, Pencil } from 'lucide-react';
import GlassButton from '@/components/ui/GlassButton';
import GlassCard from '@/components/ui/GlassCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { apiFetch } from '@/lib/api';
import type { PowerState } from '@/lib/store/serverSocket';

function toBadgeStatus(state: PowerState | undefined): 'running' | 'stopped' | 'starting' | 'neutral' {
  if (state === 'running') return 'running';
  if (state === 'starting' || state === 'stopping') return 'starting';
  if (state === 'offline') return 'stopped';
  return 'neutral';
}

export default function ServerHeader({ serverId, name, state, onRenamed }: {
  serverId: string; name: string; state: PowerState | undefined; onRenamed: (name: string) => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmSignal, setConfirmSignal] = useState<'stop' | 'restart' | null>(null);

  async function power(signal: 'start' | 'stop' | 'restart') {
    setBusy(signal); setConfirmSignal(null);
    await apiFetch(`/servers/${serverId}/power`, { method: 'POST', body: JSON.stringify({ signal }) });
    setTimeout(() => setBusy(null), 1500);
  }

  function rename() {
    const n = prompt('Nama baru:', name);
    if (!n) return;
    apiFetch(`/servers/${serverId}`, { method: 'PATCH', body: JSON.stringify({ name: n }) }).then(() => onRenamed(n));
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 18, marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 className="sv-mono" style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>{name}</h1>
            <button onClick={rename} style={{ background: 'none', border: 'none', color: 'var(--sv-text-2)', cursor: 'pointer', padding: 4 }}><Pencil size={14} /></button>
          </div>
          <div style={{ marginTop: 6 }}><StatusBadge status={toBadgeStatus(state)} /></div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <GlassButton variant="success" size="sm" icon={<Play size={14} />} loading={busy === 'start'} onClick={() => power('start')}>Start</GlassButton>
        <GlassButton variant="secondary" size="sm" icon={<RotateCw size={14} />} loading={busy === 'restart'} onClick={() => setConfirmSignal('restart')}>Restart</GlassButton>
        <GlassButton variant="danger" size="sm" icon={<Square size={14} />} loading={busy === 'stop'} onClick={() => setConfirmSignal('stop')}>Stop</GlassButton>
      </div>

      {confirmSignal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(4px)' }}>
          <GlassCard hover={false} style={{ padding: 28, maxWidth: 360, margin: 16 }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 600 }}>
              Yakin mau {confirmSignal === 'stop' ? 'stop' : 'restart'} server?
            </h3>
            <p style={{ color: 'var(--sv-text-1)', fontSize: 13.5, margin: '0 0 20px' }}>
              {confirmSignal === 'stop' ? 'Server dan semua proses di dalamnya bakal berhenti.' : 'Server bakal mati sebentar terus nyala lagi.'}
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <GlassButton size="sm" onClick={() => setConfirmSignal(null)}>Batal</GlassButton>
              <GlassButton size="sm" variant={confirmSignal === 'stop' ? 'danger' : 'primary'} onClick={() => power(confirmSignal)}>Ya, lanjut</GlassButton>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
