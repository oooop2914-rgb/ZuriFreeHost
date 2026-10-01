'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function InstallsAdmin() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [detail, setDetail] = useState<any>(null);

  async function load() { const r = await apiFetch('/installs/admin/all'); setJobs((await r.json()).jobs || []); }
  useEffect(() => { load(); const t = setInterval(load, 8000); return () => clearInterval(t); }, []);

  async function view(id: string) {
    if (open === id) { setOpen(null); setDetail(null); return; }
    setOpen(id); setDetail(null);
    const r = await apiFetch(`/installs/${id}`);
    setDetail((await r.json()).job);
  }

  return (
    <>
      <div className="card">
        <h3>Job Install Pterodactyl</h3>
        <p className="sub">Otomatis refresh tiap 8 detik. Kredensial admin panel milik user tidak ditampilkan di sini.</p>
        <div className="scrollx"><table>
          <thead><tr><th>Waktu</th><th>User</th><th>IP VPS</th><th>Panel</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {jobs.map(j => (
              <tr key={j.id}>
                <td className="muted" style={{ fontSize: 12 }}>{new Date(j.created_at).toLocaleString('id-ID')}</td>
                <td>{j.profiles?.username}</td>
                <td className="mono" style={{ fontSize: 12 }}>{j.host}</td>
                <td className="token">{j.fqdn}</td>
                <td><span className={`pill ${j.status === 'done' ? 'on' : j.status === 'failed' ? 'off' : 'warn'}`}><span className="dt" />{j.status === 'running' || j.status === 'queued' ? (j.step || j.status) : j.status}</span></td>
                <td><button className="btn btn-sm" onClick={() => view(j.id)}>{open === j.id ? 'Tutup' : 'Log'}</button></td>
              </tr>
            ))}
            {jobs.length === 0 && <tr><td colSpan={6} className="muted">Belum ada job.</td></tr>}
          </tbody>
        </table></div>
      </div>
      {open && (
        <div className="card">
          <h3>Log</h3>
          <div className="log-box">{detail ? (detail.log || 'Log kosong.') : 'Memuat...'}</div>
        </div>
      )}
    </>
  );
}
