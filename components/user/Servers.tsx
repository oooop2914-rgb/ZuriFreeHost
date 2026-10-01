'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function Servers() {
  const [servers, setServers] = useState<any[]>([]);
  const [msg, setMsg] = useState('');

  async function load() { const r = await apiFetch('/servers'); setServers((await r.json()).servers || []); }
  useEffect(() => { load(); }, []);

  async function power(id: string, signal: string) {
    setMsg('');
    const res = await apiFetch(`/servers/${id}/power`, { method: 'POST', body: JSON.stringify({ signal }) });
    const j = await res.json();
    setMsg(res.ok ? `Sinyal "${signal}" dikirim.` : j.error);
  }
  async function rename(id: string) {
    const name = prompt('Nama baru:');
    if (!name) return;
    await apiFetch(`/servers/${id}`, { method: 'PATCH', body: JSON.stringify({ name }) });
    load();
  }

  return (
    <div className="card">
      <h3>Server Saya</h3>
      {msg && <p className="msg">{msg}</p>}
      <div className="scrollx">
        <table>
          <thead><tr><th>Nama</th><th>Tipe</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {servers.map(s => (
              <tr key={s.id}>
                <td className="token">{s.name}</td>
                <td style={{ textTransform: 'capitalize' }}>{s.type}</td>
                <td><span className={`pill ${s.status === 'online' ? 'on' : s.status === 'installing' ? 'warn' : 'off'}`}><span className="dt" />{s.status}</span></td>
                <td style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button className="btn btn-sm" onClick={() => power(s.id, 'start')}>Start</button>
                  <button className="btn btn-sm" onClick={() => power(s.id, 'restart')}>Restart</button>
                  <button className="btn btn-sm" onClick={() => power(s.id, 'stop')}>Stop</button>
                  <button className="btn btn-sm" onClick={() => rename(s.id)}>Rename</button>
                </td>
              </tr>
            ))}
            {servers.length === 0 && <tr><td colSpan={4} className="muted">Belum ada server.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
