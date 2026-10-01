'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function AuditLog() {
  const [logs, setLogs] = useState<any[]>([]);
  useEffect(() => { apiFetch('/admin/audit-log').then(r => r.json()).then(j => setLogs(j.logs || [])); }, []);
  return (
    <div className="card">
      <h3>Riwayat Aksi Admin</h3>
      <div className="scrollx"><table>
        <thead><tr><th>Waktu</th><th>Admin</th><th>Aksi</th><th>Target</th><th>Detail</th></tr></thead>
        <tbody>
          {logs.map(l => (
            <tr key={l.id}>
              <td className="muted" style={{ fontSize: 12 }}>{new Date(l.created_at).toLocaleString('id-ID')}</td>
              <td>{l.profiles?.username}</td>
              <td className="token">{l.action}</td>
              <td className="muted" style={{ fontSize: 12 }}>{l.target}</td>
              <td className="muted" style={{ fontSize: 12 }}>{JSON.stringify(l.detail)}</td>
            </tr>
          ))}
          {logs.length === 0 && <tr><td colSpan={5} className="muted">Belum ada aksi tercatat.</td></tr>}
        </tbody>
      </table></div>
    </div>
  );
}
