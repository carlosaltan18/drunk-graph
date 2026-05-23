import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { createServerApi } from '@/lib/api/server';
import { ProfileScreen } from '@/components/magicpath/client-profile/ProfileScreen';

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/login');

  const api = await createServerApi();
  const [{ data: user }, { data: tastes }, { data: consumption }] = await Promise.all([
    api.GET('/api/users/me'),
    api.GET('/api/users/me/tastes'),
    api.GET('/api/users/me/consumption', { params: { query: { limit: 100 } } }),
  ]);

  return (
    <ProfileScreen
      user={user ?? {}}
      tastes={tastes ?? {}}
      consumption={consumption ?? []}
    />
  );
}
