import { redirect } from 'next/navigation';
import { adminAuth } from '@/lib/auth';
import { headers } from 'next/headers';
import { CreateVenuePage } from '@/components/magicpath/admin-venue-creator-full-page/CreateVenuePage';

export default async function NewVenuePage() {
  const session = await adminAuth.api.getSession({ headers: await headers() });
  if (session?.user.role !== 'admin') redirect('/admin/login');

  return <CreateVenuePage userEmail={session.user.email} />;
}
