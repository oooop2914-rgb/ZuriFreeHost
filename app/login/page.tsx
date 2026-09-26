'use client';
import { Suspense, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const ref = params.get('ref');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(''); setBusy(true);
    if (mode === 'signup') {
      const { error } = await supabaseBrowser.auth.signUp({ email, password, options: { data: { ref: ref || undefined } } });
      if (error) { setBusy(false); return setErr(error.message); }
    } else {
      const { error } = await supabaseBrowser.auth.signInWithPassword({ email, password });
      if (error) { setBusy(false); return setErr(error.message); }
    }
    router.push('/dashboard');
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
      <div className="wrap narrow" style={{ padding: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32, fontWeight: 700, fontSize: 18, justifyContent: 'center' }}>
          <span style={{ width: 10, height: 10, background: 'linear-gradient(135deg,var(--accent),var(--accent-2))', borderRadius: 4, boxShadow: '0 0 12px var(--accent)' }} />
          ZuriHost
        </div>
        <div className="card" style={{ padding: 28 }}>
          <h3 style={{ fontSize: 19, marginBottom: 4 }}>{mode === 'login' ? 'Selamat datang lagi' : 'Buat akun baru'}</h3>
          <p className="sub">{mode === 'login' ? 'Masuk buat kelola server kamu.' : 'Gratis, gak perlu kartu kredit.'}</p>
          <form onSubmit={submit}>
            <div className="field"><label>Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="kamu@email.com" /></div>
            <div className="field"><label>Password</label>
              <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" /></div>
            {ref && <p className="muted" style={{ fontSize: 12, marginBottom: 12 }}>Diundang lewat kode referral: <span className="token">{ref}</span></p>}
            {err && <p className="err">{err}</p>}
            <button type="submit" disabled={busy} className="btn btn-solid" style={{ width: '100%' }}>
              {busy ? 'Memproses...' : mode === 'login' ? 'Login' : 'Daftar'}
            </button>
          </form>
        </div>
        <p className="muted" style={{ textAlign: 'center', fontSize: 13, marginTop: 16 }}>
          {mode === 'login' ? 'Belum punya akun? ' : 'Udah punya akun? '}
          <a style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }} onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
            {mode === 'login' ? 'Daftar di sini' : 'Login di sini'}
          </a>
        </p>
      </div>
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
