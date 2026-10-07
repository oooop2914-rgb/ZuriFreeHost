'use client';
import { useEffect, useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import { apiFetch } from '@/lib/api';

interface Variable { name: string; env_variable: string; description: string; server_value: string; is_editable: boolean }

export default function Startup({ serverId }: { serverId: string }) {
  const [cmd, setCmd] = useState('');
  const [vars, setVars] = useState<Variable[]>([]);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  async function load() {
    const res = await apiFetch(`/servers/${serverId}/startup`);
    const j = await res.json();
    if (res.ok) { setCmd(j.startup_command || ''); setVars(j.variables || []); }
  }
  useEffect(() => { load(); }, [serverId]);

  async function save(envVar: string) {
    setSaving(envVar); setMsg('');
    const res = await apiFetch(`/servers/${serverId}/startup`, { method: 'PUT', body: JSON.stringify({ key: envVar, value: edits[envVar] }) });
    const j = await res.json();
    setSaving(null);
    setMsg(res.ok ? 'Tersimpan.' : j.error);
    if (res.ok) load();
  }

  return (
    <>
      <GlassCard style={{ padding: 20, marginBottom: 18 }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 14 }}>Startup Command</h3>
        <code className="sv-mono" style={{ display: 'block', background: '#0D0D0F', padding: 12, borderRadius: 8, fontSize: 12.5, color: 'var(--sv-text-1)', overflowX: 'auto', whiteSpace: 'pre' }}>{cmd}</code>
      </GlassCard>

      {msg && <p style={{ color: 'var(--sv-grad-c)', fontSize: 13, marginBottom: 12 }}>{msg}</p>}

      <div style={{ display: 'grid', gap: 12 }}>
        {vars.map(v => (
          <GlassCard key={v.env_variable} style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13.5 }}>{v.name}</div>
                <div style={{ fontSize: 11.5, color: 'var(--sv-text-2)' }} className="sv-mono">{v.env_variable}</div>
              </div>
              {!v.is_editable && <span className="sv-badge sv-badge-neutral"><span className="sv-badge-dot" />Read-only</span>}
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--sv-text-1)', margin: '0 0 10px' }}>{v.description}</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                defaultValue={v.server_value}
                disabled={!v.is_editable}
                onChange={e => setEdits({ ...edits, [v.env_variable]: e.target.value })}
                style={{ flex: 1, minWidth: 0, background: 'rgba(255,255,255,.04)', border: '1px solid var(--sv-surface-border)', borderRadius: 8, padding: '8px 11px', color: '#fff', fontSize: 13 }}
              />
              {v.is_editable && (
                <GlassButton size="sm" variant="primary" loading={saving === v.env_variable} onClick={() => save(v.env_variable)}>Simpan</GlassButton>
              )}
            </div>
          </GlassCard>
        ))}
        {vars.length === 0 && <p style={{ color: 'var(--sv-text-1)' }}>Gak ada variable buat egg ini.</p>}
      </div>
    </>
  );
}
