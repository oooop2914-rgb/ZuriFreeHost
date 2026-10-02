import AdminGuard from '@/components/AdminGuard';
import AdminSettings from '@/components/admin/AdminSettings';
export default function Page() { return <AdminGuard title="Pengaturan Sistem"><AdminSettings /></AdminGuard>; }
