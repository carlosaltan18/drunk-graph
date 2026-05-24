import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ClientRecommendationFeed } from "@/components/magicpath/client-recommendation-feed/ClientRecommendationFeed";
import { createServerApi } from "@/lib/api/server";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  if (!cookieStore.get("onboarded")) redirect("/dashboard/onboarding");

  const api = await createServerApi();
  const [{ data: recommendations }, { data: tastes }] = await Promise.all([
    api.GET("/api/users/me/recommendations", {
      params: { query: { limit: 20 } },
    }),
    api.GET("/api/users/me/tastes"),
  ]);

  return (
    <ClientRecommendationFeed
      fallbackRecommendations={recommendations ?? []}
      fallbackTastes={tastes ?? {}}
    />
  );
}
