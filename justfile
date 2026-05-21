default:
    just --list

# ── Dev ──────────────────────────────────────────────────────────────────────

dev:
    pnpm dev

api:
    cd apps/api && ./mvnw spring-boot:run

web:
    cd apps/web && pnpm dev

watch:
    node scripts/watch-openapi.mjs

# ── Code generation ───────────────────────────────────────────────────────────

generate-api:
    pnpm --filter web generate:api

# ── Infrastructure ────────────────────────────────────────────────────────────

infra-up:
    docker compose up -d

infra-down:
    docker compose down

infra-reset:
    docker compose down -v && docker compose up -d

fusionauth-reset:
    docker compose down fusionauth fusionauth-db -v && docker compose up fusionauth-db fusionauth -d

# ── Database ──────────────────────────────────────────────────────────────────

seed file:
    docker exec -it neo4j cypher-shell -u neo4j -p "$NEO4J_PASSWORD" -f /var/lib/neo4j/import/{{file}}

compile:
    cd apps/api && ./mvnw compile -q
