import AdminGuard from '@/components/AdminGuard';
import ServiceRequests from '@/components/admin/ServiceRequests';
export default function Page() { return <AdminGuard title="Request Layanan"><ServiceRequests /></AdminGuard>; }
