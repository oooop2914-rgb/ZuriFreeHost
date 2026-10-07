'use client';
import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';
import { apiFetch, establishSession } from '@/lib/api';
import { Wrench } from 'lucide-react';
import AppShell from './AppShell';

export default function UserGuard({ title, children }: { title: string; children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [maintenance, setMaintenance] = useState<{ message?: string; scheduled_end?: string | null } | null>(null);

  useEffect(() => {
    supabaseBrowser.auth.getSession().then(async ({ data }) => {
      if (!data.session) { router.push('/login'); return; }
      // pastiin cookie sesi ke backend selalu fresh (idempotent, murah, dan nolongin
      // user yang login sebelum fitur cookie ini ada -- gak perlu paksa logout manual)
      await establishSession(data.session.access_token);
      const { data: p } = await supabaseBrowser.from('profiles').select('role').eq('id', data.session.user.id).single();
      const admin = p?.role === 'admin';
      const staff = admin || p?.role === 'mods'; // staff (admin & mods) tetep bisa akses walau maintenance nyala
      setIsAdmin(admin);

      if (!staff) {
        const sRes = await apiFetch('/settings');
        const sJ = await sRes.json();
        if (sJ.settings?.maintenance_mode?.enabled) { setMaintenance(sJ.settings.maintenance_mode); setReady(true); return; }
      }
      setReady(true);
    });
  }, []);

  if (!ready) return <div className="wrap">Loading...</div>;
  if (maintenance) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ maxWidth: 380, textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><div className="icon-tile"><Wrench size={24} /></div></div>
        <h3>Sedang Maintenance</h3>
        <p className="muted" style={{ fontSize: 13 }}>{maintenance.message || 'ZuriHost lagi maintenance sebentar. Coba lagi nanti ya.'}</p>
        {maintenance.scheduled_end && (
          <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>Estimasi selesai: {new Date(maintenance.scheduled_end).toLocaleString('id-ID')}</p>
        )}
      </div>
    </div>
  );
  return <AppShell title={title} isAdmin={isAdmin}>{children}</AppShell>;
}
