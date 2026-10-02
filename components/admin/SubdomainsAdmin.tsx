'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Trash2 } from 'lucide-react';

export default function SubdomainsAdmin() {
  const [list, setList] = useState<any[]>([]);
  async function load() { const r = await apiFetch('/subdomains/admin/all'); setList((await r.json()).subdomains || []); }
  useEffect(() => { load(); }, []);
  async function remove(row: any) {
    if (!confirm(`Hapus ${row.fqdn} milik ${row.profiles?.username}?`)) return;
    await apiFetch(`/subdomains/${row.id}`, { method: 'DELETE' });
    load();
  }
  return (
    <div className="card">
      <h3>Semua Subdomain User</h3>
      <p className="sub">Hapus kalau ada yang disalahgunakan (phishing, spam, dll).</p>
      <div className="scrollx"><table>
        <thead><tr><th>Domain</th><th>User</th><th>Tipe</th><th>Tujuan</th><th>Jenis</th><th></th></tr></thead>
        <tbody>
          {list.map(r => (
            <tr key={r.id}>
              <td className="token">{r.fqdn}</td>
              <td>{r.profiles?.username}</td>
              <td>{r.record_type}</td>
              <td className="mono" style={{ fontSize: 12 }}>{r.target}</td>
              <td><span className={`pill ${r.purpose === 'panel' ? 'warn' : 'on'}`}><span className="dt" />{r.purpose}</span></td>
              <td><button className="btn btn-sm btn-danger btn-icon" onClick={() => remove(r)}><Trash2 size={13} /> Hapus</button></td>
            </tr>
          ))}
          {list.length === 0 && <tr><td colSpan={6} className="muted">Belum ada subdomain.</td></tr>}
        </tbody>
      </table></div>
    </div>
  );
}
