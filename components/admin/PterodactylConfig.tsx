'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function PterodactylConfig() {
  const [types, setTypes] = useState<any[]>([]);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({
    code: '', label: '', egg_id: '', docker_image: '', startup: '',
    cost: 40, memory: 512, disk: 2048, cpu: 60, environment: '{}',
  });

  async function load() { const r = await apiFetch('/server-types/admin'); const j = await r.json(); setTypes(j.types || []); }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    let env: Record<string, string>;
    try { env = JSON.parse(form.environment || '{}'); }
    catch { setMsg('Environment Variables bukan JSON yang valid, contoh: {"MAIN_FILE":"index.js"}'); return; }
    const payload = {
      code: form.code, label: form.label, egg_id: +form.egg_id, docker_image: form.docker_image, startup: form.startup,
      environment: env, limits: { memory: +form.memory, swap: 0, disk: +form.disk, io: 500, cpu: +form.cpu }, cost: +form.cost,
    };
    const res = await apiFetch('/server-types', { method: 'POST', body: JSON.stringify(payload) });
    const j = await res.json();
    setMsg(res.ok ? 'Tipe server ditambahin.' : j.error);
    if (res.ok) { setForm({ ...form, code: '', label: '', egg_id: '', docker_image: '', startup: '', environment: '{}' }); load(); }
  }
  async function toggle(id: string, active: boolean) {
    await apiFetch(`/server-types/${id}`, { method: 'PATCH', body: JSON.stringify({ active }) });
    load();
  }
  async function updateCost(id: string, cost: number) {
    await apiFetch(`/server-types/${id}`, { method: 'PATCH', body: JSON.stringify({ cost }) });
    load();
  }
  async function editEnv(row: any) {
    const input = prompt(
      `Environment Variables buat "${row.label}" (JSON, nama key harus PERSIS sama kayak di panel):`,
      JSON.stringify(row.environment || {})
    );
    if (input === null) return;
    let env: Record<string, string>;
    try { env = JSON.parse(input); } catch { alert('JSON gak valid.'); return; }
    await apiFetch(`/server-types/${row.id}`, { method: 'PATCH', body: JSON.stringify({ environment: env }) });
    load();
  }
  async function del(id: string) {
    if (!confirm('Hapus tipe server ini? User gak akan bisa claim tipe ini lagi.')) return;
    await apiFetch(`/server-types/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <>
      <div className="card">
        <h3>Tambah Tipe Server Baru</h3>
        <p className="sub">Konfigurasi egg/docker image ambil dari panel Pterodactyl kamu (Admin &gt; Nests and Eggs).</p>
        {msg && <p className="msg">{msg}</p>}
        <form onSubmit={create} className="form-grid">
          <div className="field"><label>Kode (unik, lowercase)</label><input required value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="cth. golang" /></div>
          <div className="field"><label>Label ditampilin ke user</label><input required value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} placeholder="Go" /></div>
          <div className="field"><label>Egg ID</label><input required type="number" value={form.egg_id} onChange={e => setForm({ ...form, egg_id: e.target.value })} /></div>
          <div className="field"><label>Docker image</label><input required value={form.docker_image} onChange={e => setForm({ ...form, docker_image: e.target.value })} placeholder="ghcr.io/..." /></div>
          <div className="field" style={{ gridColumn: '1/-1' }}><label>Startup command</label><input required value={form.startup} onChange={e => setForm({ ...form, startup: e.target.value })} /></div>
          <div className="field" style={{ gridColumn: '1/-1' }}>
            <label>Environment Variables (JSON) — WAJIB isi sesuai variable di egg panel kamu, kalau egg-nya butuh variable</label>
            <textarea rows={3} value={form.environment} onChange={e => setForm({ ...form, environment: e.target.value })}
              placeholder={'{"MAIN_FILE":"index.js","AUTO_UPDATE":"0"}'}
              style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5 }} />
            <span className="muted" style={{ fontSize: 11.5 }}>
              Cek nama variable persis di panel: Admin &gt; Nests &gt; klik egg-nya &gt; bagian Variables &gt; kolom &quot;Environment Variable&quot;.
            </span>
          </div>
          <div className="field"><label>Harga (token)</label><input type="number" value={form.cost} onChange={e => setForm({ ...form, cost: +e.target.value })} /></div>
          <div className="field"><label>RAM (MB)</label><input type="number" value={form.memory} onChange={e => setForm({ ...form, memory: +e.target.value })} /></div>
          <div className="field"><label>Disk (MB)</label><input type="number" value={form.disk} onChange={e => setForm({ ...form, disk: +e.target.value })} /></div>
          <div className="field"><label>CPU (%)</label><input type="number" value={form.cpu} onChange={e => setForm({ ...form, cpu: +e.target.value })} /></div>
          <div className="field" style={{ gridColumn: '1/-1' }}><button className="btn btn-solid" type="submit">Simpan Tipe Server</button></div>
        </form>
      </div>

      <div className="card">
        <h3>Tipe Server Terdaftar</h3>
        <p className="sub">Harga & limit bisa diedit tanpa perlu redeploy backend.</p>
        <div className="scrollx"><table>
          <thead><tr><th>Label</th><th>Kode</th><th>Egg ID</th><th>Harga</th><th>Limit</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {types.map(t => (
              <tr key={t.id}>
                <td>{t.label}</td>
                <td className="token">{t.code}</td>
                <td className="token">{t.egg_id}</td>
                <td>
                  <input type="number" defaultValue={t.cost} style={{ width: 70, background: 'rgba(255,255,255,.05)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)', padding: '5px 8px', fontSize: 12 }}
                    onBlur={e => updateCost(t.id, +e.target.value)} />
                </td>
                <td className="muted" style={{ fontSize: 12 }}>{t.limits?.memory}MB / {t.limits?.disk}MB disk</td>
                <td><span className={`pill ${t.active ? 'on' : 'off'}`}><span className="dt" />{t.active ? 'aktif' : 'nonaktif'}</span></td>
                <td style={{ display: 'flex', gap: 6 }}>
                  {t.active
                    ? <button className="btn btn-sm" onClick={() => toggle(t.id, false)}>Nonaktifkan</button>
                    : <button className="btn btn-sm" onClick={() => toggle(t.id, true)}>Aktifkan</button>}
                  <button className="btn btn-sm" onClick={() => editEnv(t)}>Edit Env</button>
                  <button className="btn btn-sm btn-danger" onClick={() => del(t.id)}>Hapus</button>
                </td>
              </tr>
            ))}
            {types.length === 0 && <tr><td colSpan={7} className="muted">Belum ada tipe server.</td></tr>}
          </tbody>
        </table></div>
      </div>
    </>
  );
}
