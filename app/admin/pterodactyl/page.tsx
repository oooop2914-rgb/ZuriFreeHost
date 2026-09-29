import AdminGuard from '@/components/AdminGuard';
import PterodactylConfig from '@/components/admin/PterodactylConfig';

export default function Page() {
  return <AdminGuard title="Pterodactyl Config"><PterodactylConfig /></AdminGuard>;
}
