import AdminGuard from '@/components/AdminGuard';
import RoleApplications from '@/components/admin/RoleApplications';
export default function Page() { return <AdminGuard title="Role Applications"><RoleApplications /></AdminGuard>; }
