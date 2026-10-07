'use client';
import { useEffect, useState } from 'react';
import { Download, Wand2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface EggVar { env_variable: string; name: string; default_value: string; description: string }
interface Egg { egg_id: number; name: string; docker_image: string; startup: string; variables: EggVar[] }
interface Nest { nest_id: number; nest_name: string; eggs: Egg[] }

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function PterodactylConfig() {
  const [types, setTypes] = useState<any[]>([]);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({
    code: '', label: '', egg_id: '', docker_image: '', startup: '',
    cost: 40, memory: 512, disk: 2048, cpu: 60, environment: '{}',
  });

  // Auto-fetch egg dari panel (PLTA)
  const [nests, setNests] = useState<Nest[]>([]);
  const [loadingEggs, setLoadingEggs] = useState(false);
  const [eggError, setEggError] = useState('');
  const [selectedNest, setSelectedNest] = useState('');
  const [selectedEgg, setSelectedEgg] = useState('');

  async function load() { const r = await apiFetch('/server-types/admin'); const j = await r.json(); setTypes(j.types || []); }
  useEffect(() => { load(); }, []);

  async function fetchEggsFromPanel() {
    setLoadingEggs(true); setEggError('');
    const r = await apiFetch('/server-types/eggs');
    const j = await r.json();
    setLoadingEggs(false);
    if (!r.ok) { setEggError(j.error); return; }
    setNests(j.nests || []);
  }

  const activeNest = nests.find(n => String(n.nest_id) === selectedNest);
  const eggOptions = activeNest?.eggs || [];

  function applyEgg(egg: Egg) {
    const env: Record<string, string> = {};
    egg.variables.forEach(v => { if (v.default_value !== null && v.default_value !== undefined) env[v.env_variable] = String(v.default_value); });
    setForm(f => ({
      ...f,
      egg_id: String(egg.egg_id),
      docker_image: egg.docker_image,
      startup: egg.startup,
      environment: JSON.stringify(env, null, 2),
      label: f.label || egg.name,
      code: f.code || slugify(egg.name),
    }));
  }

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
    if (res.ok) { setForm({ ...form, code: '', label: '', egg_id: '', docker_image: '', startup: '', environment: '{}' }); setSelectedEgg(''); load(); }
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <h3 style={{ marginBottom: 2 }}>Auto-fetch Egg dari Panel</h3>
            <p className="sub" style={{ margin: 0 }}>Narik langsung dari Pterodactyl (PLTA) — pilih Nest &amp; Egg, semua field di bawah keisi otomatis.</p>
          </div>
          <button type="button" className="btn btn-solid" onClick={fetchEggsFromPanel} disabled={loadingEggs}>
            <Download size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
            {loadingEggs ? 'Mengambil...' : nests.length ? 'Refresh' : 'Fetch dari Panel'}
          </button>
        </div>
        {eggError && <p className="err">{eggError}</p>}
        {nests.length > 0 && (
          <div className="form-grid">
            <div className="field">
              <label>Nest</label>
              <select value={selectedNest} onChange={e => { setSelectedNest(e.target.value); setSelectedEgg(''); }}>
                <option value="">— pilih nest —</option>
                {nests.map(n => <option key={n.nest_id} value={n.nest_id}>{n.nest_name}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Egg</label>
              <select value={selectedEgg} disabled={!selectedNest} onChange={e => {
                setSelectedEgg(e.target.value);
                const egg = eggOptions.find(x => String(x.egg_id) === e.target.value);
                if (egg) applyEgg(egg);
              }}>
                <option value="">— pilih egg —</option>
                {eggOptions.map(e => <option key={e.egg_id} value={e.egg_id}>{e.name}</option>)}
              </select>
            </div>
            {selectedEgg && (
              <div className="field" style={{ gridColumn: '1/-1' }}>
                <span className="muted" style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Wand2 size={13} /> Egg ID, Docker image, Startup command, dan Environment Variables di form bawah udah keisi otomatis — tinggal cek &amp; sesuaikan harga/limit.
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card">
        <h3>Tambah Tipe Server Baru</h3>
        <p className="sub">Bisa diisi manual juga kalau gak mau pakai auto-fetch di atas.</p>
        {msg && <p className="msg">{msg}</p>}
        <form onSubmit={create} className="form-grid">
          <div className="field"><label>Kode (unik, lowercase)</label><input required value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="cth. golang" /></div>
          <div className="field"><label>Label ditampilin ke user</label><input required value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} placeholder="Go" /></div>
          <div className="field"><label>Egg ID</label><input required type="number" value={form.egg_id} onChange={e => setForm({ ...form, egg_id: e.target.value })} /></div>
          <div className="field"><label>Docker image</label><input required value={form.docker_image} onChange={e => setForm({ ...form, docker_image: e.target.value })} placeholder="ghcr.io/..." /></div>
          <div className="field" style={{ gridColumn: '1/-1' }}><label>Startup command</label><input required value={form.startup} onChange={e => setForm({ ...form, startup: e.target.value })} /></div>
          <div className="field" style={{ gridColumn: '1/-1' }}>
            <label>Environment Variables (JSON)</label>
            <textarea rows={4} value={form.environment} onChange={e => setForm({ ...form, environment: e.target.value })}
              placeholder={'{"MAIN_FILE":"index.js","AUTO_UPDATE":"0"}'}
              style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5 }} />
            <span className="muted" style={{ fontSize: 11.5 }}>Kalau diisi lewat auto-fetch, ini udah otomatis sesuai default value tiap variable di egg-nya.</span>
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
