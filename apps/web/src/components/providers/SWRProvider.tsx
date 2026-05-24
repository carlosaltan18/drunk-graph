"use client";
import { toast } from "sonner";
import { SWRConfig } from "swr";

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        onError: (err) =>
          toast.error(
            err instanceof Error ? err.message : "Something went wrong",
          ),
      }}
    >
      {children}
    </SWRConfig>
  );
}
