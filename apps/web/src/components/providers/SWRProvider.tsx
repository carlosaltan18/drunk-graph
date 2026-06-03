"use client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SWRConfig } from "swr";
import { ApiError } from "@/lib/api/error";

const MAX_TOKEN_RETRIES = 3;

function makeSWRConfig(
  signOutUrl: string,
  router: ReturnType<typeof useRouter>,
) {
  return {
    onError: (err: unknown) => {
      if (err instanceof ApiError && err.statusCode === 401) return;
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    },
    onErrorRetry: (
      err: unknown,
      key: string,
      _config: unknown,
      revalidate: (opts: { retryCount: number }) => void,
      { retryCount }: { retryCount: number },
    ) => {
      if (!(err instanceof ApiError) || err.statusCode !== 401) {
        if (retryCount >= 3) return;
        setTimeout(() => revalidate({ retryCount }), 1000 * 2 ** retryCount);
        return;
      }

      if (err.reason === "session_dead") {
        // BetterAuth has nothing — refresh token gone or cookie missing, no point retrying
        console.warn(`[SWR] session_dead on "${key}" — signing out`);
        router.push(signOutUrl);
        return;
      }

      // token_rejected: JWT expired but BetterAuth may still refresh it
      if (retryCount >= MAX_TOKEN_RETRIES) {
        console.warn(
          `[SWR] token_rejected on "${key}" — ${MAX_TOKEN_RETRIES} retries exhausted, signing out`,
        );
        router.push(signOutUrl);
        return;
      }
      const delay = 1000 * 2 ** (retryCount + 1);
      console.warn(
        `[SWR] token_rejected on "${key}" — retry ${retryCount + 1}/${MAX_TOKEN_RETRIES} in ${delay}ms`,
      );
      setTimeout(() => revalidate({ retryCount }), delay);
    },
  };
}

export function UserSWRProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <SWRConfig
      value={makeSWRConfig("/api/auth-actions/sign-out?role=user", router)}
    >
      {children}
    </SWRConfig>
  );
}

export function AdminSWRProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <SWRConfig
      value={makeSWRConfig("/api/auth-actions/sign-out?role=admin", router)}
    >
      {children}
    </SWRConfig>
  );
}
