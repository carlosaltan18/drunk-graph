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
(Usuario)-[:LE_GUSTA {gusto: float}]->(Sabor)<-[:TIENE_SABOR {intensidad: float}]-(Bebida)
```

- `gusto` — how much the user likes that flavor (0.0–1.0)
- `intensidad` — how strong that flavor is in the drink (0.0–1.0)

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
│   ├── bebida/
│   │   ├── model/
│   │   │   └── Bebida.java                        # @Node entity
│   │   ├── repository/
│   │   │   └── BebidaRepository.java              # mutations only
│   │   └── use_cases/
│   │       ├── commands/
│   │       │   └── mark_as_drinked/
│   │       │       ├── MarkAsDrinkedInput.java
│   │       │       ├── MarkAsDrinkedOutput.java
│   │       │       └── MarkAsDrinkedUseCase.java
│   │       └── queries/
│   │           └── get_by_id/
│   │               ├── GetBebidaByIdInput.java
│   │               ├── GetBebidaByIdOutput.java
│   │               ├── GetBebidaByIdQuery.java     # Neo4jClient Cypher
│   │               └── GetBebidaByIdUseCase.java
│   ├── usuario/
│   │   └── ...same structure...
│   └── recomendacion/
│       └── use_cases/
│           └── queries/
│               └── get_recommendations/
│                   ├── GetRecommendationsInput.java
│                   ├── GetRecommendationsOutput.java
│                   ├── RecommendationQuery.java    # scoring algorithm lives here
│                   └── GetRecommendationsUseCase.java
└── infra/
    ├── http/
    │   ├── BebidaController.java
    │   ├── UsuarioController.java
    │   └── RecomendacionController.java
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

### Start infrastructure

```bash
cp .env.example .env
# fill in Google/GitHub OAuth credentials
docker compose up -d
```

Services:
| Service | URL |
|---|---|
| FusionAuth | http://localhost:9011 |
| FusionAuth Admin | http://localhost:9011/admin |
| Neo4j Browser | http://localhost:7474 |
| MinIO Console | http://localhost:9001 |

### Start the API

```bash
cd apps/api
./mvnw spring-boot:run
```

> Hot reload: devtools watches `target/classes`. After editing a `.java` file, run `./mvnw compile` in a second terminal to trigger the restart.

### Start the frontend

```bash
cd apps/web
cp .env.local.example .env.local
pnpm install
pnpm dev
```

The app runs at http://localhost:3000.

### Reset FusionAuth

If kickstart needs to re-run (e.g. after changing `kickstart.json`):

```bash
docker compose down fusionauth fusionauth-db -v
docker compose up fusionauth-db fusionauth -d
```
