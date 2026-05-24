"use client";
import { ServerError500Screen } from "@/components/magicpath/500-server-error/ServerError500Screen";

export default function AdminError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return <ServerError500Screen variant="admin" reset={reset} />;
}
