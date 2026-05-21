default:
    just --list

# ── Setup ─────────────────────────────────────────────────────────────────────

setup:
    #!/usr/bin/env sh
    if [ ! -f .env ]; then cp .env.example .env; echo "created .env — fill in GOOGLE_CLIENT_ID/SECRET and GITHUB_CLIENT_ID/SECRET"; fi
    if [ ! -f apps/web/.env.local ]; then cp apps/web/.env.local.example apps/web/.env.local; fi
    # extract values from root .env without sourcing (avoids errors on placeholder values)
    get() { grep -m1 "^$1=" .env | cut -d'=' -f2-; }
    sed -i.bak \
        -e "s|^FUSIONAUTH_CLIENT_ID=.*|FUSIONAUTH_CLIENT_ID=$(get DRUNKGRAPH_APPLICATION_ID)|" \
        -e "s|^FUSIONAUTH_CLIENT_SECRET=.*|FUSIONAUTH_CLIENT_SECRET=$(get DRUNKGRAPH_CLIENT_SECRET)|" \
        -e "s|^FUSIONAUTH_URL=.*|FUSIONAUTH_URL=$(get FUSIONAUTH_URL)|" \
        -e "s|^FUSIONAUTH_TENANT_ID=.*|FUSIONAUTH_TENANT_ID=$(get DRUNKGRAPH_TENANT_ID)|" \
        -e "s|^SPRING_API_URL=.*|SPRING_API_URL=$(get SPRING_API_URL)|" \
        apps/web/.env.local
    rm -f apps/web/.env.local.bak
    echo "apps/web/.env.local synced from root .env"
    echo "Only secrets needing real values: GOOGLE_CLIENT_ID/SECRET and GITHUB_CLIENT_ID/SECRET in .env"

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
    #!/usr/bin/env sh
    password=$(grep -m1 "^NEO4J_PASSWORD=" .env | cut -d'=' -f2-)
    docker cp apps/api/import/{{file}} neo4j:/tmp/{{file}}
    docker exec -it neo4j cypher-shell -u neo4j -p "$password" -f /tmp/{{file}}

compile:
    cd apps/api && ./mvnw compile -q
