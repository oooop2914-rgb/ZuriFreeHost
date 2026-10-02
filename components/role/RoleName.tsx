import { roleMeta, type RoleSlug } from '@/lib/roles';
import { cn } from '@/lib/utils';

export default function RoleName({ role, children, className }: { role: RoleSlug | string; children: React.ReactNode; className?: string }) {
  const meta = roleMeta(role);
  return <span className={cn('role-name', `role-${meta.name}`, className)}>{children}</span>;
}
