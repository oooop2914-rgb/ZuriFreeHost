'use client';
import { Wifi, Clock, Cpu, MemoryStick, HardDrive, ArrowDown, ArrowUp } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { useServerSocket } from '@/lib/store/serverSocket';

function fmtBytes(b: number): string {
  if (!b) return '0 MiB';
  const units = ['B', 'KiB', 'MiB', 'GiB'];
  let i = 0, v = b;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(2)} ${units[i]}`;
}
function fmtUptime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return `${h}h ${m}m ${sec}s`;
}

function Card({ icon, label, value, progress, color }: { icon: React.ReactNode; label: string; value: string; progress?: number; color?: string }) {
  return (
    <GlassCard className="sv-res-card">
      <div className="sv-res-label">{icon}{label}</div>
      <div className="sv-res-value">{value}</div>
      {progress !== undefined && (
        <div className="sv-res-progress"><div style={{ width: `${Math.min(progress, 100)}%`, background: color || 'var(--sv-grad-c)' }} /></div>
      )}
    </GlassCard>
  );
}

export default function ResourceGrid({ address, limits }: { address: string; limits?: { memory: number; disk: number; cpu: number } }) {
  const { stats } = useServerSocket();

  const memLimitBytes = (limits?.memory || 0) * 1024 * 1024;
  const diskLimitBytes = (limits?.disk || 0) * 1024 * 1024;
  const memPct = stats && memLimitBytes ? (stats.memoryBytes / memLimitBytes) * 100 : undefined;
  const diskPct = stats && diskLimitBytes ? (stats.diskBytes / diskLimitBytes) * 100 : undefined;
  const cpuPct = stats ? stats.cpu : undefined;
  const cpuLimit = limits?.cpu || 100;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18, marginBottom: 28 }}>
      <Card icon={<Wifi size={15} />} label="Address" value={address || '-'} />
      <Card icon={<Clock size={15} />} label="Uptime" value={stats ? fmtUptime(stats.uptimeMs) : '-'} />
      <Card icon={<Cpu size={15} />} label="CPU Load" value={stats ? `${stats.cpu.toFixed(2)}%` : '-'} progress={cpuPct !== undefined ? (cpuPct / cpuLimit) * 100 : undefined} color="#A855F7" />
      <Card icon={<MemoryStick size={15} />} label="Memory" value={stats ? `${fmtBytes(stats.memoryBytes)}${limits?.memory ? ` / ${fmtBytes(memLimitBytes)}` : ''}` : '-'} progress={memPct} color="#06B6D4" />
      <Card icon={<HardDrive size={15} />} label="Disk" value={stats ? `${fmtBytes(stats.diskBytes)}${limits?.disk ? ` / ${fmtBytes(diskLimitBytes)}` : ''}` : '-'} progress={diskPct} color="#6366F1" />
      <Card icon={<ArrowDown size={15} />} label="Network In" value={stats ? fmtBytes(stats.networkRxBytes) : '-'} />
      <Card icon={<ArrowUp size={15} />} label="Network Out" value={stats ? fmtBytes(stats.networkTxBytes) : '-'} />
    </div>
  );
}
