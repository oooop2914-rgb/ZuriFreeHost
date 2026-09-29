'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Globe, Trash2, Pencil } from 'lucide-react';

export default function Subdomain() {
  const [info, setInfo] = useState<any>(null);
  const [list, setList] = useState<any[]>([]);
  const [form, setForm] = useState({ label: '', type: 'A', target: '' });
  const [msg, setMsg] = useState('');
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);

  async function load() {
    const [iRes, lRes] = await Promise.all([apiFetch('/subdomains/info'), apiFetch('/subdomains/mine')]);
    setInfo(await iRes.json());
    setList((await lRes.json()).subdomains || []);
  }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg('');
    const res = await apiFetch('/subdomains', { method: 'POST', body: JSON.stringify(form) });
    const j = await res.json();
    setBusy(false);
    setOk(res.ok);
    setMsg(res.ok ? `Subdomain ${j.subdomain.fqdn} aktif.` : j.error);
    if (res.ok) { setForm({ label: '', type: 'A', target: '' }); load(); }
  }

  async function changeTarget(row: any) {
    const target = prompt(`Target baru untuk ${row.fqdn} (${row.record_type === 'A' ? 'IPv4' : 'domain'}):`, row.target);
    if (!target) return;
    const res = await apiFetch(`/subdomains/${row.id}`, { method: 'PATCH', body: JSON.stringify({ target }) });
    const j = await res.json();
    setOk(res.ok); setMsg(res.ok ? 'Target diupdate.' : j.error);
    load();
  }

  async function remove(row: any) {
    if (!confirm(`Hapus ${row.fqdn}? Token yang udah dipakai gak dikembalikan.`)) return;
    const res = await apiFetch(`/subdomains/${row.id}`, { method: 'DELETE' });
    const j = await res.json();
    setOk(res.ok); setMsg(res.ok ? 'Subdomain dihapus.' : j.error);
    load();
  }

  if (!info) return <div className="muted">Loading...</div>;

  return (
    <>
      {!info.configured && (
        <div className="notice" style={{ marginBottom: 16 }}>Layanan subdomain belum dikonfigurasi admin. Coba lagi nanti.</div>
      )}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
          <div className="icon-tile"><Globe size={22} /></div>
          <div>
            <h3 style={{ marginBottom: 2 }}>Buat Subdomain</h3>
            <p className="sub" style={{ margin: 0 }}>
              Langsung aktif lewat Cloudflare. Harga <span className="token">{info.cost ?? '-'} token</span>, maksimal {info.max} per akun.
            </p>
          </div>
        </div>
        {msg && <p className="msg" style={{ color: ok ? 'var(--accent)' : 'var(--red)' }}>{msg}</p>}
        <form onSubmit={create} className="form-grid">
          <div className="field">
            <label>Nama subdomain</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input required style={{ flex: 1, minWidth: 0 }} value={form.label} onChange={e => setForm({ ...form, label: e.target.value.toLowerCase() })} placeholder="tokoku" />
              <span className="muted mono" style={{ fontSize: 12.5 }}>.{info.base_domain || 'domain'}</span>
            </div>
          </div>
          <div className="field">
            <label>Tipe record</label>
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              <option value="A">A (arahkan ke IP)</option>
              <option value="CNAME">CNAME (arahkan ke domain)</option>
            </select>
          </div>
          <div className="field" style={{ gridColumn: '1/-1' }}>
            <label>{form.type === 'A' ? 'IPv4 publik tujuan' : 'Domain tujuan'}</label>
            <input required value={form.target} onChange={e => setForm({ ...form, target: e.target.value })} placeholder={form.type === 'A' ? '203.0.113.10' : 'server.contoh.com'} />
          </div>
          <div className="field" style={{ gridColumn: '1/-1' }}>
            <button className="btn btn-solid" type="submit" disabled={busy || !info.configured}>{busy ? 'Memproses...' : `Buat Subdomain (${info.cost ?? '-'} token)`}</button>
          </div>
        </form>
      </div>

      <div className="card">
        <h3>Subdomain Kamu</h3>
        <div className="scrollx"><table>
          <thead><tr><th>Domain</th><th>Tipe</th><th>Tujuan</th><th>Jenis</th><th></th></tr></thead>
          <tbody>
            {list.map(r => (
              <tr key={r.id}>
                <td className="token">{r.fqdn}</td>
                <td>{r.record_type}</td>
                <td className="mono" style={{ fontSize: 12 }}>{r.target}</td>
                <td><span className={`pill ${r.purpose === 'panel' ? 'warn' : 'on'}`}><span className="dt" />{r.purpose === 'panel' ? 'panel' : 'custom'}</span></td>
                <td style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-sm btn-icon" onClick={() => changeTarget(r)}><Pencil size={13} /> Ubah</button>
                  <button className="btn btn-sm btn-danger btn-icon" onClick={() => remove(r)}><Trash2 size={13} /> Hapus</button>
                </td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={5} className="muted">Belum ada subdomain.</td></tr>}
          </tbody>
        </table></div>
      </div>
    </>
  );
}
