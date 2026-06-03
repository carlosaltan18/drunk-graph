import { betterAuth } from "better-auth";
import { genericOAuth } from "better-auth/plugins";
import { env } from "@/lib/env.server";

const sharedConfig = {
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  account: {
    storeAccountCookie: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string" as const,
        required: false,
        defaultValue: "user",
        input: false,
      },
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      strategy: "jwt" as const,
      refreshCache: true,
      maxAge: 60 * 60 * 24 * 30, // 30 days — matches FusionAuth refresh token TTL
    },
  },
};

function mapProfileToUser(role: "user" | "admin") {
  return (profile: Record<string, unknown>) => {
    const email = typeof profile.email === "string" ? profile.email : undefined;
    const image =
      typeof profile.picture === "string" ? profile.picture : undefined;
    const name =
      typeof profile.name === "string"
        ? profile.name
        : (email?.split("@")[0] ?? String(profile.sub ?? ""));
    return { name, email, image, role };
  };
}

export const auth = betterAuth({
  ...sharedConfig,
  basePath: "/api/auth",
  advanced: { cookiePrefix: "ba-user" },
  plugins: [
    genericOAuth({
      config: [
        {
          providerId: "fusionauth",
          clientId: env.FUSIONAUTH_CLIENT_ID,
          clientSecret: env.FUSIONAUTH_CLIENT_SECRET,
          discoveryUrl: `${env.FUSIONAUTH_URL}/.well-known/openid-configuration`,
          scopes: ["openid", "email", "profile", "offline_access"],
          accessTokenExpiresIn: 3600,
          mapProfileToUser: mapProfileToUser("user"),
        },
      ],
    }),
  ],
});

export const adminAuth = betterAuth({
  ...sharedConfig,
  basePath: "/api/auth/admin",
  advanced: { cookiePrefix: "ba-admin" },
  plugins: [
    genericOAuth({
      config: [
        {
          providerId: "fusionauth-admin",
          clientId: env.BACKOFFICE_CLIENT_ID,
          clientSecret: env.BACKOFFICE_CLIENT_SECRET,
          discoveryUrl: `${env.FUSIONAUTH_URL}/.well-known/openid-configuration`,
          scopes: ["openid", "email", "profile", "offline_access"],
          accessTokenExpiresIn: 3600,
          mapProfileToUser: mapProfileToUser("admin"),
        },
      ],
    }),
  ],
});
