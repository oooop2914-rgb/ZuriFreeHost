import UserGuard from '@/components/UserGuard';
import Overview from '@/components/user/Overview';
export default function Page() { return <UserGuard title="Dashboard"><Overview /></UserGuard>; }
