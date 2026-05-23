import { createServerApi } from '@/lib/api/server';
import { ProfileScreen } from '@/components/magicpath/client-profile/ProfileScreen';

export default async function ProfilePage() {
  const api = await createServerApi();
  const [{ data: user }, { data: tastes }, { data: stats }] = await Promise.all([
    api.GET('/api/users/me'),
    api.GET('/api/users/me/tastes'),
    api.GET('/api/users/me/stats'),
  ]);

  return (
    <ProfileScreen
      fallbackUser={user ?? {}}
      fallbackTastes={tastes ?? {}}
      fallbackStats={stats ?? {}}
    />
  );
}
