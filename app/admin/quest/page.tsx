import AdminGuard from '@/components/AdminGuard';
import Quest from '@/components/admin/Quest';

export default function Page() {
  return <AdminGuard title="Quest & Token"><Quest /></AdminGuard>;
}
