import AdminGuard from '@/components/AdminGuard';
import ServersManage from '@/components/admin/ServersManage';

export default function Page() {
  return <AdminGuard title="Manage Server"><ServersManage /></AdminGuard>;
}
