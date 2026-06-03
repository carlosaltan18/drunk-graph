import { headers } from "next/headers";
import { AdminDrinkCreator } from "@/components/magicpath/admin-drink-creator/AdminDrinkCreator";
import { adminAuth } from "@/lib/auth";

export default async function ImportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await adminAuth.api.getSession({ headers: await headers() });

  // biome-ignore lint/style/noNonNullAssertion: layout redirects if no session
  return <AdminDrinkCreator placeId={id} userEmail={session!.user.email} />;
}
