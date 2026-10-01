'use client';
import { Suspense, useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import { establishSession } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [mode, setMode] = useState<'login' | 'signup' | 'otp'>('login');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [regOpen, setRegOpen] = useState(true);
  const router = useRouter();
  const params = useSearchParams();
  const ref = params.get('ref');

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`).then(r => r.json()).then(j => setRegOpen(j.settings?.registration_open ?? true)).catch(() => {});
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(''); setBusy(true);
    if (mode === 'signup') {
      const { error } = await supabaseBrowser.auth.signUp({ email, password, options: { data: { ref: ref || undefined } } });
      setBusy(false);
      if (error) return setErr(error.message);
      setMode('otp'); // sukses daftar → minta kode OTP dari email
      return;
    }
    if (mode === 'otp') {
      const { data, error } = await supabaseBrowser.auth.verifyOtp({ email, token: otp, type: 'signup' });
      if (error) { setBusy(false); return setErr(error.message); }
      const ok = data.session ? await establishSession(data.session.access_token) : false;
      setBusy(false);
      if (!ok) return setErr('Login berhasil di Supabase, tapi gagal bikin sesi ke server. Coba login ulang.');
      router.push('/dashboard');
      return;
    }
    const { data, error } = await supabaseBrowser.auth.signInWithPassword({ email, password });
    if (error) { setBusy(false); return setErr(error.message); }
    const ok = data.session ? await establishSession(data.session.access_token) : false;
    setBusy(false);
    if (!ok) return setErr('Login berhasil di Supabase, tapi gagal bikin sesi ke server. Coba lagi.');
    router.push('/dashboard');
  }

  async function resendOtp() {
    setErr('');
    const { error } = await supabaseBrowser.auth.resend({ type: 'signup', email });
    setErr(error ? error.message : 'Kode baru dikirim ke email kamu.');
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
      <div className="wrap narrow" style={{ padding: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32, fontWeight: 700, fontSize: 18, justifyContent: 'center' }}>
          <span style={{ width: 10, height: 10, background: 'linear-gradient(135deg,var(--accent),var(--accent-2))', borderRadius: 4, boxShadow: '0 0 12px var(--accent)' }} />
          ZuriHost
        </div>
        <div className="card" style={{ padding: 28 }}>
          <h3 style={{ fontSize: 19, marginBottom: 4 }}>
            {mode === 'login' ? 'Selamat datang lagi' : mode === 'signup' ? 'Buat akun baru' : 'Verifikasi email'}
          </h3>
          <p className="sub">
            {mode === 'login' ? 'Masuk buat kelola server kamu.' : mode === 'signup' ? 'Gratis, gak perlu kartu kredit.' : `Kode 6 digit udah dikirim ke ${email}`}
          </p>
          <form onSubmit={submit}>
            {mode !== 'otp' && (
              <>
                <div className="field"><label>Email</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="kamu@email.com" /></div>
                <div className="field"><label>Password</label>
                  <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" /></div>
              </>
            )}
            {mode === 'otp' && (
              <div className="field"><label>Kode OTP</label>
                <input required maxLength={6} value={otp} onChange={e => setOtp(e.target.value)} placeholder="123456"
                  style={{ textAlign: 'center', fontSize: 22, letterSpacing: 6, fontFamily: 'IBM Plex Mono, monospace' }} />
              </div>
            )}
            {ref && mode === 'signup' && <p className="muted" style={{ fontSize: 12, marginBottom: 12 }}>Diundang lewat kode referral: <span className="token">{ref}</span></p>}
            {err && <p className="err">{err}</p>}
            <button type="submit" disabled={busy} className="btn btn-solid" style={{ width: '100%' }}>
              {busy ? 'Memproses...' : mode === 'login' ? 'Login' : mode === 'signup' ? 'Daftar' : 'Verifikasi'}
            </button>
          </form>
          {mode === 'otp' && (
            <p className="muted" style={{ fontSize: 12, textAlign: 'center', marginTop: 12 }}>
              Gak dapet kode? <a style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={resendOtp}>Kirim ulang</a>
            </p>
          )}
        </div>
        {mode !== 'otp' && (
          <p className="muted" style={{ textAlign: 'center', fontSize: 13, marginTop: 16 }}>
            {!regOpen && mode === 'login' ? (
              <span style={{ color: 'var(--gold)' }}>Pendaftaran baru lagi ditutup sementara.</span>
            ) : (
              <>
                {mode === 'login' ? 'Belum punya akun? ' : 'Udah punya akun? '}
                <a style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }} onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
                  {mode === 'login' ? 'Daftar di sini' : 'Login di sini'}
                </a>
              </>
            )}
          </p>
        )}
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
