import { betterAuth } from "better-auth"
import { genericOAuth } from "better-auth/plugins"

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,

  plugins: [
    genericOAuth({
      config: [
        {
          providerId: "fusionauth",
          clientId: process.env.FUSIONAUTH_CLIENT_ID!,
          clientSecret: process.env.FUSIONAUTH_CLIENT_SECRET!,
          discoveryUrl: `${process.env.FUSIONAUTH_URL}/.well-known/openid-configuration${process.env.FUSIONAUTH_TENANT_ID ? `?tenantId=${process.env.FUSIONAUTH_TENANT_ID}` : ""}`,
          scopes: ["openid", "email", "profile"],
          mapProfileToUser: (profile) => ({
            name: profile.name ?? profile.email?.split("@")[0] ?? profile.sub,
            email: profile.email,
            image: profile.picture,
          }),
        },
      ],
    }),
  ],
})
