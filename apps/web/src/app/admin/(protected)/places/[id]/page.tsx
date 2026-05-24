import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { AdminDrinkEditor } from "@/components/magicpath/admin-venue-list/AdminDrinkEditor";
import { createAdminApi } from "@/lib/api/admin";
import { adminAuth } from "@/lib/auth";

export default async function PlacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await adminAuth.api.getSession({ headers: await headers() });

  const api = await createAdminApi();
  const [{ data: places }, { data: drinks }] = await Promise.all([
    api.GET("/api/admin/places"),
    api.GET("/api/admin/drinks", { params: { query: { placeId: id } } }),
  ]);

  const place = places?.elements?.find((p) => p.id === id);
  if (!place) notFound();

  return (
    <AdminDrinkEditor
      place={place}
      drinks={drinks ?? {}}
      userEmail={session!.user.email}
    />
  );
}
