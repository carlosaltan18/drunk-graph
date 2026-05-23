import createClient from "openapi-fetch"
import type { paths } from "@generated/admin-api/schema.d.ts"
import { adminAuth } from "@/lib/auth"
import { headers } from "next/headers"

// Hits Spring admin endpoints with an admin-tenant JWT — use in Server Components and Route Handlers only
export async function createAdminApi() {
  const reqHeaders = await headers()
  const tokenData = await adminAuth.api.getAccessToken({
    body: { providerId: "fusionauth-admin" },
    headers: reqHeaders,
  })

  return createClient<paths>({
    baseUrl: process.env.SPRING_API_URL,
    headers: {
      Authorization: `Bearer ${tokenData?.accessToken ?? ""}`,
    },
  })
}
