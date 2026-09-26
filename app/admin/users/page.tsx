import AdminGuard from '@/components/AdminGuard';
import UsersManage from '@/components/admin/UsersManage';

export default function Page() {
  return <AdminGuard title="Manage User"><UsersManage /></AdminGuard>;
}
