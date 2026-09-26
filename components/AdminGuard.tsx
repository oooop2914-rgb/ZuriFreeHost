'use client';
import { ReactNode, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import AppShell from './AppShell';

export default function AdminGuard({ title, children }: { title: string; children: ReactNode }) {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  useEffect(() => { apiFetch('/admin/users').then(res => setAllowed(res.status !== 403)); }, []);

  if (allowed === false) return <div className="wrap">Akses ditolak — halaman ini khusus admin.</div>;
  if (allowed === null) return <div className="wrap">Loading...</div>;

  return <AppShell title={title} isAdmin>{children}</AppShell>;
}
