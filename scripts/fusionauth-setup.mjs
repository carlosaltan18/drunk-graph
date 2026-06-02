#!/usr/bin/env node
/**
 * Bootstraps a FusionAuth instance with the drunkgraph configuration.
 * Equivalent to running kickstart.json, but works against any existing instance.
 *
 * Usage:
 *   node scripts/fusionauth-setup.mjs
 *
 * Reads from environment variables — load your .env.prod first:
 *   set -a && source .env.prod && set +a && node scripts/fusionauth-setup.mjs
 */

import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const required = [
  "FUSIONAUTH_URL",
  "FUSIONAUTH_API_KEY",
  "FUSIONAUTH_ADMIN_EMAIL",
  "FUSIONAUTH_ADMIN_PASSWORD",
  "FUSIONAUTH_ISSUER_URL",
  "DRUNKGRAPH_TENANT_ID",
  "DRUNKGRAPH_APPLICATION_ID",
  "DRUNKGRAPH_CLIENT_SECRET",
  "BACKOFFICE_TENANT_ID",
  "BACKOFFICE_APPLICATION_ID",
  "BACKOFFICE_CLIENT_SECRET",
  "BACKOFFICE_USER_EMAIL",
  "BACKOFFICE_USER_PASSWORD",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GITHUB_CLIENT_ID",
  "GITHUB_CLIENT_SECRET",
  "NEXT_PUBLIC_APP_URL",
];

for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing required env var: ${key}`);
    process.exit(1);
  }
}

const FA_URL = process.env.FUSIONAUTH_URL.replace(/\/$/, "");
const API_KEY = process.env.FUSIONAUTH_API_KEY;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");

const THEME_ID = randomUUID();
const BACKOFFICE_THEME_ID = randomUUID();

const OAUTH2_AUTHORIZE_FTL = readFileSync(
  resolve(__dirname, "../fusionauth/templates/oauth2Authorize.ftl"),
  "utf8",
);
const OAUTH2_AUTHORIZE_BACKOFFICE_FTL = readFileSync(
  resolve(__dirname, "../fusionauth/templates/oauth2AuthorizeBackoffice.ftl"),
  "utf8",
);

async function fa(method, path, body, tenantId) {
  const headers = {
    "Authorization": API_KEY,
    "Content-Type": "application/json",
  };
  if (tenantId) headers["X-FusionAuth-TenantId"] = tenantId;

  const res = await fetch(`${FA_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const json = text ? JSON.parse(text) : {};

  if (!res.ok) {
    console.error(`  FAIL ${method} ${path} → ${res.status}`);
    console.error(" ", JSON.stringify(json, null, 2));
    process.exit(1);
  }

  console.log(`  OK   ${method} ${path} → ${res.status}`);
  return json;
}

console.log(`\nConnecting to FusionAuth at ${FA_URL}\n`);

// 1. DrunkGraph theme
console.log("--- DrunkGraph theme ---");
await fa("POST", `/api/theme/${THEME_ID}`, {
  sourceThemeId: "75a068fd-e94b-451a-9aeb-3ddb9a3b5987",
  theme: { name: "DrunkGraph Theme" },
});
await fa("PATCH", `/api/theme/${THEME_ID}`, {
  theme: { templates: { oauth2Authorize: OAUTH2_AUTHORIZE_FTL } },
});

// 2. DrunkGraph tenant
console.log("\n--- DrunkGraph tenant ---");
await fa("POST", `/api/tenant/${process.env.DRUNKGRAPH_TENANT_ID}`, {
  tenant: {
    name: "DrunkGraph",
    issuer: process.env.FUSIONAUTH_ISSUER_URL,
    themeId: THEME_ID,
  },
});

// 3. DrunkGraph application
console.log("\n--- DrunkGraph application ---");
await fa(
  "POST",
  `/api/application/${process.env.DRUNKGRAPH_APPLICATION_ID}`,
  {
    application: {
      name: "DrunkGraph",
      oauthConfiguration: {
        clientSecret: process.env.DRUNKGRAPH_CLIENT_SECRET,
        authorizedRedirectURLs: [
          `${APP_URL}/api/auth/oauth2/callback/fusionauth`,
        ],
        clientAuthenticationPolicy: "Required",
        logoutURL: APP_URL,
        requireRegistration: false,
        enabledGrants: ["authorization_code", "refresh_token"],
        generateRefreshTokens: true,
      },
      jwtConfiguration: {
        enabled: true,
        timeToLiveInSeconds: 3600,
        refreshTokenTimeToLiveInMinutes: 43200,
      },
      registrationConfiguration: { enabled: false },
    },
  },
  process.env.DRUNKGRAPH_TENANT_ID,
);

// 4. Google identity provider
console.log("\n--- Google IdP ---");
await fa(
  "POST",
  "/api/identity-provider",
  {
    identityProvider: {
      type: "Google",
      name: "Google",
      enabled: true,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      buttonText: "Sign in with Google",
      scope: "openid email profile",
      applicationConfiguration: {
        [process.env.DRUNKGRAPH_APPLICATION_ID]: {
          enabled: true,
          createRegistration: true,
        },
      },
    },
  },
  process.env.DRUNKGRAPH_TENANT_ID,
);

// 5. GitHub identity provider
console.log("\n--- GitHub IdP ---");
await fa(
  "POST",
  "/api/identity-provider",
  {
    identityProvider: {
      type: "OpenIDConnect",
      name: "GitHub",
      enabled: true,
      buttonText: "Sign in with GitHub",
      buttonImageURL: "https://github.githubassets.com/favicons/favicon.svg",
      oauth2: {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        clientAuthenticationMethod: "client_secret_basic",
        authorization_endpoint: "https://github.com/login/oauth/authorize",
        token_endpoint: "https://github.com/login/oauth/access_token",
        userinfo_endpoint: "https://api.github.com/user",
        scope: "user:email",
        emailClaim: "email",
        uniqueIdClaim: "id",
        usernameClaim: "login",
      },
      applicationConfiguration: {
        [process.env.DRUNKGRAPH_APPLICATION_ID]: {
          enabled: true,
          createRegistration: true,
        },
      },
    },
  },
  process.env.DRUNKGRAPH_TENANT_ID,
);

// 6. Backoffice theme
console.log("\n--- Backoffice theme ---");
await fa("POST", `/api/theme/${BACKOFFICE_THEME_ID}`, {
  sourceThemeId: "75a068fd-e94b-451a-9aeb-3ddb9a3b5987",
  theme: { name: "DrunkGraph Backoffice Theme" },
});
await fa("PATCH", `/api/theme/${BACKOFFICE_THEME_ID}`, {
  theme: {
    templates: { oauth2Authorize: OAUTH2_AUTHORIZE_BACKOFFICE_FTL },
  },
});

// 7. Backoffice tenant
console.log("\n--- Backoffice tenant ---");
await fa("POST", `/api/tenant/${process.env.BACKOFFICE_TENANT_ID}`, {
  tenant: {
    name: "DrunkGraph Backoffice",
    issuer: process.env.FUSIONAUTH_ISSUER_URL,
    themeId: BACKOFFICE_THEME_ID,
  },
});

// 8. Backoffice application
console.log("\n--- Backoffice application ---");
await fa(
  "POST",
  `/api/application/${process.env.BACKOFFICE_APPLICATION_ID}`,
  {
    application: {
      name: "DrunkGraph Backoffice",
      oauthConfiguration: {
        clientSecret: process.env.BACKOFFICE_CLIENT_SECRET,
        authorizedRedirectURLs: [
          `${APP_URL}/api/auth/admin/oauth2/callback/fusionauth-admin`,
        ],
        clientAuthenticationPolicy: "Required",
        logoutURL: APP_URL,
        requireRegistration: true,
        enabledGrants: ["authorization_code", "refresh_token"],
        generateRefreshTokens: true,
      },
      jwtConfiguration: {
        enabled: true,
        timeToLiveInSeconds: 3600,
        refreshTokenTimeToLiveInMinutes: 43200,
      },
      registrationConfiguration: { enabled: false },
    },
  },
  process.env.BACKOFFICE_TENANT_ID,
);

// 9. Backoffice admin user
console.log("\n--- Backoffice admin user ---");
await fa(
  "POST",
  "/api/user/registration",
  {
    user: {
      email: process.env.BACKOFFICE_USER_EMAIL,
      password: process.env.BACKOFFICE_USER_PASSWORD,
      firstName: "Admin",
    },
    registration: { applicationId: process.env.BACKOFFICE_APPLICATION_ID },
  },
  process.env.BACKOFFICE_TENANT_ID,
);

// 10. CORS
console.log("\n--- CORS ---");
await fa("PATCH", "/api/system-configuration", {
  systemConfiguration: {
    corsConfiguration: {
      enabled: true,
      allowCredentials: true,
      allowedOrigins: ["https://accounts.google.com"],
      allowedMethods: ["GET", "POST"],
      allowedHeaders: ["Accept", "Content-Type", "Authorization"],
    },
  },
});

// 11. FusionAuth superadmin user
console.log("\n--- FusionAuth admin user ---");
await fa("POST", "/api/user/registration", {
  user: {
    email: process.env.FUSIONAUTH_ADMIN_EMAIL,
    password: process.env.FUSIONAUTH_ADMIN_PASSWORD,
  },
  registration: {
    applicationId: "3c219e58-ed0e-4b18-ad48-f4f92793ae32", // FusionAuth built-in admin app ID
    roles: ["admin"],
  },
});

console.log("\n✓ FusionAuth setup complete\n");
console.log("Add these to your Next.js prod env:");
console.log(`  FUSIONAUTH_CLIENT_ID=${process.env.DRUNKGRAPH_APPLICATION_ID}`);
console.log(`  FUSIONAUTH_CLIENT_SECRET=${process.env.DRUNKGRAPH_CLIENT_SECRET}`);
console.log(`  BACKOFFICE_CLIENT_ID=${process.env.BACKOFFICE_APPLICATION_ID}`);
console.log(`  BACKOFFICE_CLIENT_SECRET=${process.env.BACKOFFICE_CLIENT_SECRET}`);
