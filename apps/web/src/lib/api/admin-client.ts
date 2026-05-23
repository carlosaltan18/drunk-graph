import createClient from "openapi-fetch"
import type { paths } from "@generated/admin-api/schema.d.ts"

// Hits /api/admin-proxy — admin session cookie handled by the browser
export const adminClientApi = createClient<paths>({ baseUrl: "/api/admin-proxy" })
