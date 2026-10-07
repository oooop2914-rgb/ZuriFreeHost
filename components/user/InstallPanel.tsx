'use client';
import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { HardDriveDownload, CircleCheck, CircleX, LoaderCircle, Copy } from 'lucide-react';

const ACTIVE = ['queued', 'running'];

export default function InstallPanel() {
  const [info, setInfo] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [form, setForm] = useState({ host: '', ssh_port: '22', ssh_password: '', label: '', admin_email: '' });
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    const [iRes, jRes] = await Promise.all([apiFetch('/installs/info'), apiFetch('/installs/mine')]);
    setInfo(await iRes.json());
    setJobs((await jRes.json()).jobs || []);
  }
  useEffect(() => { load(); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg('');
    const res = await apiFetch('/installs', { method: 'POST', body: JSON.stringify({ ...form, ssh_port: Number(form.ssh_port) }) });
    const j = await res.json();
    setBusy(false);
    if (!res.ok) { setMsg(j.error); return; }
    setForm({ ...form, ssh_password: '' }); // password gak disimpen di form setelah dikirim
    setSelected(j.job.id);
    load();
  }

  if (!info) return <div className="muted">Loading...</div>;
  const hasActive = jobs.some(j => ACTIVE.includes(j.status));

  return (
    <>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
          <div className="icon-tile gold"><HardDriveDownload size={22} /></div>
          <div>
            <h3 style={{ marginBottom: 2 }}>Install Pterodactyl Otomatis</h3>
            <p className="sub" style={{ margin: 0 }}>
              Harga <span className="token">{info.cost ?? '-'} token</span>, sudah termasuk subdomain gratis dan SSL Let&apos;s Encrypt.
            </p>
          </div>
        </div>

        <div className="notice info" style={{ marginBottom: 12 }}>
          <b>Syarat VPS:</b> VPS baru/kosong (jangan yang sudah ada web server), Ubuntu 20.04 ke atas atau Debian 11 ke atas,
          RAM minimal 1 GB, bisa login root pakai password, dan port 80 + 443 terbuka ke internet.
        </div>
        <div className="notice" style={{ marginBottom: 16 }}>
          <b>Keamanan:</b> password root cuma dipakai sekali buat instalasi dan tidak disimpan. Ganti password root VPS kamu setelah selesai.
          Token baru dipotong setelah VPS lolos pengecekan, dan dikembalikan otomatis kalau instalasi gagal.
        </div>

        {!info.configured && <div className="notice" style={{ marginBottom: 12 }}>Layanan ini belum dikonfigurasi admin (Cloudflare). Coba lagi nanti.</div>}
        {msg && <p className="msg" style={{ color: 'var(--red)' }}>{msg}</p>}

        <form onSubmit={submit} className="form-grid">
          <div className="field"><label>IP VPS (IPv4 publik)</label>
            <input required value={form.host} onChange={e => setForm({ ...form, host: e.target.value })} placeholder="203.0.113.10" /></div>
          <div className="field"><label>Port SSH</label>
            <input required type="number" value={form.ssh_port} onChange={e => setForm({ ...form, ssh_port: e.target.value })} /></div>
          <div className="field"><label>Password root</label>
            <input required type="password" autoComplete="off" value={form.ssh_password} onChange={e => setForm({ ...form, ssh_password: e.target.value })} /></div>
          <div className="field"><label>Email admin panel</label>
            <input required type="email" value={form.admin_email} onChange={e => setForm({ ...form, admin_email: e.target.value })} placeholder="kamu@email.com" /></div>
          <div className="field" style={{ gridColumn: '1/-1' }}>
            <label>Subdomain panel (gratis)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input required style={{ flex: 1, minWidth: 0 }} value={form.label} onChange={e => setForm({ ...form, label: e.target.value.toLowerCase() })} placeholder="panelku" />
              <span className="muted mono" style={{ fontSize: 12.5 }}>.{info.base_domain || 'domain'}</span>
            </div>
          </div>
          <div className="field" style={{ gridColumn: '1/-1' }}>
            <button className="btn btn-solid" type="submit" disabled={busy || hasActive || !info.configured}>
              {hasActive ? 'Masih ada instalasi berjalan' : busy ? 'Memulai...' : `Mulai Instalasi (${info.cost ?? '-'} token)`}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <h3>Riwayat Instalasi</h3>
        <div className="scrollx"><table>
          <thead><tr><th>Waktu</th><th>Panel</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {jobs.map(j => (
              <tr key={j.id}>
                <td className="muted" style={{ fontSize: 12 }}>{new Date(j.created_at).toLocaleString('id-ID')}</td>
                <td className="token">{j.fqdn}</td>
                <td><StatusPill status={j.status} step={j.step} /></td>
                <td><button className="btn btn-sm" onClick={() => setSelected(selected === j.id ? null : j.id)}>{selected === j.id ? 'Tutup' : 'Lihat'}</button></td>
              </tr>
            ))}
            {jobs.length === 0 && <tr><td colSpan={4} className="muted">Belum ada instalasi.</td></tr>}
          </tbody>
        </table></div>
      </div>

      {selected && <JobDetail id={selected} onChange={load} />}
    </>
  );
}

function StatusPill({ status, step }: { status: string; step?: string }) {
  const cls = status === 'done' ? 'on' : status === 'failed' ? 'off' : 'warn';
  const label = status === 'done' ? 'selesai' : status === 'failed' ? 'gagal' : (step || status);
  return <span className={`pill ${cls}`}><span className="dt" />{label}</span>;
}

function CopyRow({ k, v }: { k: string; v: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="kv">
      <span className="k">{k}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        <span className="v">{v}</span>
        <button className="btn btn-sm btn-icon" onClick={() => { navigator.clipboard?.writeText(v); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
          <Copy size={12} /> {copied ? 'Tersalin' : 'Salin'}
        </button>
      </span>
    </div>
  );
}

function JobDetail({ id, onChange }: { id: string; onChange: () => void }) {
  const [job, setJob] = useState<any>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let stop = false;
    let timer: any;
    async function tick() {
      const res = await apiFetch(`/installs/${id}`);
      const j = await res.json();
      if (stop) return;
      setJob(j.job);
      if (j.job && ACTIVE.includes(j.job.status)) timer = setTimeout(tick, 4000);
      else onChange();
    }
    setJob(null);
    tick();
    return () => { stop = true; clearTimeout(timer); };
  }, [id]);

  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [job?.log]);

  if (!job) return <div className="card muted">Memuat detail...</div>;
  const active = ACTIVE.includes(job.status);
  const r = job.result || {};

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        {active ? <LoaderCircle size={18} className="spin" /> : job.status === 'done' ? <CircleCheck size={18} color="var(--accent)" /> : <CircleX size={18} color="var(--red)" />}
        <h3 style={{ margin: 0 }}>{job.fqdn}</h3>
        <StatusPill status={job.status} step={job.step} />
      </div>

      {job.status === 'done' && r.panel_url && (
        <div style={{ marginBottom: 14 }}>
          <div className="notice" style={{ marginBottom: 10 }}>Simpan kredensial ini sekarang, lalu ganti password admin setelah login pertama.</div>
          <CopyRow k="URL panel" v={r.panel_url} />
          <CopyRow k="Username" v={r.username} />
          <CopyRow k="Password" v={r.password} />
          <CopyRow k="Email" v={r.email} />
          <p className="muted" style={{ fontSize: 12.5, marginTop: 12 }}>
            Yang terpasang baru Panel. Untuk menjalankan server game kamu perlu Wings dan Node, ikuti dokumentasi resmi Pterodactyl.
          </p>
        </div>
      )}
      {job.status === 'failed' && r.error && (
        <div className="notice" style={{ marginBottom: 12 }}>
          {r.error}{r.refunded ? ' Token kamu sudah dikembalikan.' : ''}
        </div>
      )}

      <div className="log-box" ref={logRef}>{job.log || 'Menunggu output...'}</div>
    </div>
  );
}
