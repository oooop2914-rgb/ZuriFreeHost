import AdminGuard from '@/components/AdminGuard';
import SystemControl from '@/components/admin/SystemControl';
export default function Page() { return <AdminGuard title="System Control"><SystemControl /></AdminGuard>; }
