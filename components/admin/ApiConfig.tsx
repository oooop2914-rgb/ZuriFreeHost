'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { CircleCheck, CircleX, KeyRound, Cloud } from 'lucide-react';

type Field = { key: string; label: string; help: string; placeholder?: string; number?: boolean };

const PTERO_FIELDS: Field[] = [
  { key: 'panel_url', label: 'Domain panel Pterodactyl', help: 'Alamat panel kamu, pakai https. Contoh: https://panel.domainkamu.com', placeholder: 'https://panel.domainkamu.com' },
  { key: 'ptero_app_key', label: 'PLTA (Application API key)', help: 'Dari panel: Admin > Application API. Awalannya ptla_' },
  { key: 'ptero_client_key', label: 'PLTC (Client API key)', help: 'Dari akun owner di panel: Account > API Credentials. Awalannya ptlc_. Dipakai buat start/stop/restart.' },
  { key: 'ptero_owner_id', label: 'ID user owner', help: 'ID user panel yang jadi pemilik semua server hasil deploy', number: true },
  { key: 'ptero_default_node_id', label: 'ID node default', help: 'Node tujuan deploy server baru', number: true },
];

const CF_FIELDS: Field[] = [
  { key: 'cf_api_token', label: 'Cloudflare API token', help: 'Buat di Cloudflare: My Profile > API Tokens, permission Zone > DNS > Edit untuk zone kamu.' },
  { key: 'cf_zone_id', label: 'Zone ID', help: 'Ada di halaman Overview domain di Cloudflare (sisi kanan bawah).' },
  { key: 'cf_base_domain', label: 'Base domain subdomain', help: 'Subdomain user jadi nama.<base domain>. Contoh: zurihost.my.id', placeholder: 'zurihost.my.id' },
  { key: 'subdomain_max_per_user', label: 'Maks subdomain per user', help: 'Batas subdomain custom per akun (subdomain panel dari fitur install gak dihitung)', number: true },
];

export default function ApiConfig() {
  const [config, setConfig] = useState<any>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState('');
  const [ok, setOk] = useState(true);
  const [panelTest, setPanelTest] = useState<any>(null);
  const [cfTest, setCfTest] = useState<any>(null);
  const [testing, setTesting] = useState('');

  async function load() { const r = await apiFetch('/admin/config'); setConfig((await r.json()).config); }
  useEffect(() => { load(); }, []);

  async function save() {
    const body: Record<string, string> = {};
    Object.entries(form).forEach(([k, v]) => { if (v !== undefined) body[k] = v; });
    if (Object.keys(body).length === 0) { setOk(true); setMsg('Gak ada perubahan.'); return; }
    const res = await apiFetch('/admin/config', { method: 'PATCH', body: JSON.stringify(body) });
    const j = await res.json();
    setOk(res.ok);
    setMsg(res.ok ? 'Konfigurasi tersimpan.' : j.error);
    if (res.ok) { setForm({}); load(); }
  }

  async function testPanel() {
    setTesting('panel'); setPanelTest(null);
    const r = await apiFetch('/admin/config/test-panel', { method: 'POST' });
    setPanelTest(await r.json()); setTesting('');
  }
  async function testCf() {
    setTesting('cf'); setCfTest(null);
    const r = await apiFetch('/admin/config/test-cloudflare', { method: 'POST' });
    setCfTest(await r.json()); setTesting('');
  }

  if (!config) return <div className="muted">Loading...</div>;

  function renderField(f: Field) {
    const c = config[f.key] || {};
    return (
      <div className="field" key={f.key}>
        <label style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          <span>{f.label}</span>
          <span className={`pill ${c.source === 'kosong' ? 'off' : c.source === 'env' ? 'warn' : 'on'}`} style={{ fontSize: 10 }}>{c.source}</span>
        </label>
        {c.secret ? (
          <input type="password" autoComplete="off" value={form[f.key] ?? ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
            placeholder={c.set ? `${c.hint} (tersimpan, kosongkan kalau gak diubah)` : 'Belum diisi'} />
        ) : (
          <input type={f.number ? 'number' : 'text'} value={form[f.key] ?? c.value ?? ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder} />
        )}
        <span className="muted" style={{ fontSize: 11.5 }}>{f.help}</span>
      </div>
    );
  }

  return (
    <>
      <div className="notice info" style={{ marginBottom: 16 }}>
        Nilai di sini disimpan di database dan dipakai backend langsung, jadi gak perlu edit .env atau restart.
        Label <b>env</b> artinya nilainya masih diambil dari file .env sebagai cadangan.
      </div>
      {msg && <p className="msg" style={{ color: ok ? 'var(--accent)' : 'var(--red)' }}>{msg}</p>}

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div className="icon-tile"><KeyRound size={22} /></div>
          <div><h3 style={{ marginBottom: 2 }}>Pterodactyl</h3><p className="sub" style={{ margin: 0 }}>Koneksi backend ke panel kamu.</p></div>
        </div>
        <div className="form-grid">{PTERO_FIELDS.map(renderField)}</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
          <button className="btn btn-solid" onClick={save}>Simpan</button>
          <button className="btn" disabled={testing === 'panel'} onClick={testPanel}>{testing === 'panel' ? 'Mengetes...' : 'Test Koneksi Panel'}</button>
        </div>
        {panelTest && (
          <div style={{ marginTop: 14 }}>
            {(['application', 'client'] as const).map(k => (
              <div key={k} className="kv">
                <span className="k">{k === 'application' ? 'PLTA (Application)' : 'PLTC (Client)'}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: panelTest[k]?.ok ? 'var(--accent)' : 'var(--red)' }}>
                  {panelTest[k]?.ok ? <CircleCheck size={15} /> : <CircleX size={15} />}
                  <span style={{ fontSize: 12.5, textAlign: 'right' }}>{panelTest[k]?.ok ? 'Tersambung' : panelTest[k]?.error}</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div className="icon-tile gold"><Cloud size={22} /></div>
          <div><h3 style={{ marginBottom: 2 }}>Cloudflare (Subdomain Otomatis)</h3><p className="sub" style={{ margin: 0 }}>Dipakai buat bikin DNS record subdomain user dan panel hasil install.</p></div>
        </div>
        <div className="form-grid">{CF_FIELDS.map(renderField)}</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
          <button className="btn btn-solid" onClick={save}>Simpan</button>
          <button className="btn" disabled={testing === 'cf'} onClick={testCf}>{testing === 'cf' ? 'Mengetes...' : 'Test Koneksi Cloudflare'}</button>
        </div>
        {cfTest && (
          <div style={{ marginTop: 14 }}>
            <div className="kv">
              <span className="k">Cloudflare</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: cfTest.ok ? 'var(--accent)' : 'var(--red)' }}>
                {cfTest.ok ? <CircleCheck size={15} /> : <CircleX size={15} />}
                <span style={{ fontSize: 12.5, textAlign: 'right' }}>{cfTest.ok ? `Zone: ${cfTest.zone_name} (${cfTest.status})` : cfTest.error}</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
