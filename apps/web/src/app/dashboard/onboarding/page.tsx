import { FlavorProfileSetup } from "@/components/magicpath/client-onboarding-flavor-setup/FlavorProfileSetup";
import { createServerApi } from "@/lib/api/server";

export default async function OnboardingPage() {
  const api = await createServerApi();
  const { data: flavors } = await api.GET("/api/flavors");

  return <FlavorProfileSetup flavors={flavors ?? []} />;
}
