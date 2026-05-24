import type { paths } from "@generated/api/schema.d.ts";
import createClient from "openapi-fetch";

export const clientApi = createClient<paths>({ baseUrl: "/api/proxy" });
