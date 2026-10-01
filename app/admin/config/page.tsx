import AdminGuard from '@/components/AdminGuard';
import ApiConfig from '@/components/admin/ApiConfig';
export default function Page() { return <AdminGuard title="Konfigurasi API"><ApiConfig /></AdminGuard>; }
