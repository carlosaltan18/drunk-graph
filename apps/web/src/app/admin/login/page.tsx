import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AdminSplash } from "@/components/magicpath/admin-login-splash/AdminSplash";
import { adminAuth } from "@/lib/auth";

export default async function AdminLoginPage() {
  const session = await adminAuth.api.getSession({ headers: await headers() });
  if (session) redirect("/admin/dashboard");

  return (
    <Suspense>
      <AdminSplash />
    </Suspense>
  );
}
