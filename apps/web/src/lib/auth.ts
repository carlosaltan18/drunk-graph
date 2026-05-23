import { betterAuth } from "better-auth"
import { genericOAuth } from "better-auth/plugins"

const sharedConfig = {
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,
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
    },
  },
}

function mapProfileToUser(role: "user" | "admin") {
  return (profile: Record<string, unknown>) => ({
    name: (profile.name as string) ?? (profile.email as string)?.split("@")[0] ?? profile.sub,
    email: profile.email,
    image: profile.picture,
    role,
  })
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
          clientId: process.env.FUSIONAUTH_CLIENT_ID!,
          clientSecret: process.env.FUSIONAUTH_CLIENT_SECRET!,
          discoveryUrl: `${process.env.FUSIONAUTH_URL}/.well-known/openid-configuration`,
          scopes: ["openid", "email", "profile"],
          mapProfileToUser: mapProfileToUser("user"),
        },
      ],
    }),
  ],
})

export const adminAuth = betterAuth({
  ...sharedConfig,
  basePath: "/api/auth/admin",
  advanced: { cookiePrefix: "ba-admin" },
  plugins: [
    genericOAuth({
      config: [
        {
          providerId: "fusionauth-admin",
          clientId: process.env.BACKOFFICE_CLIENT_ID!,
          clientSecret: process.env.BACKOFFICE_CLIENT_SECRET!,
          discoveryUrl: `${process.env.FUSIONAUTH_URL}/.well-known/openid-configuration`,
          scopes: ["openid", "email", "profile"],
          mapProfileToUser: mapProfileToUser("admin"),
        },
      ],
    }),
  ],
})
