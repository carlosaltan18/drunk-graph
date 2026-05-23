# Authentication & Authorization

## Overview

DrunkGraph uses a three-layer auth stack:

```
User → FusionAuth (identity) → BetterAuth (session) → Spring API (resource server)
```

Each layer has a distinct responsibility. No layer duplicates another's job.

There are two separate auth contexts — **user** and **admin** — both served by the same Next.js app and the same FusionAuth instance, but completely isolated from each other.

---

## FusionAuth — Identity Provider

FusionAuth is the source of truth for identity. It handles:

- OAuth2 login via **Google** (native IdP) and **GitHub** (OpenIDConnect bridge) for users
- Username/password login for admin users
- Issuing signed **JWTs (RS256)** after successful login
- Issuing **refresh tokens** (TTL: 30 days)

### Two Tenants

FusionAuth is configured with two tenants, provisioned via `kickstart.json` on first startup:

| Tenant | Purpose | Env var |
|---|---|---|
| `DrunkGraph` | Regular users (Google, GitHub login) | `DRUNKGRAPH_TENANT_ID` |
| `DrunkGraph Backoffice` | Admin users only (`requireRegistration: true`) | `BACKOFFICE_TENANT_ID` |

Each tenant has its own application (OAuth2 client), its own JWT signing keys, and its own callback URL. Tenants are fully isolated — a user account in one tenant cannot authenticate against the other.

### Bootstrapping (kickstart.json)

On first startup, FusionAuth runs `kickstart.json` which:

1. Creates both tenants with fixed UUIDs
2. Creates an application per tenant (UUID = OAuth2 `client_id`)
3. Registers Google and GitHub as IdPs on the DrunkGraph tenant
4. Creates a default admin user in the Backoffice tenant
5. Applies the custom login theme to the DrunkGraph tenant

Fixed UUIDs ensure the issuer URI is stable across restarts — Spring doesn't need reconfiguration.

### JWT Claims

| Claim | Value |
|---|---|
| `sub` | FusionAuth user UUID |
| `iss` | `http://localhost:9011` |
| `aud` | Application UUID (`client_id`) |
| `tid` | Tenant UUID |
| `email` | User email |
| `exp` / `iat` | Expiry / issued-at (TTL: 1 hour) |

---

## BetterAuth — Session Manager (Next.js)

BetterAuth runs inside the Next.js app (`apps/web/src/lib/auth.ts`). It manages browser sessions via httpOnly cookies and handles the OAuth2 callback from FusionAuth.

### Two Instances

Because we need simultaneous independent sessions (a user session and an admin session can coexist in the same browser), we run two separate BetterAuth instances with isolated cookie namespaces:

| Instance | Export | Cookie prefix | Route | Provider |
|---|---|---|---|---|
| User auth | `auth` | `ba-user` | `/api/auth` | `fusionauth` |
| Admin auth | `adminAuth` | `ba-admin` | `/api/auth/admin` | `fusionauth-admin` |

Each instance writes its own cookies independently. Both can be active simultaneously. Switching between them is just a `router.push` to the other app's route — no token swapping.

> **Why two instances instead of BetterAuth's `multiSession` plugin?**
> `multiSession` stores session tokens in `_multi-*` cookies but still calls `internalAdapter.findSessions()` — a database lookup — to validate them. Since the app is stateless (no database), `multiSession` doesn't work. Two instances with separate cookie namespaces is the correct stateless alternative.

### Stateless Sessions

Neither instance has a database configured. BetterAuth runs in stateless mode:

```ts
session: {
  cookieCache: {
    enabled: true,
    strategy: "jwt",   // session data encoded in a signed JWT cookie
    refreshCache: true // refresh without hitting a DB
  }
}
```

Session data is encoded directly in the cookie. No database is queried to validate sessions.

`account.storeAccountCookie: true` is also required — without it, `getAccessToken()` tries a DB lookup for the account record (to find the stored FusionAuth access token) and fails. With this option, the account data is stored in a separate signed cookie after OAuth.

### Role in Session

Each provider's `mapProfileToUser` sets a `role` field on the user:

- `fusionauth` provider → `role: "user"`
- `fusionauth-admin` provider → `role: "admin"`

The role is encoded in the session JWT cookie via `user.additionalFields`. Server components read `session.user.role` to determine which context the user is in — no database lookup, no extra API call.

### Login Flow

```
1. User visits /login (or /admin/login)
2. BetterAuth redirects to FusionAuth login page
3. FusionAuth handles IdP exchange (Google/GitHub for users, credentials for admin)
4. FusionAuth issues an authorization_code
5. BetterAuth exchanges it for access_token + refresh_token
6. BetterAuth creates a signed session cookie, stores FusionAuth token in account cookie
7. User lands on /dashboard (or /admin/dashboard)
```

### Sign-out Flow

Sign-out must clear both the BetterAuth cookie and the FusionAuth session. The flow:

```
1. "Sign out" button calls a server action
2. Server action redirects to /api/auth-actions/sign-out?role=
3. Route handler calls auth.api.signOut() — can write Set-Cookie headers
4. Route handler redirects to FusionAuth /oauth2/logout?client_id=
5. FusionAuth clears its session, redirects back to localhost:3000
```

> **Why a Route Handler and not a Server Action for sign-out?**
> Server actions can read cookies but cannot write them on the response. Clearing a cookie requires setting it with `maxAge=0` on the response, which only Route Handlers can do.

---

## Spring API — Resource Server

Spring Boot validates JWTs but never issues them. It is a pure OAuth2 Resource Server.

### Two Filter Chains

Spring has two security filter chains — one per tenant — each configured with the tenant's own JWKS URI:

| Chain | Routes | JWKS |
|---|---|---|
| Client chain | `/api/**` (excluding `/api/admin/**`) | `FUSIONAUTH_JWKS_URI` |
| Admin chain | `/api/admin/**` | `BACKOFFICE_JWKS_URI` |

This means a user JWT cannot access admin endpoints and an admin JWT cannot access client endpoints — enforced at the JWT signature level by Spring, not just by role checks.

### Validation

On every authenticated request Spring:

1. Extracts the `Bearer` token from the `Authorization` header
2. Fetches FusionAuth's public keys from the appropriate JWKS URI (cached)
3. Verifies the JWT signature (RS256), expiry, and issuer
4. Populates the `SecurityContext` with the JWT principal

No shared secret. No database lookup. Pure asymmetric cryptography.

### The Proxy Bridge

The browser never calls Spring directly. Client-side API calls go through:

```
Browser → Next.js /api/proxy/[...path] → Spring /api/[...path]
```

The proxy route handler:
1. Checks the BetterAuth session — returns 401 if none
2. Calls `auth.api.getAccessToken({ providerId: "fusionauth" })` — gets the FusionAuth JWT (refreshing if needed via the account cookie)
3. Forwards the request to Spring with `Authorization: Bearer <fusionauth_jwt>`
4. Returns the Spring response to the browser

Server components calling Spring directly use `createServerApi()` (user) or `createAdminApi()` (admin), which do the same token retrieval server-side.

The FusionAuth JWT never touches the browser. The browser only holds BetterAuth session cookies.

---

## User Provisioning

FusionAuth creates users in its own database. Neo4j knows nothing about them until they appear in the graph. We provision Neo4j users lazily on the first authenticated API request using a custom `JwtAuthenticationConverter`.

```
JWT validated by Spring Security
        ↓
ProvisioningJwtAuthenticationConverter.convert(jwt)
        ↓
ProvisionUserUseCase.execute(sub, email, name)
        ↓
in-memory cache hit? → skip
        ↓ (miss)
Neo4j: MERGE (u:User {id: $sub}) ON CREATE SET u.email = $email, u.name = $name
        ↓
add sub to in-memory cache
```

The `ConcurrentHashMap`-backed cache ensures only one Neo4j round-trip per user per process lifetime. After the first request, every subsequent request is a nanosecond cache lookup.

---

## Session Bar UI

Both apps show a persistent session bar at the top of authenticated pages:

- **User app** (`/dashboard/*`) — neutral bar via `UserSessionBar` server component
- **Admin app** (`/admin/*`) — amber/warning bar via `AdminSessionBar` server component

Each bar reads only its own auth instance server-side. If both sessions are active simultaneously, the bar shows a "Switch to backoffice ↗" / "Switch to user app ↗" button that navigates to the other app — no token swapping required.

---

## Managing Admin Users

Admin users are managed by the FusionAuth super-admin — whoever operates the infrastructure. The backoffice itself has no user management UI, and that's intentional.

```
FusionAuth super-admin (localhost:9011)
    └── creates/manages users in the Backoffice tenant
            └── those users log in at /admin/login
                    └── and do their work in the backoffice
```

**To add a new admin user:**
1. Log into FusionAuth at `http://localhost:9011` (or your production URL) as the super-admin
2. Navigate to Users → Add user
3. Set the tenant to **DrunkGraph Backoffice**
4. Create the user — they can now log in at `/admin/login`

The backoffice will not expose a "create admin user" flow. Admin user management is an ops concern, not a product feature. If it becomes necessary (e.g. non-technical operators need to manage admins), a thin wrapper around the FusionAuth API (`POST /api/user/registration`) can be added at that point.

---

## Security Boundaries

| Boundary | Mechanism |
|---|---|
| Browser ↔ Next.js | BetterAuth session cookies (`ba-user.*`, `ba-admin.*`, httpOnly, SameSite) |
| Next.js ↔ Spring (client) | FusionAuth JWT from DrunkGraph tenant |
| Next.js ↔ Spring (admin) | FusionAuth JWT from Backoffice tenant |
| Spring ↔ FusionAuth | JWKS public key fetch (read-only, no secret) |
| FusionAuth ↔ Google/GitHub | OAuth2 server-side (credentials never leave FusionAuth) |

FusionAuth JWTs never reach the browser. Google and GitHub credentials never leave FusionAuth. Admin JWTs are rejected by Spring's client filter chain and vice versa.
