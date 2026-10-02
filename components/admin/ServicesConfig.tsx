'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function ServicesConfig() {
  const [services, setServices] = useState<any[]>([]);
  const [form, setForm] = useState({ code: '', label: '', description: '', cost: 10 });
  const [msg, setMsg] = useState('');

  async function load() { const r = await apiFetch('/services'); setServices((await r.json()).services || []); }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const res = await apiFetch('/services', { method: 'POST', body: JSON.stringify(form) });
    const j = await res.json();
    setMsg(res.ok ? 'Layanan ditambahin.' : j.error);
    if (res.ok) { setForm({ code: '', label: '', description: '', cost: 10 }); load(); }
  }
  async function updateCost(id: string, cost: number) {
    await apiFetch(`/services/${id}`, { method: 'PATCH', body: JSON.stringify({ cost }) });
    load();
  }
  async function toggle(id: string, active: boolean) {
    await apiFetch(`/services/${id}`, { method: 'PATCH', body: JSON.stringify({ active }) });
    load();
  }

  return (
    <>
      <div className="card">
        <h3>Tambah Layanan Baru</h3>
        {msg && <p className="msg">{msg}</p>}
        <form onSubmit={create} className="form-grid">
          <div className="field"><label>Kode (unik)</label><input required value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="cth. ssl_custom" /></div>
          <div className="field"><label>Label</label><input required value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} /></div>
          <div className="field" style={{ gridColumn: '1/-1' }}><label>Deskripsi</label><input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          <div className="field"><label>Harga (token)</label><input type="number" value={form.cost} onChange={e => setForm({ ...form, cost: +e.target.value })} /></div>
          <div className="field" style={{ gridColumn: '1/-1' }}><button className="btn btn-solid" type="submit">Simpan</button></div>
        </form>
      </div>
      <div className="card">
        <h3>Layanan Terdaftar</h3>
        <p className="sub">Termasuk Subdomain (75) & Install Pterodactyl (15) — harga bisa diedit langsung.</p>
        <div className="scrollx"><table>
          <thead><tr><th>Label</th><th>Kode</th><th>Harga</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {services.map(s => (
              <tr key={s.id}>
                <td>{s.label}</td><td className="token">{s.code}</td>
                <td><input type="number" defaultValue={s.cost} style={{ width: 70, background: 'rgba(255,255,255,.05)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)', padding: '5px 8px', fontSize: 12 }} onBlur={e => updateCost(s.id, +e.target.value)} /></td>
                <td><span className={`pill ${s.active ? 'on' : 'off'}`}><span className="dt" />{s.active ? 'aktif' : 'nonaktif'}</span></td>
                <td>{s.active ? <button className="btn btn-sm" onClick={() => toggle(s.id, false)}>Nonaktifkan</button> : <button className="btn btn-sm" onClick={() => toggle(s.id, true)}>Aktifkan</button>}</td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>
    </>
  );
}
