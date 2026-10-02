import AdminGuard from '@/components/AdminGuard';
import Giveaway from '@/components/admin/Giveaway';

export default function Page() {
  return <AdminGuard title="Giveaway"><Giveaway /></AdminGuard>;
}
