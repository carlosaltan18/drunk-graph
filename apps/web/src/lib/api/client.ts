import createClient from "openapi-fetch"
import type { paths } from "@generated/api/schema.d.ts"

// Hits /api/proxy — no auth needed, session cookie handled by the browser
export const clientApi = createClient<paths>({ baseUrl: "/api/proxy" })
