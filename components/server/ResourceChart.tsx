'use client';
import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import GlassCard from '@/components/ui/GlassCard';
import { useServerSocket } from '@/lib/store/serverSocket';

const RANGES = ['Live', '1H', '6H', '24H', '7D'] as const;

function ChartTooltip({ active, payload, label, unit }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="sv-card" style={{ padding: '8px 12px', fontSize: 12 }}>
      <div style={{ color: 'var(--sv-text-1)', marginBottom: 2 }}>{new Date(label).toLocaleTimeString('id-ID')}</div>
      <div style={{ fontWeight: 600 }}>{payload[0].value?.toFixed?.(1) ?? payload[0].value} {unit}</div>
    </div>
  );
}

function ChartCard({ title, data, dataKey, gradientId, color, unit }: {
  title: string; data: any[]; dataKey: string; gradientId: string; color: string; unit: string;
}) {
  return (
    <GlassCard style={{ padding: '18px 10px 10px 0' }}>
      <div style={{ padding: '0 18px 14px', fontSize: 13, fontWeight: 600, color: 'var(--sv-text-0)' }}>{title}</div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 4, right: 18, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.45} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.08)" />
          <XAxis dataKey="at" hide />
          <YAxis tick={{ fontSize: 11, fill: 'var(--sv-text-1)' }} axisLine={false} tickLine={false} width={34} />
          <Tooltip content={<ChartTooltip unit={unit} />} />
          <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill={`url(#${gradientId})`} isAnimationActive animationDuration={500} />
        </AreaChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}

export default function ResourceChart() {
  const { history } = useServerSocket();
  const [range, setRange] = useState<typeof RANGES[number]>('Live');

  const cpuData = history.map(h => ({ at: h.at, v: h.cpu }));
  const memData = history.map(h => ({ at: h.at, v: h.memoryBytes / 1024 / 1024 }));
  const netData = history.map(h => ({ at: h.at, in: h.networkRxBytes / 1024, out: h.networkTxBytes / 1024 }));

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {RANGES.map(r => (
          <button
            key={r}
            onClick={() => setRange(r)}
            disabled={r !== 'Live'}
            className="sv-btn sv-btn-sm"
            style={{ opacity: r === 'Live' ? 1 : .35, cursor: r === 'Live' ? 'pointer' : 'not-allowed', ...(r === range ? { borderColor: 'var(--sv-grad-c)', color: 'var(--sv-grad-c)' } : {}) }}
            title={r === 'Live' ? undefined : 'Histori jangka panjang belum tersedia (butuh penyimpanan metrik terpisah)'}
          >{r}</button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
        <ChartCard title="CPU Load" data={cpuData} dataKey="v" gradientId="gradCpu" color="#A855F7" unit="%" />
        <ChartCard title="Memory" data={memData} dataKey="v" gradientId="gradMem" color="#06B6D4" unit="MiB" />
        <GlassCard style={{ padding: '18px 10px 10px 0' }}>
          <div style={{ padding: '0 18px 14px', fontSize: 13, fontWeight: 600 }}>Network</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={netData} margin={{ top: 4, right: 18, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="gradIn" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10B981" stopOpacity={0.4} /><stop offset="100%" stopColor="#10B981" stopOpacity={0} /></linearGradient>
                <linearGradient id="gradOut" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#F59E0B" stopOpacity={0.4} /><stop offset="100%" stopColor="#F59E0B" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="at" hide />
              <YAxis tick={{ fontSize: 11, fill: 'var(--sv-text-1)' }} axisLine={false} tickLine={false} width={34} />
              <Tooltip content={<ChartTooltip unit="KiB" />} />
              <Area type="monotone" dataKey="in" stroke="#10B981" strokeWidth={2} fill="url(#gradIn)" />
              <Area type="monotone" dataKey="out" stroke="#F59E0B" strokeWidth={2} fill="url(#gradOut)" />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>
      {range !== 'Live' && (
        <p style={{ marginTop: 10, fontSize: 12, color: 'var(--sv-text-2)' }}>
          Rentang {range} butuh penyimpanan histori metrik jangka panjang (belum dibangun) — sementara nampilin data live aja.
        </p>
      )}
    </div>
  );
}
