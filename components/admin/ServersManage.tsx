'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function ServersManage() {
  const [servers, setServers] = useState<any[]>([]);
  async function load() { const r = await apiFetch('/admin/servers'); const j = await r.json(); setServers(j.servers || []); }
  useEffect(() => { load(); }, []);
  async function del(id: string) {
    if (!confirm('Hapus server ini?')) return;
    await apiFetch(`/servers/${id}`, { method: 'DELETE' });
    load();
  }
  async function power(id: string, signal: string) {
    await apiFetch(`/admin/servers/${id}/power`, { method: 'POST', body: JSON.stringify({ signal }) });
  }
  return (
    <div className="card">
      <h3>Semua Server User</h3>
      <div className="scrollx"><table>
        <thead><tr><th>Nama</th><th>Owner</th><th>Tipe</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {servers.map(s => (
            <tr key={s.id}>
              <td className="token">{s.name}</td><td>{s.profiles?.username}</td><td>{s.type}</td>
              <td><span className={`pill ${s.status === 'online' ? 'on' : 'off'}`}><span className="dt" />{s.status}</span></td>
              <td style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-sm" onClick={() => power(s.id, 'restart')}>Restart</button>
                <button className="btn btn-sm" onClick={() => power(s.id, 'stop')}>Stop</button>
                <button className="btn btn-sm btn-danger" onClick={() => del(s.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </div>
  );
}
