import AdminGuard from '@/components/AdminGuard';
import Overview from '@/components/admin/Overview';

export default function Page() {
  return <AdminGuard title="Admin Overview"><Overview /></AdminGuard>;
}
