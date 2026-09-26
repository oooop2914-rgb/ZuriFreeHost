import AdminGuard from '@/components/AdminGuard';
import AuditLog from '@/components/admin/AuditLog';

export default function Page() {
  return <AdminGuard title="Audit Log"><AuditLog /></AdminGuard>;
}
