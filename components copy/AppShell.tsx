'use client';
import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';
import {
  LayoutDashboard, Server as ServerIcon, Cpu, Megaphone, Gift, CheckSquare,
  Users, ScrollText, LogOut, Gamepad2, PackagePlus, Wallet, MessageCircle,
  Settings as SettingsIcon, Package, Inbox, SlidersHorizontal, Menu, ChevronLeft, ChevronRight,
} from 'lucide-react';

const USER_NAV = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/quest', label: 'Quest', icon: CheckSquare },
  { href: '/dashboard/minigame', label: 'Minigame', icon: Gamepad2 },
  { href: '/dashboard/claim', label: 'Claim', icon: PackagePlus },
  { href: '/dashboard/servers', label: 'Server Saya', icon: ServerIcon },
  { href: '/dashboard/wallet', label: 'Wallet', icon: Wallet },
  { href: '/dashboard/chat', label: 'Chat Publik', icon: MessageCircle },
  { href: '/dashboard/settings', label: 'Pengaturan', icon: SettingsIcon },
];

const ADMIN_NAV = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/pterodactyl', label: 'Pterodactyl Config', icon: Cpu },
  { href: '/admin/services', label: 'Layanan & Harga', icon: Package },
  { href: '/admin/service-requests', label: 'Request Layanan', icon: Inbox },
  { href: '/admin/broadcast', label: 'Broadcast', icon: Megaphone },
  { href: '/admin/giveaway', label: 'Giveaway', icon: Gift },
  { href: '/admin/quest', label: 'Quest & Token', icon: CheckSquare },
  { href: '/admin/users', label: 'Manage User', icon: Users },
  { href: '/admin/servers', label: 'Manage Server', icon: ServerIcon },
  { href: '/admin/settings', label: 'Pengaturan Sistem', icon: SlidersHorizontal },
  { href: '/admin/audit-log', label: 'Audit Log', icon: ScrollText },
];

export default function AppShell({ title, isAdmin, children }: { title: string; isAdmin?: boolean; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('zh_sidebar_collapsed');
    if (saved === '1') setCollapsed(true);
  }, []);
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  function toggleCollapse() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('zh_sidebar_collapsed', next ? '1' : '0');
  }

  async function logout() {
    await supabaseBrowser.auth.signOut();
    router.push('/login');
  }

  const NavList = ({ items }: { items: typeof USER_NAV }) => (
    <>
      {items.map(item => {
        const Icon = item.icon;
        const active = pathname === item.href;
        return (
          <Link key={item.href} href={item.href} className={`navitem ${active ? 'active' : ''}`}>
            <Icon /> <span className="label">{item.label}</span>
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="shell">
      <div className={`drawer-backdrop ${mobileOpen ? 'open' : ''}`} onClick={() => setMobileOpen(false)} />
      <aside className={`side ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="side-brand">
          <span className="dot" /><span className="label" style={{ flex: 1 }}>ZuriHost</span>
          <button className="collapse-btn" onClick={toggleCollapse}>{collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}</button>
        </div>
        <nav>
          <div className="nav-section">Menu</div>
          <NavList items={USER_NAV} />
          {isAdmin && (
            <>
              <div className="nav-section">Admin</div>
              <NavList items={ADMIN_NAV} />
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="hamburger" onClick={() => setMobileOpen(true)}><Menu size={18} /></button>
            <div className="mono" style={{ fontWeight: 600, fontSize: 14 }}>{title}</div>
          </div>
        </div>
        <div className="content">{children}</div>
      </div>
    </div>
  );
}
