import UserGuard from '@/components/UserGuard';
import ServerDetail from '@/components/server/ServerDetail';

export default function Page({ params }: { params: { id: string } }) {
  return (
    <UserGuard title="Detail Server">
      <div className="sv-theme" style={{ margin: '-28px -32px', padding: '28px 32px' }}>
        <ServerDetail serverId={params.id} />
      </div>
    </UserGuard>
  );
}
