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
Score = (Jaccard_base × 0.5) + (Weighted_bonus × 0.5)
```

- **Jaccard base** — flavor set overlap: `|A ∩ B| / |A ∪ B|`
- **Weighted bonus** — weighted sum: `avg(score × intensity)` over matched flavors

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
  web/                    # Next.js frontend
  api/
    import/               # Cypher seed files (run with `just seed <file>`)
fusionauth/
  kickstart.json          # bootstraps FusionAuth on first run
  templates/
    oauth2Authorize.ftl   # custom login page
docs/                     # architecture documentation
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

### Getting started

Follow these steps in order. Do not skip any.

**Step 1 — Clone the repo**
```bash
git clone https://github.com/carlosaltan18/drunk-graph.git
cd drunk-graph
```

**Step 2 — Copy environment files**
```bash
just setup
```
This creates `.env` and `apps/web/.env.local` from their example files and syncs shared values automatically.

**Step 3 — Fill in OAuth credentials**

Open `.env` in a text editor and fill in these four values (get them from Google Cloud Console and GitHub Developer Settings):
```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```
Everything else in `.env` already has working defaults — do not change them.

**Step 4 — Start the infrastructure**

Make sure Docker is running, then:
```bash
just infra-up
```
This starts Neo4j, FusionAuth, and MinIO in the background. Wait ~30 seconds for FusionAuth to finish bootstrapping before starting the app.

**Step 5 — Install Node.js dependencies**
```bash
pnpm install
```

**Step 6 — Start the application**
```bash
just dev
```
This starts the Spring Boot API, the Next.js frontend, and the OpenAPI watcher all at once with colored output. Leave this terminal open.

The app is now running at **http://localhost:3000**.

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
| `just seed <file>` | Copy a Cypher file from `apps/api/import/` into Neo4j and run it (e.g. `just seed liquidgrapg.cypher`) |
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

> **Hot reload:** devtools watches `target/classes`. After editing a `.java` file, run `just compile` to trigger the API restart.

### IntelliJ IDEA setup

The Next.js module is pre-configured and will be recognized automatically when you open the repo root.

For the Spring API module, IntelliJ needs to read it from Maven once:
1. Open the repo root in IntelliJ IDEA Ultimate
2. In the Project tree, right-click `apps/api/pom.xml` → **Add as Maven Project**
3. IntelliJ will index dependencies and enable full Spring/Java support

> The Spring module can't be pre-committed because IntelliJ generates it with absolute paths to your local Maven repository (`~/.m2`), which differ per machine. The Next.js module has no machine-specific paths so it's safe to commit.
