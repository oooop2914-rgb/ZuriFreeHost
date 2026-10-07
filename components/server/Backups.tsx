'use client';
import { useEffect, useState } from 'react';
import { Download, RotateCcw, Trash2, Plus } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import { apiFetch } from '@/lib/api';

interface Backup { uuid: string; name: string; bytes: number; is_successful: boolean; created_at: string; completed_at: string | null }

function fmtSize(b: number) {
  if (!b) return '-'; const u = ['B', 'KB', 'MB', 'GB']; let i = 0, v = b;
  while (v >= 1024 && i < u.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(1)} ${u[i]}`;
}

export default function Backups({ serverId }: { serverId: string }) {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState('');

  async function load() {
    const res = await apiFetch(`/servers/${serverId}/backups`);
    const j = await res.json();
    if (res.ok) setBackups(j.backups || []);
  }
  useEffect(() => { load(); const t = setInterval(load, 8000); return () => clearInterval(t); }, [serverId]);

  async function create() {
    setCreating(true); setMsg('');
    const name = prompt('Nama backup (opsional):') || undefined;
    const res = await apiFetch(`/servers/${serverId}/backups`, { method: 'POST', body: JSON.stringify({ name }) });
    const j = await res.json();
    setCreating(false);
    setMsg(res.ok ? 'Backup lagi diproses...' : j.error);
    load();
  }
  async function download(uuid: string) {
    const res = await apiFetch(`/servers/${serverId}/backups/${uuid}/download`);
    const j = await res.json();
    if (res.ok) window.open(j.url, '_blank');
  }
  async function restore(uuid: string, name: string) {
    if (!confirm(`Restore backup "${name}"? File server sekarang bakal ketimpa.`)) return;
    await apiFetch(`/servers/${serverId}/backups/${uuid}/restore`, { method: 'POST' });
    setMsg('Restore dimulai, server bakal restart otomatis.');
  }
  async function del(uuid: string) {
    if (!confirm('Hapus backup ini?')) return;
    await apiFetch(`/servers/${serverId}/backups/${uuid}`, { method: 'DELETE' });
    load();
  }

  return (
    <GlassCard style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h3 style={{ margin: '0 0 4px', fontSize: 15 }}>Backups</h3>
          <p style={{ margin: 0, fontSize: 12.5, color: 'var(--sv-text-1)' }}>Simpan & restore seluruh file server.</p>
        </div>
        <GlassButton variant="primary" size="sm" icon={<Plus size={13} />} loading={creating} onClick={create}>Backup Baru</GlassButton>
      </div>
      {msg && <p style={{ fontSize: 13, color: 'var(--sv-grad-c)', marginBottom: 12 }}>{msg}</p>}
      <div style={{ display: 'grid', gap: 10 }}>
        {backups.map(b => (
          <div key={b.uuid} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'rgba(255,255,255,.03)', borderRadius: 10, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>{b.name}</div>
              <div style={{ fontSize: 11.5, color: 'var(--sv-text-2)' }}>{fmtSize(b.bytes)} · {new Date(b.created_at).toLocaleString('id-ID')}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {!b.completed_at
                ? <span className="sv-badge sv-badge-starting"><span className="sv-badge-dot" />Memproses</span>
                : <>
                    <GlassButton size="sm" icon={<Download size={12} />} onClick={() => download(b.uuid)} />
                    <GlassButton size="sm" icon={<RotateCcw size={12} />} onClick={() => restore(b.uuid, b.name)} />
                  </>}
              <GlassButton size="sm" variant="danger" icon={<Trash2 size={12} />} onClick={() => del(b.uuid)} />
            </div>
          </div>
        ))}
        {backups.length === 0 && <p style={{ color: 'var(--sv-text-1)', fontSize: 13 }}>Belum ada backup.</p>}
      </div>
    </GlassCard>
  );
}
