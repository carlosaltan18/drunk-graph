import { SWRProvider } from "@/components/providers/SWRProvider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SWRProvider>{children}</SWRProvider>;
}
