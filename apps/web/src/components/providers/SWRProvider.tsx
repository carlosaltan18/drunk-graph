"use client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SWRConfig } from "swr";
import { ApiError } from "@/lib/api/error";

function makeSWRConfig(signOutUrl: string, router: ReturnType<typeof useRouter>) {
  return {
    onError: (err: unknown) => {
      if (err instanceof ApiError && err.statusCode === 401) {
        router.push(signOutUrl);
        return;
      }
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    },
  };
}

export function UserSWRProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <SWRConfig value={makeSWRConfig("/api/auth-actions/sign-out?role=user", router)}>
      {children}
    </SWRConfig>
  );
}

export function AdminSWRProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <SWRConfig value={makeSWRConfig("/api/auth-actions/sign-out?role=admin", router)}>
      {children}
    </SWRConfig>
  );
}
