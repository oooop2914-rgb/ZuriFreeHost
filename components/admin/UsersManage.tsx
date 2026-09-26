'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function UsersManage() {
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
