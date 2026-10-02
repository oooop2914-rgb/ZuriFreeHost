'use client';
import { ReactNode, useEffect, useState } from 'react';
import { apiFetch, establishSession } from '@/lib/api';
import { supabaseBrowser } from '@/lib/supabase/client';
import AppShell from './AppShell';

export default function AdminGuard({ title, children }: { title: string; children: ReactNode }) {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabaseBrowser.auth.getSession();
        if (data.session) await establishSession(data.session.access_token); // idempotent, jaga-jaga cookie belum ada
        const res = await apiFetch('/admin/users');
        setAllowed(res.status !== 403 && res.status !== 401);
      } catch (err: any) {
        setError(err.message || 'Gagal konek ke backend');
        setAllowed(false);
      }
    })();
  }, []);

  if (error) return (
    <div className="wrap">
      <div className="card">
        <h3 style={{ color: 'var(--red)' }}>Gagal konek ke backend</h3>
        <p className="muted" style={{ fontSize: 13 }}>{error}</p>
        <p className="muted" style={{ fontSize: 12, marginTop: 10 }}>
          Kemungkinan: backend/tunnel mati, atau NEXT_PUBLIC_API_URL salah, atau domain frontend belum di-whitelist CORS di backend.
        </p>
      </div>
    </div>
  );
  if (allowed === false) return <div className="wrap">Akses ditolak — halaman ini khusus admin, atau sesi login kamu habis (coba login ulang).</div>;
  if (allowed === null) return <div className="wrap">Loading...</div>;

  return <AppShell title={title} isAdmin>{children}</AppShell>;
}
