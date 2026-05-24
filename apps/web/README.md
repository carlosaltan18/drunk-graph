# DrunkGraph — Web

Next.js frontend for the DrunkGraph platform. Serves both the user-facing app (`/dashboard`) and the admin backoffice (`/admin`).

## Stack

- **Next.js 15** (App Router, RSC)
- **BetterAuth** — session management (two isolated instances: user + admin)
- **SWR** — client-side data fetching with optimistic updates
- **openapi-fetch** — typed API client generated from OpenAPI spec
- **Tailwind CSS** — styling
- **Framer Motion** — animations

## Structure

```
src/
├── app/
│   ├── page.tsx                        # → redirects to /dashboard
│   ├── dashboard/                      # user app (auth-gated via layout)
│   │   ├── page.tsx                    # recommendation feed
│   │   ├── browse/                     # drink browser (SSR + infinite scroll)
│   │   ├── drinks/[id]/                # drink detail
│   │   ├── history/                    # consumption log
│   │   ├── profile/                    # user profile + taste preferences
│   │   └── onboarding/                 # flavor setup (?back= supported)
│   ├── admin/
│   │   ├── page.tsx                    # → redirects to /admin/login
│   │   ├── login/                      # admin login (FusionAuth hosted page)
│   │   └── (protected)/
│   │       ├── dashboard/              # venue list
│   │       ├── places/[id]/            # drink editor for a venue
│   │       └── places/[id]/import/     # batch drink uploader
│   └── api/
│       ├── proxy/[...path]/            # forwards requests to Spring as user JWT
│       ├── admin-proxy/[...path]/      # forwards requests to Spring as admin JWT
│       ├── auth/[...all]/              # BetterAuth user routes
│       └── auth/admin/[...all]/        # BetterAuth admin routes
├── components/magicpath/               # all UI components
├── lib/
│   ├── api/
│   │   ├── client.ts                   # openapi-fetch client → /api/proxy
│   │   ├── admin-client.ts             # openapi-fetch client → /api/admin-proxy
│   │   ├── server.ts                   # server-side user API (attaches JWT directly)
│   │   └── admin.ts                    # server-side admin API
│   ├── auth.ts                         # BetterAuth instances (auth + adminAuth)
│   └── hooks/                          # SWR hooks (useRecommendations, useDrinks, etc.)
└── generated/                          # auto-generated OpenAPI TypeScript types
```

## Proxy

Browser-side API calls never hit Spring directly. They go through:

```
Browser → /api/proxy/[...path] → Spring /api/[...path]
```

The proxy handler attaches the FusionAuth JWT from the BetterAuth session. The admin proxy (`/api/admin-proxy`) does the same with the admin session. Content-Type is forwarded as-is, so multipart uploads work correctly.

## Auth

See [`docs/auth.md`](../../docs/auth.md) for the full auth architecture. Short version:

- `/dashboard` is gated by `DashboardLayout` — redirects to `/login` if no user session
- `/admin/(protected)` is gated by `AdminProtectedLayout` — redirects to `/admin/login` if no admin session or role !== `"admin"`
- Both sessions can be active simultaneously in the same browser

## Onboarding

New users are redirected to `/dashboard/onboarding` on first visit (detected via `onboarded` cookie). The onboarding page supports a `?back=<url>` query param — when present, a back button is shown and submit/skip redirect to that URL instead of `/dashboard`. Used by the "Edit preferences" link in the profile.
