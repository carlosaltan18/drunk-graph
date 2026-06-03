import { headers } from "next/headers";
import { AdminVenueList } from "@/components/magicpath/admin-venue-list/AdminVenueList";
import { createAdminApi } from "@/lib/api/admin";
import { adminAuth } from "@/lib/auth";

export default async function AdminDashboard() {
  const session = await adminAuth.api.getSession({ headers: await headers() });

  const api = await createAdminApi();
  const { data } = await api.GET("/api/admin/places");

  // biome-ignore lint/style/noNonNullAssertion: layout redirects if no session
  return <AdminVenueList fallbackData={data} userEmail={session!.user.email} />;
}
