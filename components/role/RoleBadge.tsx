import { roleMeta, type RoleSlug } from '@/lib/roles';
import { cn } from '@/lib/utils';

export default function RoleBadge({ role, size = 'md', className }: { role: RoleSlug | string; size?: 'sm' | 'md'; className?: string }) {
  const meta = roleMeta(role);
  const Icon = meta.icon;
  return (
    <span className={cn('role-badge', `role-${meta.name}`, size === 'sm' && 'sv-btn-sm', className)}>
      <Icon size={size === 'sm' ? 11 : 13} />
      {meta.displayName}
    </span>
  );
}
