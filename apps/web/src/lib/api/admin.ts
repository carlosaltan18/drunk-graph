import type { paths } from "@generated/admin-api/schema.d.ts";
import { headers } from "next/headers";
import createClient from "openapi-fetch";
import { adminAuth } from "@/lib/auth";
import { env } from "@/lib/env.server";
import { patchedFetch } from "@/lib/utils";

// Hits Spring admin endpoints with an admin-tenant JWT — use in Server Components and Route Handlers only
export async function createAdminApi() {
  const reqHeaders = await headers();
  const tokenData = await adminAuth.api.getAccessToken({
    body: { providerId: "fusionauth-admin" },
    headers: reqHeaders,
  });

  return createClient<paths>({
    baseUrl: env.SPRING_API_URL,
    fetch: patchedFetch,
    headers: {
      Authorization: `Bearer ${tokenData?.accessToken ?? ""}`,
    },
  });
}
