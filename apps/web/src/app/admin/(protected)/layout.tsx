import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminSWRProvider } from "@/components/providers/SWRProvider";
import { adminAuth } from "@/lib/auth";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await adminAuth.api.getSession({ headers: await headers() });
  if (session?.user.role !== "admin") redirect("/admin/login");
  return <AdminSWRProvider>{children}</AdminSWRProvider>;
}
