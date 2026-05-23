import createClient from "openapi-fetch"
import type { paths } from "@generated/api/schema.d.ts"

export const clientApi = createClient<paths>({ baseUrl: "/api/proxy" })
