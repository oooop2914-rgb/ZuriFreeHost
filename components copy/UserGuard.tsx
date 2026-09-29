'use client';
import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';
import { apiFetch } from '@/lib/api';
import AppShell from './AppShell';

export default function UserGuard({ title, children }: { title: string; children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [maintenance, setMaintenance] = useState(false);

  useEffect(() => {
    supabaseBrowser.auth.getSession().then(async ({ data }) => {
      if (!data.session) { router.push('/login'); return; }
      const { data: p } = await supabaseBrowser.from('profiles').select('role').eq('id', data.session.user.id).single();
      const admin = p?.role === 'admin';
      setIsAdmin(admin);

      if (!admin) {
        const sRes = await apiFetch('/settings');
        const sJ = await sRes.json();
        if (sJ.settings?.maintenance_mode) { setMaintenance(true); setReady(true); return; }
      }
      setReady(true);
    });
  }, []);

  if (!ready) return <div className="wrap">Loading...</div>;
  if (maintenance) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ maxWidth: 380, textAlign: 'center' }}>
        <h3>🛠️ Sedang Maintenance</h3>
        <p className="muted" style={{ fontSize: 13 }}>ZuriHost lagi maintenance sebentar. Coba lagi nanti ya.</p>
      </div>
    </div>
  );
  return <AppShell title={title} isAdmin={isAdmin}>{children}</AppShell>;
}
