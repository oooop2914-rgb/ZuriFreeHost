'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function AdminSettings() {
  const [settings, setSettings] = useState<any>(null);
  const [msg, setMsg] = useState('');

  async function load() { const r = await apiFetch('/settings'); const j = await r.json(); setSettings(j.settings); }
  useEffect(() => { load(); }, []);

  async function toggle(field: string, value: boolean) {
    await apiFetch('/settings', { method: 'PATCH', body: JSON.stringify({ [field]: value }) });
    setMsg('Tersimpan.');
    load();
  }

  if (!settings) return <div className="muted">Loading...</div>;

  return (
    <>
      {msg && <p className="msg">{msg}</p>}
      <div className="card">
        <h3>Mode Maintenance</h3>
        <p className="sub">Kalau aktif, user biasa gak bisa akses fitur-fitur utama (admin tetep bisa).</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn" style={!settings.maintenance_mode ? { background: 'var(--glass-strong)', borderColor: 'var(--accent)', color: 'var(--accent)' } : {}} onClick={() => toggle('maintenance_mode', false)}>Nonaktif</button>
          <button className="btn" style={settings.maintenance_mode ? { background: 'rgba(255,107,107,.15)', borderColor: 'var(--red)', color: 'var(--red)' } : {}} onClick={() => toggle('maintenance_mode', true)}>Aktifkan Maintenance</button>
        </div>
      </div>
      <div className="card">
        <h3>Pendaftaran User Baru</h3>
        <p className="sub">Matiin sementara kalau kapasitas node udah penuh.</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn" style={settings.registration_open ? { background: 'var(--glass-strong)', borderColor: 'var(--accent)', color: 'var(--accent)' } : {}} onClick={() => toggle('registration_open', true)}>Buka Registrasi</button>
          <button className="btn" style={!settings.registration_open ? { background: 'rgba(255,107,107,.15)', borderColor: 'var(--red)', color: 'var(--red)' } : {}} onClick={() => toggle('registration_open', false)}>Tutup Registrasi</button>
        </div>
      </div>
    </>
  );
}
