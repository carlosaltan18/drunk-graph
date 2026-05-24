"use client";

import { genericOAuthClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  basePath: "/api/auth",
  plugins: [genericOAuthClient()],
});

export const adminAuthClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  basePath: "/api/auth/admin",
  plugins: [genericOAuthClient()],
});
