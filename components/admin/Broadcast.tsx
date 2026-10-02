'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function Broadcast() {
  const [list, setList] = useState<any[]>([]);
  const [form, setForm] = useState({ title: '', body: '' });
  const [msg, setMsg] = useState('');

  async function load() { const r = await apiFetch('/announcements'); const j = await r.json(); setList(j.announcements || []); }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const res = await apiFetch('/announcements', { method: 'POST', body: JSON.stringify(form) });
    const j = await res.json();
    setMsg(res.ok ? 'Pengumuman dipublish.' : j.error);
    if (res.ok) { setForm({ title: '', body: '' }); load(); }
  }
  async function close(id: string) {
    await apiFetch(`/announcements/${id}`, { method: 'PATCH', body: JSON.stringify({ active: false }) });
    load();
  }

  return (
    <>
      <div className="card">
        <h3>Buat Pengumuman Baru</h3>
        <p className="sub">Muncul sebagai banner di dashboard semua user.</p>
        {msg && <p className="msg">{msg}</p>}
        <form onSubmit={create}>
          <div className="field"><label>Judul</label><input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
          <div className="field"><label>Isi</label><textarea required rows={3} value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} /></div>
          <button className="btn btn-solid" type="submit">Publikasikan</button>
        </form>
      </div>
      <div className="card">
        <h3>Pengumuman Aktif</h3>
        {list.map(a => (
          <div key={a.id} className="card" style={{ background: 'rgba(255,255,255,.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <b>{a.title}</b>
              <button className="btn btn-sm btn-danger" onClick={() => close(a.id)}>Tutup</button>
            </div>
            <p className="muted" style={{ fontSize: 13, marginTop: 6 }}>{a.body}</p>
          </div>
        ))}
        {list.length === 0 && <p className="muted">Belum ada pengumuman aktif.</p>}
      </div>
    </>
  );
}
