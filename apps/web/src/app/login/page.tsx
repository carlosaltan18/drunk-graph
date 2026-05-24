import { Suspense } from "react";
import { DrunkGraphSplash } from "@/components/magicpath/client-login-splash/DrunkGraphSplash";

export default function LoginPage() {
  return (
    <Suspense>
      <DrunkGraphSplash />
    </Suspense>
  );
}
