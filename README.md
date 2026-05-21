# DrunkGraph

A graph-powered drink recommendation platform. Users define their flavor preferences and the system recommends drinks based on a weighted Jaccard similarity score computed at query time directly on the graph.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                        Client                           │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                   Next.js (apps/web)                    │
│  - BetterAuth session management                        │
│  - /api/proxy/[...path] → forwards requests to API      │
│    with FusionAuth JWT as Bearer token                  │
└────────────────────────┬────────────────────────────────┘
                         │ Bearer JWT
┌────────────────────────▼────────────────────────────────┐
│               Spring Boot API (apps/api)                │
│  - Validates JWT via FusionAuth JWKS                    │
│  - Vertical slice architecture                          │
└──────┬─────────────────┬──────────────────┬─────────────┘
       │                 │                  │
┌──────▼──────┐  ┌───────▼──────┐  ┌───────▼──────┐
│   Neo4j     │  │  FusionAuth  │  │    MinIO     │
│ (graph DB)  │  │   (auth)     │  │  (storage)   │
└─────────────┘  └──────────────┘  └──────────────┘
```

## Graph Model

```
(User)-[:LIKES {score: float}]->(Flavor)<-[:HAS_FLAVOR {intensity: float}]-(Drink)
```

- `score` — how much the user likes that flavor (0.0–1.0)
- `intensity` — how strong that flavor is in the drink (0.0–1.0)

### Recommendation Score

```
Score = (Jaccard_base × 0.5) + (Bonus_ponderado × 0.5)
```

- **Jaccard base** — flavor set overlap: `|A ∩ B| / |A ∪ B|`
- **Bonus ponderado** — weighted sum: `avg(gusto × intensidad)` over matched flavors

Recommendations are computed at runtime via a single Cypher query — no pre-computation or message broker needed at this scale.

## Spring API Structure

The API follows **vertical slice architecture** grouped by bounded context, with explicit separation between commands (mutations) and queries (reads).

```
src/main/java/com/uvg/drunkgraph/
├── modules/
│   ├── drink/
│   │   ├── model/
│   │   │   └── Drink.java                         # @Node entity
│   │   ├── repository/
│   │   │   └── DrinkRepository.java               # mutations only
│   │   └── use_cases/
│   │       ├── commands/
│   │       │   └── mark_as_drinked/
│   │       │       ├── MarkAsDrinkedInput.java
│   │       │       ├── MarkAsDrinkedOutput.java
│   │       │       └── MarkAsDrinkedUseCase.java
│   │       └── queries/
│   │           └── get_by_id/
│   │               ├── GetDrinkByIdInput.java
│   │               ├── GetDrinkByIdOutput.java
│   │               ├── GetDrinkByIdQuery.java      # Neo4jClient Cypher
│   │               └── GetDrinkByIdUseCase.java
│   ├── user/
│   │   └── ...same structure...
│   └── recommendation/
│       └── use_cases/
│           └── queries/
│               └── get_recommendations/
│                   ├── GetRecommendationsInput.java
│                   ├── GetRecommendationsOutput.java
│                   ├── RecommendationQuery.java    # scoring algorithm lives here
│                   └── GetRecommendationsUseCase.java
└── infra/
    ├── http/
    │   ├── DrinkController.java
    │   ├── UserController.java
    │   └── RecommendationController.java
    ├── storage/
    │   └── StorageService.java                    # resolves MinIO keys → URLs
    └── security/
        └── SecurityConfig.java                    # JWT / JWKS config
```

### Key conventions

- **Repository** — Spring Data Neo4j, used only for mutations. Returns `@Node` entities.
- **Query** — `Neo4jClient` with raw Cypher, returns read models shaped for the use case. Never reuses the entity.
- **Use case** — orchestrates one query or command, resolves infrastructure concerns (e.g. storage URLs), returns the HTTP output record.
- **Controller** — thin HTTP adapter. Extracts request data, calls the use case, returns the response. No business logic.
- **Image keys** — stored as relative keys in Neo4j (e.g. `drinks/mojito.jpg`). `StorageService` resolves them to full URLs at request time.
- **Recommendation module** — has no repository (read-only). Uses `Neo4jClient` directly with the scoring Cypher query.

## Auth Flow

```
User → FusionAuth (Google / GitHub OAuth) → BetterAuth session (Next.js)
     → /api/proxy/* → Spring API (JWT validated via JWKS)
```

- FusionAuth issues JWTs signed with RS256
- Spring validates via `/.well-known/jwks.json` — no shared secret
- Anonymous users can pass flavor preferences as a request payload — same recommendation logic, no account required

## Monorepo Structure

```
apps/
  web/          # Next.js frontend
  api/          # Spring Boot API
fusionauth/
  kickstart.json          # bootstraps FusionAuth on first run
  templates/
    oauth2Authorize.ftl   # custom login page
compose.yaml              # Neo4j + FusionAuth + Postgres + MinIO
.env.example              # all required environment variables
```

## Local Development

### Prerequisites

- Docker
- Java 21
- Node.js 20+ / pnpm
- [just](https://github.com/casey/just#installation) — task runner
  - macOS: `brew install just`
  - Windows: `winget install Casey.Just` or `scoop install just`
  - Linux: `cargo install just` or see [prebuilt binaries](https://github.com/casey/just/releases)

### Setup

```bash
just setup   # copies .env.example → .env and .env.local.example → .env.local
pnpm install
```

Then open `.env` and fill in `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID`, and `GITHUB_CLIENT_SECRET`. Everything else — including `apps/web/.env.local` — is synced automatically and has working defaults.

### Running everything

```bash
just dev
```

This starts the API, the Next.js frontend, and the OpenAPI watcher concurrently with colored output.

### Individual tasks

| Command | Description |
|---|---|
| `just setup` | Copy `.env.example` and `.env.local.example` to their real files (skips if already exists) |
| `just api` | Spring Boot API only |
| `just web` | Next.js frontend only |
| `just watch` | OpenAPI spec watcher (auto-generates TypeScript client on spec change) |
| `just compile` | Recompile the API to trigger devtools hot reload |
| `just infra-up` | Start Docker services (Neo4j, FusionAuth, MinIO) |
| `just infra-down` | Stop Docker services |
| `just infra-reset` | Wipe and restart all Docker services |
| `just fusionauth-reset` | Re-run FusionAuth kickstart (e.g. after changing `kickstart.json`) |
| `just seed <file>` | Run a Cypher seed file against Neo4j |
| `just generate-api` | Manually regenerate the TypeScript API client from the OpenAPI spec |

### Services

| Service | URL |
|---|---|
| API | http://localhost:8080 |
| API Docs | http://localhost:8080/docs |
| FusionAuth | http://localhost:9011 |
| Neo4j Browser | http://localhost:7474 |
| MinIO Console | http://localhost:9101 |
| Next.js | http://localhost:3000 |

### Frontend setup (first time)

```bash
cd apps/web
cp .env.local.example .env.local
```

> **Hot reload:** devtools watches `target/classes`. After editing a `.java` file, run `just compile` to trigger the API restart.
