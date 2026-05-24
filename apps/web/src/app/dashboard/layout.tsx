import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SWRProvider } from "@/components/providers/SWRProvider";
import { auth } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  return <SWRProvider>{children}</SWRProvider>;
}
