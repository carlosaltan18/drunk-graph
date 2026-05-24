import { cleanEnv, str, url } from "envalid";

export const env = cleanEnv(process.env, {
  // BetterAuth
  BETTER_AUTH_SECRET: str(),
  BETTER_AUTH_URL: url(),

  // FusionAuth — client app
  FUSIONAUTH_CLIENT_ID: str(),
  FUSIONAUTH_CLIENT_SECRET: str(),
  FUSIONAUTH_URL: url(),

  // FusionAuth — admin/backoffice app
  BACKOFFICE_CLIENT_ID: str(),
  BACKOFFICE_CLIENT_SECRET: str(),

  // Spring API
  SPRING_API_URL: url(),

  // Public
  NEXT_PUBLIC_APP_URL: url(),
});
