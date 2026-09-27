'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function Claim() {
  const [types, setTypes] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    const [tRes, svcRes, reqRes] = await Promise.all([apiFetch('/server-types'), apiFetch('/services'), apiFetch('/services/mine')]);
    setTypes((await tRes.json()).types || []);
    setServices((await svcRes.json()).services || []);
    setRequests((await reqRes.json()).requests || []);
  }
  useEffect(() => { load(); }, []);

  async function claimServer(type: string) {
    setBusy(true); setMsg('');
    const name = `${type}-${Math.random().toString(36).slice(2, 7)}`;
    const res = await apiFetch('/servers', { method: 'POST', body: JSON.stringify({ type, name }) });
    const j = await res.json();
    setBusy(false);
    setMsg(res.ok ? `Server "${name}" lagi di-deploy.` : j.error);
    load();
  }

  async function claimService(code: string) {
    const note = prompt('Catatan buat admin (opsional, misal nama domain yang diinginkan):') || '';
    setBusy(true); setMsg('');
    const res = await apiFetch('/services/claim', { method: 'POST', body: JSON.stringify({ code, note }) });
    const j = await res.json();
    setBusy(false);
    setMsg(res.ok ? 'Request dikirim, admin bakal proses manual.' : j.error);
    load();
  }

  return (
    <>
      {msg && <div className="card msg">{msg}</div>}
      <div className="card">
        <h3>Claim Server</h3>
        <p className="sub">Langsung deploy otomatis ke Pterodactyl.</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {types.map(t => (
            <button key={t.code} disabled={busy} className="btn btn-solid" onClick={() => claimServer(t.code)}>{t.label} — {t.cost} token</button>
          ))}
          {types.length === 0 && <p className="muted">Belum ada tipe server tersedia.</p>}
        </div>
      </div>

      <div className="card">
        <h3>Layanan Lain</h3>
        <p className="sub">Diproses manual sama admin (bukan otomatis).</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {services.map(s => (
            <button key={s.code} disabled={busy} className="btn" onClick={() => claimService(s.code)}>{s.label} — {s.cost} token</button>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>Riwayat Request Layanan</h3>
        <div className="scrollx"><table>
          <thead><tr><th>Layanan</th><th>Catatan</th><th>Status</th><th>Waktu</th></tr></thead>
          <tbody>
            {requests.map(r => (
              <tr key={r.id}>
                <td className="token">{r.service_code}</td>
                <td className="muted" style={{ fontSize: 12 }}>{r.note || '-'}</td>
                <td><span className={`pill ${r.status === 'done' ? 'on' : r.status === 'rejected' ? 'off' : 'warn'}`}><span className="dt" />{r.status}</span></td>
                <td className="muted" style={{ fontSize: 12 }}>{new Date(r.created_at).toLocaleString('id-ID')}</td>
              </tr>
            ))}
            {requests.length === 0 && <tr><td colSpan={4} className="muted">Belum ada request.</td></tr>}
          </tbody>
        </table></div>
      </div>
    </>
  );
}
