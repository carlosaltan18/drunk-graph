import { headers } from "next/headers";
import { CreateVenuePage } from "@/components/magicpath/admin-venue-creator-full-page/CreateVenuePage";
import { adminAuth } from "@/lib/auth";

export default async function NewVenuePage() {
  const session = await adminAuth.api.getSession({ headers: await headers() });

  // biome-ignore lint/style/noNonNullAssertion: layout redirects if no session
  return <CreateVenuePage userEmail={session!.user.email} />;
}
