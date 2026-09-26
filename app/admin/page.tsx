'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

type UserRow = { id: string; username: string; token_balance: number; status: string; role: string };

export default function AdminPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [allowed, setAllowed] = useState<boolean | null>(null);

  async function load() {
    const res = await apiFetch('/admin/users'); // ⇒ backend Express
    if (res.status === 403) { setAllowed(false); return; }
    const j = await res.json();
    setUsers(j.users || []);
    setAllowed(true);
  }
  useEffect(() => { load(); }, []);

  async function setStatus(user_id: string, status: string) {
    await apiFetch('/admin/users', { method: 'PATCH', body: JSON.stringify({ user_id, status }) });
    load();
  }

  if (allowed === false) return <div className="wrap">Akses ditolak — halaman ini khusus admin.</div>;
  if (allowed === null) return <div className="wrap">Loading...</div>;

  return (
    <div className="wrap">
      <h2 style={{ marginBottom: 20 }}>ZuriHost Admin — Manage User</h2>
      <div className="card">
        <table>
          <thead><tr><th>Username</th><th>Token</th><th>Role</th><th>Status</th><th>Aksi</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.username}</td><td className="token">{u.token_balance}</td><td>{u.role}</td><td>{u.status}</td>
                <td>{u.status !== 'banned'
                  ? <button className="btn" onClick={() => setStatus(u.id, 'banned')}>Ban</button>
                  : <button className="btn" onClick={() => setStatus(u.id, 'active')}>Unban</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
