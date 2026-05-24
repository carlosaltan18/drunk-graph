import { toNextJsHandler } from "better-auth/next-js";
import { adminAuth } from "@/lib/auth";

export const { GET, POST } = toNextJsHandler(adminAuth);
