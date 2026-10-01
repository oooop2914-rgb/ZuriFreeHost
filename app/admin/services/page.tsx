import AdminGuard from '@/components/AdminGuard';
import ServicesConfig from '@/components/admin/ServicesConfig';
export default function Page() { return <AdminGuard title="Layanan & Harga"><ServicesConfig /></AdminGuard>; }
