import { createServerApi } from '@/lib/api/server';
import { ProfileScreen } from '@/components/magicpath/client-profile/ProfileScreen';

export default async function ProfilePage() {
  const api = await createServerApi();
  const [{ data: user }, { data: tastes }, { data: consumption }] = await Promise.all([
    api.GET('/api/users/me'),
    api.GET('/api/users/me/tastes'),
    api.GET('/api/users/me/consumption', { params: { query: { limit: 100 } } }),
  ]);

  return (
    <ProfileScreen
      user={user ?? {}}
      fallbackTastes={tastes ?? {}}
      fallbackConsumption={consumption ?? []}
    />
  );
}
