'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function ServiceRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  async function load() { const r = await apiFetch('/services/admin/requests'); setRequests((await r.json()).requests || []); }
  useEffect(() => { load(); }, []);
  async function setStatus(id: string, status: string) {
    await apiFetch(`/services/admin/requests/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
    load();
  }
  return (
    <div className="card">
      <h3>Request Layanan Masuk</h3>
      <p className="sub">Subdomain & install Pterodactyl diproses manual — tandain selesai di sini.</p>
      <div className="scrollx"><table>
        <thead><tr><th>User</th><th>Layanan</th><th>Catatan</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {requests.map(r => (
            <tr key={r.id}>
              <td>{r.profiles?.username}</td><td className="token">{r.service_code}</td>
              <td className="muted" style={{ fontSize: 12 }}>{r.note || '-'}</td>
              <td><span className={`pill ${r.status === 'done' ? 'on' : r.status === 'rejected' ? 'off' : 'warn'}`}><span className="dt" />{r.status}</span></td>
              <td style={{ display: 'flex', gap: 6 }}>
                {r.status === 'pending' && <>
                  <button className="btn btn-sm" onClick={() => setStatus(r.id, 'done')}>Tandai Selesai</button>
                  <button className="btn btn-sm btn-danger" onClick={() => setStatus(r.id, 'rejected')}>Tolak</button>
                </>}
              </td>
            </tr>
          ))}
          {requests.length === 0 && <tr><td colSpan={5} className="muted">Belum ada request.</td></tr>}
        </tbody>
      </table></div>
    </div>
  );
}
