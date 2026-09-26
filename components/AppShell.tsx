'use client';
import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';
import {
  LayoutDashboard, Server as ServerIcon, Cpu, Megaphone, Gift, CheckSquare,
  Users, ScrollText, LogOut,
} from 'lucide-react';

const USER_NAV = [{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }];

const ADMIN_NAV = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/pterodactyl', label: 'Pterodactyl Config', icon: Cpu },
  { href: '/admin/broadcast', label: 'Broadcast', icon: Megaphone },
  { href: '/admin/giveaway', label: 'Giveaway', icon: Gift },
  { href: '/admin/quest', label: 'Quest & Token', icon: CheckSquare },
  { href: '/admin/users', label: 'Manage User', icon: Users },
  { href: '/admin/servers', label: 'Manage Server', icon: ServerIcon },
  { href: '/admin/audit-log', label: 'Audit Log', icon: ScrollText },
];

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
        <div className="side-brand"><span className="dot" /><span className="label">ZuriHost</span></div>
        <nav>
          <div className="nav-section">Menu</div>
          {USER_NAV.map(item => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={`navitem ${active ? 'active' : ''}`}>
                <Icon /> <span className="label">{item.label}</span>
              </Link>
            );
          })}
          {isAdmin && (
            <>
              <div className="nav-section">Admin</div>
              {ADMIN_NAV.map(item => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} className={`navitem ${active ? 'active' : ''}`}>
                    <Icon /> <span className="label">{item.label}</span>
                  </Link>
                );
              })}
            </>
          )}
        </nav>
        <div className="side-foot">
          <button onClick={logout} className="btn btn-sm" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <LogOut size={14} /> <span className="label">Logout</span>
          </button>
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
