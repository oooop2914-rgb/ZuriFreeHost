'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function Giveaway() {
  const [list, setList] = useState<any[]>([]);
  const [form, setForm] = useState({ title: '', prize: '', requirement: '', min_token: 0, winners_count: 1, ends_at: '' });
  const [msg, setMsg] = useState('');

  async function load() { const r = await apiFetch('/giveaway'); const j = await r.json(); setList(j.giveaways || []); }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const res = await apiFetch('/giveaway', { method: 'POST', body: JSON.stringify({ ...form, ends_at: new Date(form.ends_at).toISOString() }) });
    const j = await res.json();
    setMsg(res.ok ? 'Giveaway dipublish.' : j.error);
    if (res.ok) load();
  }

  return (
    <>
      <div className="card">
        <h3>Buat Giveaway Baru</h3>
        {msg && <p className="msg">{msg}</p>}
        <form onSubmit={create} className="form-grid">
          <div className="field"><label>Nama</label><input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
          <div className="field"><label>Hadiah</label><input required value={form.prize} onChange={e => setForm({ ...form, prize: e.target.value })} /></div>
          <div className="field"><label>Syarat</label><input value={form.requirement} onChange={e => setForm({ ...form, requirement: e.target.value })} placeholder="cth. follow + join discord" /></div>
          <div className="field"><label>Min. token buat ikut</label><input type="number" value={form.min_token} onChange={e => setForm({ ...form, min_token: +e.target.value })} /></div>
          <div className="field"><label>Jumlah pemenang</label><input type="number" value={form.winners_count} onChange={e => setForm({ ...form, winners_count: +e.target.value })} /></div>
          <div className="field"><label>Berakhir</label><input type="datetime-local" required value={form.ends_at} onChange={e => setForm({ ...form, ends_at: e.target.value })} /></div>
          <div className="field" style={{ gridColumn: '1/-1' }}><button className="btn btn-solid" type="submit">Publikasikan</button></div>
        </form>
      </div>
      <div className="card">
        <h3>Giveaway Berjalan & Riwayat</h3>
        <div className="scrollx"><table>
          <thead><tr><th>Nama</th><th>Hadiah</th><th>Berakhir</th><th>Status</th></tr></thead>
          <tbody>
            {list.map(g => (
              <tr key={g.id}>
                <td>{g.title}</td><td>{g.prize}</td>
                <td>{new Date(g.ends_at).toLocaleDateString('id-ID')}</td>
                <td><span className={`pill ${g.status === 'active' ? 'on' : 'off'}`}><span className="dt" />{g.status}</span></td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={4} className="muted">Belum ada giveaway.</td></tr>}
          </tbody>
        </table></div>
      </div>
    </>
  );
}
