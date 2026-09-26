'use client';
import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';

const USER_NAV = [{ href: '/dashboard', label: 'Dashboard' }];
const ADMIN_NAV = [{ href: '/admin', label: 'Admin Dashboard' }];

export default function AppShell({ title, isAdmin, children }: { title: string; isAdmin?: boolean; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await supabaseBrowser.auth.signOut();
    router.push('/login');
  }

  return (
    <div className="shell">
      <aside className="side">
        <div className="side-brand"><span className="dot" /><span>ZuriHost</span></div>
        <nav>
          {USER_NAV.map(item => (
            <Link key={item.href} href={item.href} className={`navitem ${pathname === item.href ? 'active' : ''}`}>
              <span className="label">{item.label}</span>
            </Link>
          ))}
          {isAdmin && (
            <>
              <div style={{ height: 1, background: 'var(--line)', margin: '10px 10px' }} />
              {ADMIN_NAV.map(item => (
                <Link key={item.href} href={item.href} className={`navitem ${pathname === item.href ? 'active' : ''}`}>
                  <span className="label">{item.label}</span>
                </Link>
              ))}
            </>
          )}
        </nav>
        <div className="side-foot">
          <button onClick={logout} className="btn btn-sm" style={{ width: '100%' }}>Logout</button>
        </div>
      </aside>
      <div className="main">
        <div className="topbar">
          <div className="mono" style={{ fontWeight: 600, fontSize: 14 }}>{title}</div>
        </div>
        <div className="content">{children}</div>
      </div>
    </div>
  );
}
