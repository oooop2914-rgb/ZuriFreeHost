'use client';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import { apiFetch } from '@/lib/api';

export default function UserSettings() {
  const [username, setUsername] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    supabaseBrowser.auth.getSession().then(async ({ data }) => {
      if (!data.session) return;
      const { data: p } = await supabaseBrowser.from('profiles').select('username').eq('id', data.session.user.id).single();
      setUsername(p?.username || '');
    });
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const res = await apiFetch('/me', { method: 'PATCH', body: JSON.stringify({ username }) });
    const j = await res.json();
    setMsg(res.ok ? 'Username diupdate.' : j.error);
  }

  async function resetPassword() {
    const { data } = await supabaseBrowser.auth.getSession();
    const email = data.session?.user.email;
    if (!email) return;
    await supabaseBrowser.auth.resetPasswordForEmail(email);
    setMsg('Link reset password dikirim ke email kamu.');
  }

  return (
    <div className="card">
      <h3>Pengaturan Akun</h3>
      {msg && <p className="msg">{msg}</p>}
      <form onSubmit={save} style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <input value={username} onChange={e => setUsername(e.target.value)} style={{ flex: 1, background: 'rgba(255,255,255,.04)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 13px', color: 'var(--text)' }} />
        <button className="btn" type="submit">Simpan Username</button>
      </form>
      <button className="btn" onClick={resetPassword}>Kirim Link Reset Password</button>
    </div>
  );
}
