import { cn } from '@/lib/utils';

type Status = 'running' | 'stopped' | 'starting' | 'neutral';

const LABEL: Record<Status, string> = {
  running: 'Online', stopped: 'Berhenti', starting: 'Memulai', neutral: '-',
};

export default function StatusBadge({ status, label, className }: { status: Status; label?: string; className?: string }) {
  return (
    <span className={cn('sv-badge', `sv-badge-${status}`, className)}>
      <span className="sv-badge-dot" />
      {label || LABEL[status]}
    </span>
  );
}
