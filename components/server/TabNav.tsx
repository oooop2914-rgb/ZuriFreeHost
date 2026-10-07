'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Terminal, FolderOpen, Database, CalendarClock, Users, HardDrive, Network, Play, Settings, Activity } from 'lucide-react';

const TABS = [
  { key: 'console', label: 'Console', icon: Terminal },
  { key: 'files', label: 'Files', icon: FolderOpen },
  { key: 'databases', label: 'Databases', icon: Database },
  { key: 'schedules', label: 'Schedules', icon: CalendarClock },
  { key: 'users', label: 'Users', icon: Users },
  { key: 'backups', label: 'Backups', icon: HardDrive },
  { key: 'network', label: 'Network', icon: Network },
  { key: 'startup', label: 'Startup', icon: Play },
  { key: 'settings', label: 'Settings', icon: Settings },
  { key: 'activity', label: 'Activity', icon: Activity },
] as const;

export type TabKey = typeof TABS[number]['key'];

export default function TabNav({ active, onChange }: { active: TabKey; onChange: (k: TabKey) => void }) {
  return (
    <div style={{ display: 'flex', gap: 4, overflowX: 'auto', borderBottom: '1px solid var(--sv-surface-border)', marginBottom: 24, scrollSnapType: 'x proximity' }}>
      {TABS.map(t => {
        const Icon = t.icon;
        const isActive = active === t.key;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            style={{
              position: 'relative', display: 'flex', alignItems: 'center', gap: 7,
              padding: '11px 16px', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 13.5, whiteSpace: 'nowrap', scrollSnapAlign: 'start',
              color: isActive ? 'var(--sv-text-0)' : 'var(--sv-text-1)',
              transition: 'color 150ms ease',
            }}
          >
            <Icon size={15} />{t.label}
            {isActive && (
              <motion.div
                layoutId="sv-tab-underline"
                style={{ position: 'absolute', left: 8, right: 8, bottom: -1, height: 2, borderRadius: 2, background: 'linear-gradient(90deg,var(--sv-grad-a),var(--sv-grad-b),var(--sv-grad-c))' }}
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
