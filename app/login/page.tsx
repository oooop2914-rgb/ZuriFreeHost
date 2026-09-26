'use client';
import { Suspense, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [err, setErr] = useState('');
  const router = useRouter();
  const params = useSearchParams();
  const ref = params.get('ref');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    if (mode === 'signup') {
      const { error } = await supabaseBrowser.auth.signUp({ email, password, options: { data: { ref: ref || undefined } } });
      if (error) return setErr(error.message);
    } else {
      const { error } = await supabaseBrowser.auth.signInWithPassword({ email, password });
      if (error) return setErr(error.message);
    }
    router.push('/dashboard');
  }

  return (
    <div className="wrap" style={{ maxWidth: 380, paddingTop: 80 }}>
      <h2 style={{ marginBottom: 20 }}>{mode === 'login' ? 'Login' : 'Daftar'} ZuriHost</h2>
      <form onSubmit={submit}>
        <div className="field"><label className="muted">Email</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} /></div>
        <div className="field"><label className="muted">Password</label>
          <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} /></div>
        {ref && <p className="muted" style={{ fontSize: 12 }}>Diundang lewat kode referral: {ref}</p>}
        {err && <p className="err">{err}</p>}
        <button type="submit" className="btn btn-solid" style={{ width: '100%', marginTop: 8 }}>
          {mode === 'login' ? 'Login' : 'Daftar'}
        </button>
      </form>
      <p className="muted" style={{ marginTop: 16, fontSize: 13 }}>
        {mode === 'login' ? 'Belum punya akun? ' : 'Udah punya akun? '}
        <a style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
          {mode === 'login' ? 'Daftar di sini' : 'Login di sini'}
        </a>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="wrap">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
