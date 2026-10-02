'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '@/lib/api';
import { useServerSocket } from '@/lib/store/serverSocket';
import ServerHeader from './ServerHeader';
import TabNav, { type TabKey } from './TabNav';
import ConsoleTerminal from './ConsoleTerminal';
import ResourceGrid from './ResourceGrid';
import ResourceChart from './ResourceChart';
import GlassCard from '@/components/ui/GlassCard';

interface Details { name: string; identifier: string; address: string; limits: { memory: number; disk: number; cpu: number } }

export default function ServerDetail({ serverId }: { serverId: string }) {
  const [details, setDetails] = useState<Details | null>(null);
  const [tab, setTab] = useState<TabKey>('console');
  const [err, setErr] = useState('');
  const { stats } = useServerSocket();

  useEffect(() => {
    apiFetch(`/servers/${serverId}/details`).then(async r => {
      const j = await r.json();
      if (r.ok) setDetails(j.details); else setErr(j.error || 'Gagal memuat server');
    });
  }, [serverId]);

  if (err) return <div className="sv-card" style={{ padding: 24, color: '#F87171' }}>{err}</div>;
  if (!details) return <div style={{ color: 'var(--sv-text-1)', padding: 24 }}>Memuat server...</div>;

  return (
    <div>
      <ServerHeader serverId={serverId} name={details.name} state={stats?.state} onRenamed={n => setDetails(d => d && { ...d, name: n })} />
      <TabNav active={tab} onChange={setTab} />

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        >
          {tab === 'console' ? (
            <>
              <ConsoleTerminal serverId={serverId} />
              <div style={{ height: 28 }} />
              <ResourceGrid address={details.address} limits={details.limits} />
              <ResourceChart />
            </>
          ) : (
            <GlassCard style={{ padding: 40, textAlign: 'center', color: 'var(--sv-text-1)' }}>
              Tab &quot;{tab}&quot; belum tersedia — fokus rilis ini baru Console + monitoring resource.
            </GlassCard>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
