'use client';
import { useEffect, useState } from 'react';
import { Wrench, Server, Megaphone } from 'lucide-react';
import { apiFetch } from '@/lib/api';

type MaintState = { enabled: boolean; message: string; scheduled_end: string | null };

function MaintenanceBlock({ title, icon, stateKey, state, onSaved }: {
  title: string; icon: React.ReactNode; stateKey: string; state: MaintState; onSaved: () => void;
}) {
  const [msg, setMsg] = useState(state.message || '');
  const [end, setEnd] = useState(state.scheduled_end ? state.scheduled_end.slice(0, 16) : '');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState('');

  async function save(enabled: boolean) {
    setBusy(true); setResult('');
    const res = await apiFetch(`/settings/${stateKey}`, {
      method: 'PATCH',
      body: JSON.stringify({ enabled, message: msg, scheduled_end: end ? new Date(end).toISOString() : null }),
    });
    const j = await res.json();
    setBusy(false);
    if (j.affected !== undefined) setResult(`${j.affected} server diproses${j.failed ? `, ${j.failed} gagal` : ''}.`);
    onSaved();
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div className="icon-tile">{icon}</div>
        <div>
          <h3 style={{ marginBottom: 2 }}>{title}</h3>
          <span className={`pill ${state.enabled ? 'warn' : 'on'}`}><span className="dt" />{state.enabled ? 'AKTIF' : 'Nonaktif'}</span>
        </div>
      </div>
      <div className="field"><label>Pesan custom</label><textarea rows={2} value={msg} onChange={e => setMsg(e.target.value)} /></div>
      <div className="field"><label>Auto-off terjadwal (opsional)</label><input type="datetime-local" value={end} onChange={e => setEnd(e.target.value)} /></div>
      {result && <p className="msg">{result}</p>}
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn" disabled={busy} onClick={() => save(false)}>Matikan</button>
        <button className="btn btn-danger" disabled={busy} onClick={() => save(true)}>Aktifkan</button>
      </div>
    </div>
  );
}

function RegistrationToggle({ enabled, onSaved }: { enabled: boolean; onSaved: () => void }) {
  async function toggle(v: boolean) {
    await apiFetch('/settings/registration', { method: 'PATCH', body: JSON.stringify({ enabled: v }) });
    onSaved();
  }
  return (
    <div className="card">
      <h3>Pendaftaran User Baru</h3>
      <p className="sub">Matiin sementara kalau kapasitas penuh.</p>
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn" style={enabled ? { background: 'var(--accent)', borderColor: 'var(--accent)', color: '#04121a' } : {}} onClick={() => toggle(true)}>Buka</button>
        <button className="btn" style={!enabled ? { background: 'var(--red)', borderColor: 'var(--red)', color: '#2a0a0a' } : {}} onClick={() => toggle(false)}>Tutup</button>
      </div>
    </div>
  );
}

const STYLE_COLOR: Record<string, string> = { info: '#3B82F6', warning: '#F59E0B', danger: '#EF4444', success: '#10B981' };

function AnnouncementManager() {
  const [list, setList] = useState<any[]>([]);
  const [form, setForm] = useState({
    type: 'banner', title: '', message: '', image_url: '', cta_text: '', cta_link: '',
    type_style: 'info', target: 'all', dismissible: true, frequency: 'always', frequency_days: 1, duration_hours: '',
  });
  const [msg, setMsg] = useState('');

  async function load() { const r = await apiFetch('/announcements/admin/all'); setList((await r.json()).announcements || []); }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...form, duration_hours: form.duration_hours ? Number(form.duration_hours) : null, frequency_days: Number(form.frequency_days) };
    const res = await apiFetch('/announcements', { method: 'POST', body: JSON.stringify(payload) });
    const j = await res.json();
    setMsg(res.ok ? 'Pengumuman dibuat.' : j.error);
    if (res.ok) load();
  }
  async function toggle(id: string, enabled: boolean) {
    await apiFetch(`/announcements/${id}`, { method: 'PATCH', body: JSON.stringify({ enabled }) });
    load();
  }

  return (
    <>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div className="icon-tile"><Megaphone size={22} /></div>
          <h3 style={{ margin: 0 }}>Buat Pengumuman</h3>
        </div>
        {msg && <p className="msg">{msg}</p>}
        <form onSubmit={create} className="form-grid">
          <div className="field"><label>Tipe</label>
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              <option value="banner">Banner (strip di atas dashboard)</option>
              <option value="popup">Popup (modal)</option>
            </select>
          </div>
          <div className="field"><label>Gaya warna</label>
            <select value={form.type_style} onChange={e => setForm({ ...form, type_style: e.target.value })}>
              <option value="info">Info</option><option value="warning">Warning</option><option value="danger">Danger</option><option value="success">Success</option>
            </select>
          </div>
          <div className="field" style={{ gridColumn: '1/-1' }}><label>Judul</label><input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
          <div className="field" style={{ gridColumn: '1/-1' }}><label>Pesan</label><textarea rows={3} required value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} /></div>
          {form.type === 'popup' && <div className="field" style={{ gridColumn: '1/-1' }}><label>URL gambar (opsional)</label><input value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} /></div>}
          <div className="field"><label>Teks tombol CTA (opsional)</label><input value={form.cta_text} onChange={e => setForm({ ...form, cta_text: e.target.value })} /></div>
          <div className="field"><label>Link tombol CTA</label><input value={form.cta_link} onChange={e => setForm({ ...form, cta_link: e.target.value })} /></div>
          <div className="field"><label>Target</label>
            <select value={form.target} onChange={e => setForm({ ...form, target: e.target.value })}>
              <option value="all">Semua user</option>
              <option value="role:verified">Verified</option>
              <option value="role:creator">Content Creator</option>
              <option value="role:mods">Moderator</option>
            </select>
          </div>
          {form.type === 'popup' && (
            <div className="field"><label>Frekuensi tampil</label>
              <select value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value })}>
                <option value="once">Sekali doang</option>
                <option value="every_login">Tiap login</option>
                <option value="every_x_days">Tiap X hari</option>
              </select>
            </div>
          )}
          {form.type === 'popup' && form.frequency === 'every_x_days' && (
            <div className="field"><label>X hari</label><input type="number" value={form.frequency_days} onChange={e => setForm({ ...form, frequency_days: Number(e.target.value) })} /></div>
          )}
          <div className="field"><label>Durasi aktif (jam, kosongin = gak expire)</label><input type="number" value={form.duration_hours} onChange={e => setForm({ ...form, duration_hours: e.target.value })} /></div>
          {form.type === 'banner' && (
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, gridColumn: '1/-1' }}>
              <input type="checkbox" checked={form.dismissible} onChange={e => setForm({ ...form, dismissible: e.target.checked })} /> Bisa di-dismiss user
            </label>
          )}
          <div className="field" style={{ gridColumn: '1/-1' }}><button className="btn btn-solid" type="submit">Publikasikan</button></div>
        </form>
      </div>

      <div className="card">
        <h3>Semua Pengumuman</h3>
        <div className="scrollx"><table>
          <thead><tr><th>Judul</th><th>Tipe</th><th>Target</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {list.map(a => (
              <tr key={a.id}>
                <td>{a.title}</td>
                <td><span className="pill" style={{ color: STYLE_COLOR[a.type_style], borderColor: STYLE_COLOR[a.type_style] }}>{a.type}</span></td>
                <td className="muted" style={{ fontSize: 12 }}>{a.target}</td>
                <td><span className={`pill ${a.enabled ? 'on' : 'off'}`}><span className="dt" />{a.enabled ? 'aktif' : 'nonaktif'}</span></td>
                <td>{a.enabled
                  ? <button className="btn btn-sm" onClick={() => toggle(a.id, false)}>Nonaktifkan</button>
                  : <button className="btn btn-sm" onClick={() => toggle(a.id, true)}>Aktifkan</button>}</td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={5} className="muted">Belum ada pengumuman.</td></tr>}
          </tbody>
        </table></div>
      </div>
    </>
  );
}

export default function SystemControl() {
  const [settings, setSettings] = useState<any>(null);
  async function load() { const r = await apiFetch('/settings'); setSettings((await r.json()).settings); }
  useEffect(() => { load(); }, []);
  if (!settings) return <div className="muted">Loading...</div>;

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, marginBottom: 16 }}>
        <MaintenanceBlock title="Maintenance Mode (Platform)" icon={<Wrench size={22} />} stateKey="maintenance_mode" state={settings.maintenance_mode} onSaved={load} />
        <MaintenanceBlock title="Maintenance Server" icon={<Server size={22} />} stateKey="maintenance_server" state={settings.maintenance_server} onSaved={load} />
      </div>
      <RegistrationToggle enabled={settings.registration?.enabled} onSaved={load} />
      <AnnouncementManager />
    </>
  );
}
