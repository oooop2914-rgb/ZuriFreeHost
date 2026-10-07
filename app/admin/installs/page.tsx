import AdminGuard from '@/components/AdminGuard';
import InstallsAdmin from '@/components/admin/InstallsAdmin';
export default function Page() { return <AdminGuard title="Job Install Panel"><InstallsAdmin /></AdminGuard>; }
