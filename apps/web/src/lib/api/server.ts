import createClient from "openapi-fetch"
import type { paths } from "@generated/api/schema.d.ts"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

// Hits Spring directly with the FusionAuth JWT — use in Server Components and Route Handlers only
export async function createServerApi() {
  const reqHeaders = await headers()
  const tokenData = await auth.api.getAccessToken({
    body: { providerId: "fusionauth" },
    headers: reqHeaders,
  })

  return createClient<paths>({
    baseUrl: process.env.SPRING_API_URL,
    headers: {
      Authorization: `Bearer ${tokenData?.accessToken ?? ""}`,
    },
  })
}
