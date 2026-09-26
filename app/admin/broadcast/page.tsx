import AdminGuard from '@/components/AdminGuard';
import Broadcast from '@/components/admin/Broadcast';

export default function Page() {
  return <AdminGuard title="Broadcast"><Broadcast /></AdminGuard>;
}
