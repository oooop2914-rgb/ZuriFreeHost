import AdminGuard from '@/components/AdminGuard';
import SubdomainsAdmin from '@/components/admin/SubdomainsAdmin';
export default function Page() { return <AdminGuard title="Subdomain User"><SubdomainsAdmin /></AdminGuard>; }
