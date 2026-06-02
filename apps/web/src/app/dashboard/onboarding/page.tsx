import { FlavorProfileSetup } from "@/components/magicpath/client-onboarding-flavor-setup/FlavorProfileSetup";
import { createServerApi } from "@/lib/api/server";

export default async function OnboardingPage() {
  const api = await createServerApi();
  const [{ data: flavors }, { data: tastes }, { data: user }] = await Promise.all([
    api.GET("/api/flavors"),
    api.GET("/api/users/me/tastes"),
    api.GET("/api/users/me"),
  ]);

  return (
    <FlavorProfileSetup
      flavors={flavors ?? []}
      initialTastes={tastes ?? {}}
      initialBudget={user?.budgetMax ?? 150}
      initialPrefersAlcohol={user?.prefersAlcohol ?? true}
    />
  );
}
