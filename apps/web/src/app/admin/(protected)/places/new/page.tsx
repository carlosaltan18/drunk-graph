import { headers } from "next/headers";
import { CreateVenuePage } from "@/components/magicpath/admin-venue-creator-full-page/CreateVenuePage";
import { adminAuth } from "@/lib/auth";

export default async function NewVenuePage() {
  const session = await adminAuth.api.getSession({ headers: await headers() });

  return <CreateVenuePage userEmail={session!.user.email} />;
}
