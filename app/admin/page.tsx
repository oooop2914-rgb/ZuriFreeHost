'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import AppShell from '@/components/AppShell';

type Tab = 'overview' | 'pterodactyl' | 'giveaway' | 'quest' | 'users' | 'servers' | 'broadcast' | 'auditlog';

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('overview');
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    apiFetch('/admin/users').then(res => setAllowed(res.status !== 403));
  }, []);

  if (allowed === false) return <div className="wrap">Akses ditolak — halaman ini khusus admin.</div>;
  if (allowed === null) return <div className="wrap">Loading...</div>;

  const TABS: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'pterodactyl', label: 'Pterodactyl Config' },
    { key: 'broadcast', label: 'Broadcast' },
    { key: 'giveaway', label: 'Giveaway' },
    { key: 'quest', label: 'Quest & Token' },
    { key: 'users', label: 'Manage User' },
    { key: 'servers', label: 'Manage Server' },
    { key: 'auditlog', label: 'Audit Log' },
  ];

  return (
    <AppShell title="Admin Dashboard" isAdmin>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 22 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className="btn btn-sm" style={tab === t.key ? { background: 'var(--accent)', borderColor: 'var(--accent)', color: '#031510' } : {}}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'overview' && <Overview />}
      {tab === 'pterodactyl' && <PterodactylTab />}
      {tab === 'broadcast' && <BroadcastTab />}
      {tab === 'giveaway' && <GiveawayTab />}
      {tab === 'quest' && <QuestTab />}
      {tab === 'users' && <UsersTab />}
      {tab === 'servers' && <ServersTab />}
      {tab === 'auditlog' && <AuditLogTab />}
    </AppShell>
  );
}

// ---------------- Overview ----------------
function Overview() {
  const [stats, setStats] = useState<{ users: number; servers: number } | null>(null);
  const [econ, setEcon] = useState<{ minted: number; spent: number; net: number } | null>(null);
  const [nodes, setNodes] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([apiFetch('/admin/users'), apiFetch('/admin/servers'), apiFetch('/admin/token-economy'), apiFetch('/admin/nodes')])
      .then(async ([u, s, e, n]) => {
        const uj = await u.json(); const sj = await s.json(); const ej = await e.json(); const nj = await n.json();
        setStats({ users: (uj.users || []).length, servers: (sj.servers || []).length });
        setEcon(ej);
        setNodes(nj.nodes || []);
      });
  }, []);

  if (!stats || !econ) return <div className="muted">Loading...</div>;

  return (
    <>
      <div className="kpis">
        <div className="kpi"><div className="lbl">Total user</div><div className="val">{stats.users}</div></div>
        <div className="kpi"><div className="lbl">Total server</div><div className="val">{stats.servers}</div></div>
        <div className="kpi"><div className="lbl">Token minted</div><div className="val" style={{ color: 'var(--accent)' }}>{econ.minted}</div></div>
        <div className="kpi"><div className="lbl">Token spent</div><div className="val" style={{ color: 'var(--gold)' }}>{econ.spent}</div></div>
      </div>
      <div className="card">
        <h3>Status Node Pterodactyl</h3>
        <p className="sub">Real-time dari Application API.</p>
        <div className="scrollx"><table>
          <thead><tr><th>Node</th><th>Lokasi</th><th>Memory</th><th>Disk</th></tr></thead>
          <tbody>
            {nodes.map((n: any) => (
              <tr key={n.attributes.id}>
                <td>{n.attributes.name}</td>
                <td className="muted">{n.attributes.location_id}</td>
                <td>{n.attributes.allocated_resources?.memory || 0} / {n.attributes.memory} MB</td>
                <td>{n.attributes.allocated_resources?.disk || 0} / {n.attributes.disk} MB</td>
              </tr>
            ))}
            {nodes.length === 0 && <tr><td colSpan={4} className="muted">Gak ada data node / API belum konek.</td></tr>}
          </tbody>
        </table></div>
      </div>
    </>
  );
}

// ---------------- Broadcast / Pengumuman ----------------
function BroadcastTab() {
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
          <div key={a.id} className="card" style={{ background: 'var(--panel-2)' }}>
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

// ---------------- Audit Log ----------------
function AuditLogTab() {
  const [logs, setLogs] = useState<any[]>([]);
  useEffect(() => { apiFetch('/admin/audit-log').then(r => r.json()).then(j => setLogs(j.logs || [])); }, []);
  return (
    <div className="card">
      <h3>Riwayat Aksi Admin</h3>
      <div className="scrollx"><table>
        <thead><tr><th>Waktu</th><th>Admin</th><th>Aksi</th><th>Target</th><th>Detail</th></tr></thead>
        <tbody>
          {logs.map(l => (
            <tr key={l.id}>
              <td className="muted" style={{ fontSize: 12 }}>{new Date(l.created_at).toLocaleString('id-ID')}</td>
              <td>{l.profiles?.username}</td>
              <td className="token">{l.action}</td>
              <td className="muted" style={{ fontSize: 12 }}>{l.target}</td>
              <td className="muted" style={{ fontSize: 12 }}>{JSON.stringify(l.detail)}</td>
            </tr>
          ))}
          {logs.length === 0 && <tr><td colSpan={5} className="muted">Belum ada aksi tercatat.</td></tr>}
        </tbody>
      </table></div>
    </div>
  );
}

// ---------------- Pterodactyl Config (Server Types) ----------------
function PterodactylTab() {
  const [types, setTypes] = useState<any[]>([]);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({
    code: '', label: '', egg_id: '', docker_image: '', startup: '',
    cost: 40, memory: 512, disk: 2048, cpu: 60,
  });

  async function load() { const r = await apiFetch('/server-types/admin'); const j = await r.json(); setTypes(j.types || []); }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      code: form.code, label: form.label, egg_id: +form.egg_id, docker_image: form.docker_image, startup: form.startup,
      environment: {}, limits: { memory: +form.memory, swap: 0, disk: +form.disk, io: 500, cpu: +form.cpu }, cost: +form.cost,
    };
    const res = await apiFetch('/server-types', { method: 'POST', body: JSON.stringify(payload) });
    const j = await res.json();
    setMsg(res.ok ? 'Tipe server ditambahin.' : j.error);
    if (res.ok) load();
  }
  async function toggle(id: string, active: boolean) {
    await apiFetch(`/server-types/${id}`, { method: 'PATCH', body: JSON.stringify({ active }) });
    load();
  }
  async function updateCost(id: string, cost: number) {
    await apiFetch(`/server-types/${id}`, { method: 'PATCH', body: JSON.stringify({ cost }) });
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
                  <input type="number" defaultValue={t.cost} style={{ width: 70, background: 'var(--panel-2)', border: '1px solid var(--line)', borderRadius: 4, color: 'var(--text)', padding: '4px 6px', fontSize: 12 }}
                    onBlur={e => updateCost(t.id, +e.target.value)} />
                </td>
                <td className="muted" style={{ fontSize: 12 }}>{t.limits?.memory}MB / {t.limits?.disk}MB disk</td>
                <td><span className={`pill ${t.active ? 'on' : 'off'}`}><span className="dt" />{t.active ? 'aktif' : 'nonaktif'}</span></td>
                <td style={{ display: 'flex', gap: 6 }}>
                  {t.active
                    ? <button className="btn btn-sm" onClick={() => toggle(t.id, false)}>Nonaktifkan</button>
                    : <button className="btn btn-sm" onClick={() => toggle(t.id, true)}>Aktifkan</button>}
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

// ---------------- VPS NAT ----------------
function GiveawayTab() {
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

// ---------------- Quest Config ----------------
function QuestTab() {
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

// ---------------- Manage User ----------------
function UsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  async function load() { const r = await apiFetch('/admin/users'); const j = await r.json(); setUsers(j.users || []); }
  useEffect(() => { load(); }, []);
  async function setStatus(user_id: string, status: string) {
    await apiFetch('/admin/users', { method: 'PATCH', body: JSON.stringify({ user_id, status }) });
    load();
  }
  async function setRole(user_id: string, role: string) {
    await apiFetch('/admin/users', { method: 'PATCH', body: JSON.stringify({ user_id, role }) });
    load();
  }
  return (
    <div className="card">
      <h3>Manage User</h3>
      <div className="scrollx"><table>
        <thead><tr><th>Username</th><th>Token</th><th>Role</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.username}</td><td className="token">{u.token_balance}</td>
              <td><span className={`pill ${u.role === 'admin' ? 'warn' : 'off'}`}><span className="dt" />{u.role}</span></td>
              <td><span className={`pill ${u.status === 'active' ? 'on' : u.status === 'warned' ? 'warn' : 'off'}`}><span className="dt" />{u.status}</span></td>
              <td style={{ display: 'flex', gap: 6 }}>
                {u.status !== 'banned'
                  ? <button className="btn btn-sm btn-danger" onClick={() => setStatus(u.id, 'banned')}>Ban</button>
                  : <button className="btn btn-sm" onClick={() => setStatus(u.id, 'active')}>Unban</button>}
                {u.role !== 'admin'
                  ? <button className="btn btn-sm" onClick={() => setRole(u.id, 'admin')}>Jadikan admin</button>
                  : <button className="btn btn-sm" onClick={() => setRole(u.id, 'user')}>Cabut admin</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </div>
  );
}

// ---------------- Manage Server ----------------
function ServersTab() {
  const [servers, setServers] = useState<any[]>([]);
  async function load() { const r = await apiFetch('/admin/servers'); const j = await r.json(); setServers(j.servers || []); }
  useEffect(() => { load(); }, []);
  async function del(id: string) {
    if (!confirm('Hapus server ini?')) return;
    await apiFetch(`/servers/${id}`, { method: 'DELETE' });
    load();
  }
  async function power(id: string, signal: string) {
    await apiFetch(`/admin/servers/${id}/power`, { method: 'POST', body: JSON.stringify({ signal }) });
  }
  return (
    <div className="card">
      <h3>Semua Server User</h3>
      <div className="scrollx"><table>
        <thead><tr><th>Nama</th><th>Owner</th><th>Tipe</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {servers.map(s => (
            <tr key={s.id}>
              <td className="token">{s.name}</td><td>{s.profiles?.username}</td><td>{s.type}</td>
              <td><span className={`pill ${s.status === 'online' ? 'on' : 'off'}`}><span className="dt" />{s.status}</span></td>
              <td style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-sm" onClick={() => power(s.id, 'restart')}>Restart</button>
                <button className="btn btn-sm" onClick={() => power(s.id, 'stop')}>Stop</button>
                <button className="btn btn-sm btn-danger" onClick={() => del(s.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </div>
  );
}
