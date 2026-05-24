import type { paths } from "@generated/admin-api/schema.d.ts";
import createClient from "openapi-fetch";

export const adminClientApi = createClient<paths>({
  baseUrl: "/api/admin-proxy",
});
