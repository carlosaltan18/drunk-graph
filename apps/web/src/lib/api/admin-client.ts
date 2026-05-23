import createClient from "openapi-fetch"
import type { paths } from "@generated/admin-api/schema.d.ts"

export const adminClientApi = createClient<paths>({ baseUrl: "/api/admin-proxy" })
