'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function Quest() {
  const [quests, setQuests] = useState<any[]>([]);
  const [form, setForm] = useState({ code: '', title: '', description: '', reward: 10, frequency: 'daily' });
  const [msg, setMsg] = useState('');

  async function load() { const r = await apiFetch('/admin/quests'); const j = await r.json(); setQuests(j.quests || []); }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const res = await apiFetch('/admin/quests', { method: 'POST', body: JSON.stringify(form) });
    const j = await res.json();
    setMsg(res.ok ? 'Quest dibuat.' : j.error);
    if (res.ok) load();
  }
  async function toggle(id: string, active: boolean) {
    await apiFetch(`/admin/quests/${id}`, { method: 'PATCH', body: JSON.stringify({ active }) });
    load();
  }

  return (
    <>
      <div className="card">
        <h3>Buat Quest Baru</h3>
        {msg && <p className="msg">{msg}</p>}
        <form onSubmit={create} className="form-grid">
          <div className="field"><label>Kode (unik)</label><input required value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="cth. share_showcase" /></div>
          <div className="field"><label>Judul</label><input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
          <div className="field" style={{ gridColumn: '1/-1' }}><label>Deskripsi</label><input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          <div className="field"><label>Reward (token)</label><input type="number" value={form.reward} onChange={e => setForm({ ...form, reward: +e.target.value })} /></div>
          <div className="field"><label>Frekuensi</label>
            <select value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value })}>
              <option value="daily">Harian</option><option value="weekly">Mingguan</option><option value="once">Sekali</option>
            </select>
          </div>
          <div className="field" style={{ gridColumn: '1/-1' }}><button className="btn btn-solid" type="submit">Simpan Quest</button></div>
        </form>
      </div>
      <div className="card">
        <h3>Semua Quest</h3>
        <div className="scrollx"><table>
          <thead><tr><th>Judul</th><th>Kode</th><th>Reward</th><th>Frekuensi</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {quests.map(q => (
              <tr key={q.id}>
                <td>{q.title}</td><td className="token">{q.code}</td><td className="token">{q.reward}</td><td>{q.frequency}</td>
                <td><span className={`pill ${q.active ? 'on' : 'off'}`}><span className="dt" />{q.active ? 'aktif' : 'nonaktif'}</span></td>
                <td>{q.active
                  ? <button className="btn btn-sm btn-danger" onClick={() => toggle(q.id, false)}>Nonaktifkan</button>
                  : <button className="btn btn-sm" onClick={() => toggle(q.id, true)}>Aktifkan</button>}</td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>
    </>
  );
}
