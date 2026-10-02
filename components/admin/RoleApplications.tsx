'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import RoleBadge from '@/components/role/RoleBadge';

interface App {
  id: string; role_requested: string; status: string; social_name: string; social_link: string;
  followers: number | null; reason: string; whatsapp: string; created_at: string;
  rejection_reason?: string; profiles?: { username: string };
}

export default function RoleApplications() {
  const [apps, setApps] = useState<App[]>([]);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | ''>('pending');
  const [detail, setDetail] = useState<App | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  async function load() {
    const r = await apiFetch(`/role-applications/admin/all${filter ? `?status=${filter}` : ''}`);
    setApps((await r.json()).applications || []);
  }
  useEffect(() => { load(); }, [filter]);

  async function approve(id: string) {
    await apiFetch(`/role-applications/${id}/approve`, { method: 'POST' });
    setDetail(null); load();
  }
  async function reject(id: string) {
    if (!rejectReason.trim()) return alert('Alasan penolakan wajib diisi');
    await apiFetch(`/role-applications/${id}/reject`, { method: 'POST', body: JSON.stringify({ rejection_reason: rejectReason }) });
    setDetail(null); setRejectReason(''); load();
  }

  return (
    <>
      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        {(['pending', 'approved', 'rejected', ''] as const).map(f => (
          <button key={f} className="btn btn-sm" onClick={() => setFilter(f)}
            style={filter === f ? { background: 'var(--accent)', borderColor: 'var(--accent)', color: '#04121a' } : {}}>
            {f || 'Semua'}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="scrollx"><table>
          <thead><tr><th>User</th><th>Role</th><th>Sosmed</th><th>Followers</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {apps.map(a => (
              <tr key={a.id}>
                <td>{a.profiles?.username}</td>
                <td><RoleBadge role={a.role_requested} size="sm" /></td>
                <td><a href={a.social_link} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>{a.social_name}</a></td>
                <td>{a.followers ?? '-'}</td>
                <td><span className={`pill ${a.status === 'approved' ? 'on' : a.status === 'rejected' ? 'off' : 'warn'}`}><span className="dt" />{a.status}</span></td>
                <td><button className="btn btn-sm" onClick={() => setDetail(a)}>Detail</button></td>
              </tr>
            ))}
            {apps.length === 0 && <tr><td colSpan={6} className="muted">Gak ada pengajuan.</td></tr>}
          </tbody>
        </table></div>
      </div>

      {detail && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.6)', padding: 16 }}>
          <div className="card" style={{ maxWidth: 460, width: '100%', maxHeight: '85vh', overflowY: 'auto', marginBottom: 0 }}>
            <h3 style={{ marginBottom: 14 }}>Detail Pengajuan — {detail.profiles?.username}</h3>
            <div className="kv"><span className="k">Role diajukan</span><RoleBadge role={detail.role_requested} size="sm" /></div>
            <div className="kv"><span className="k">Nama sosmed</span><span className="v">{detail.social_name}</span></div>
            <div className="kv"><span className="k">Link</span><a className="v" href={detail.social_link} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>{detail.social_link}</a></div>
            {detail.followers != null && <div className="kv"><span className="k">Followers</span><span className="v">{detail.followers}</span></div>}
            <div className="kv"><span className="k">WhatsApp</span><span className="v">{detail.whatsapp}</span></div>
            <p className="muted" style={{ fontSize: 13, margin: '14px 0' }}>{detail.reason}</p>

            {detail.status === 'pending' ? (
              <>
                <div className="field"><label>Alasan penolakan (kalau mau tolak)</label>
                  <textarea rows={2} value={rejectReason} onChange={e => setRejectReason(e.target.value)} /></div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                  <button className="btn btn-sm" onClick={() => setDetail(null)}>Tutup</button>
                  <button className="btn btn-sm btn-danger" onClick={() => reject(detail.id)}>Tolak</button>
                  <button className="btn btn-sm btn-solid" onClick={() => approve(detail.id)}>Setujui</button>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}><button className="btn btn-sm" onClick={() => setDetail(null)}>Tutup</button></div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
