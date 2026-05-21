# Authentication & User Provisioning

## Overview

DrunkGraph uses a three-layer auth stack:

```
User → FusionAuth (identity) → BetterAuth (session) → Spring API (resource server)
```

Each layer has a distinct responsibility. No layer duplicates another's job.

---

## Layer 1: FusionAuth — Identity Provider

FusionAuth is the source of truth for user identity. It handles:

- OAuth2 login via **Google** (native IdP) and **GitHub** (OpenIDConnect bridge)
- Issuing signed **JWTs (RS256)** after successful login
- Issuing **refresh tokens** (TTL: 30 days)
- Hosting the login UI (custom theme via `oauth2Authorize.ftl`)

### Bootstrapping (kickstart.json)

On first startup, FusionAuth runs `kickstart.json` which:

1. Creates the **DrunkGraph tenant** with a fixed UUID (`DRUNKGRAPH_TENANT_ID`)
2. Creates the **DrunkGraph application** with a fixed UUID (`DRUNKGRAPH_APPLICATION_ID`) — this UUID doubles as the OAuth2 `client_id`
3. Registers **Google** as a native IdP
4. Registers **GitHub** as an OpenIDConnect IdP with manual endpoint configuration (GitHub doesn't expose a discovery URL)
5. Applies the custom login theme

The tenant UUID is fixed (not random) so that the issuer URI (`http://localhost:9011`) is stable and Spring can validate JWTs without configuration changes on restart.

### JWT Claims

FusionAuth JWTs include:

| Claim | Value |
|---|---|
| `sub` | FusionAuth user UUID (stable across logins) |
| `iss` | `http://localhost:9011` (the tenant issuer) |
| `aud` | `DRUNKGRAPH_APPLICATION_ID` |
| `email` | User's email |
| `preferred_username` | Username (GitHub login name, or email prefix for Google) |
| `exp` / `iat` | Standard expiry / issued-at |

TTL is 3600 seconds (1 hour). Refresh tokens are valid for 30 days.

---

## Layer 2: BetterAuth — Session Manager (Next.js)

BetterAuth runs inside the Next.js app (`apps/web/src/lib/auth.ts`). Its job is to:

- Manage the browser session (httpOnly cookie)
- Handle the OAuth2 callback from FusionAuth (`authorization_code` flow)
- Store and refresh the FusionAuth access token transparently

### Why BetterAuth?

Next.js server components and route handlers need a session abstraction. BetterAuth wraps FusionAuth as a `genericOAuth` provider, so the frontend never talks to FusionAuth directly — it talks to BetterAuth, which talks to FusionAuth.

### Login Flow (step by step)

```
1. User clicks "Login" on Next.js
2. Next.js redirects to BetterAuth → /api/auth/signin/fusionauth
3. BetterAuth redirects to FusionAuth login page
4. User picks Google or GitHub
5. FusionAuth handles the IdP OAuth2 exchange internally
6. FusionAuth issues an authorization_code back to BetterAuth
7. BetterAuth exchanges the code for access_token + refresh_token at FusionAuth's token endpoint
8. BetterAuth creates a session, stores the FusionAuth token internally, sets a session cookie
9. User lands on /dashboard
```

### Token Refresh

BetterAuth handles refresh transparently. When `auth.api.getAccessToken()` is called and the token is expired, BetterAuth uses the stored refresh token to get a new one from FusionAuth before returning it. The frontend and Spring API never see an expired token.

---

## Layer 3: Spring API — Resource Server

Spring Boot validates JWTs but **never issues them**. It is a pure OAuth2 Resource Server.

### Validation

Configured in `application.properties`:

```properties
spring.security.oauth2.resourceserver.jwt.issuer-uri=http://localhost:9011
spring.security.oauth2.resourceserver.jwt.jwk-set-uri=http://localhost:9011/.well-known/jwks.json
```

On every authenticated request Spring:

1. Extracts the `Bearer` token from the `Authorization` header
2. Fetches FusionAuth's public keys from `/.well-known/jwks.json` (cached)
3. Verifies the JWT signature (RS256), expiry, and issuer
4. Populates the `SecurityContext` with the JWT principal

No shared secret. No database lookup. Pure asymmetric cryptography.

### The Proxy Bridge

The browser never calls Spring directly. All API calls go through:

```
Browser → Next.js /api/proxy/[...path] → Spring /api/[...path]
```

The proxy route (`apps/web/src/app/api/proxy/[...path]/route.ts`):

1. Checks the BetterAuth session — returns 401 if none
2. Calls `auth.api.getAccessToken({ providerId: "fusionauth" })` — gets the FusionAuth JWT (refreshing if needed)
3. Forwards the request to Spring with `Authorization: Bearer <fusionauth_jwt>`
4. Returns the Spring response to the browser

This means the FusionAuth JWT never touches the browser. The browser only holds the BetterAuth session cookie.

---

## User Provisioning

### The Problem

FusionAuth creates users in its own database. Neo4j knows nothing about them until they appear in the graph. We need a `User` node in Neo4j to attach preferences, likes, and recommendations to.

### Strategy: Lazy Provisioning on First Authenticated Request

We don't use webhooks or eager creation. Instead, we provision the Neo4j user **on the first authenticated API request** using a custom `JwtAuthenticationConverter`.

```
JWT validated by Spring Security
        ↓
ProvisioningJwtAuthenticationConverter.convert(jwt)
        ↓
ProvisionUserUseCase.execute(sub, email, name)
        ↓
in-memory cache hit? → skip
        ↓ (miss)
UserProvisioningPort.provision(sub, email, name)
        ↓
Neo4j: MERGE (u:User {id: $sub}) ON CREATE SET u.email = $email, u.name = $name
        ↓
add sub to in-memory cache
        ↓
Request continues normally
```

### Why a Cache?

`MERGE` is idempotent — safe to call repeatedly — but it still costs a Neo4j round-trip. The `ConcurrentHashMap`-backed set in `ProvisionUserUseCase` ensures we only hit Neo4j once per user per application lifetime. After the first request, every subsequent request is a cache lookup costing ~nanoseconds.

**Trade-off:** If the app restarts, the cache is empty and every user will hit Neo4j once on their next request. This is acceptable — it's bounded by the number of active users, not the number of requests.

### Port / Adapter Pattern

The provisioning logic is decoupled from the Neo4j implementation:

```
ProvisionUserUseCase          — orchestration + cache (modules/user/use_cases/commands/provision_user/)
    └── UserProvisioningPort  — interface (what: provision a user)
            └── NoOpUserProvisioningAdapter   — stub (logs, does nothing) ← replace this
            └── [Neo4jUserProvisioningAdapter] — to be implemented
```

To implement the real adapter, create a `@Component` that implements `UserProvisioningPort` and remove `NoOpUserProvisioningAdapter`. Spring will autowire the real one automatically.

### JWT Claims Used for Provisioning

| Claim | Used as |
|---|---|
| `sub` | Neo4j User ID (stable, unique per FusionAuth user) |
| `email` | User email |
| `preferred_username` | Display name |

---

## Security Boundaries

| Boundary | Mechanism |
|---|---|
| Browser ↔ Next.js | BetterAuth session cookie (httpOnly, SameSite) |
| Next.js ↔ Spring | FusionAuth JWT in `Authorization: Bearer` header |
| Spring ↔ FusionAuth | JWKS public key fetch (read-only, no secret) |
| FusionAuth ↔ Google | OAuth2 (server-side, credentials in `.env`) |
| FusionAuth ↔ GitHub | OpenIDConnect over OAuth2 (server-side, credentials in `.env`) |

The FusionAuth JWT **never reaches the browser**. Google and GitHub credentials **never leave FusionAuth**.
