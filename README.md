# DrunkGraph

Spring Boot backend connected to a Neo4j graph database via Docker.

## Requirements

- Docker
- Java 21

## Setup

Start Neo4j:

```bash
docker compose up -d
```

This exposes:
- `localhost:7474` — Neo4j Browser (web UI)
- `localhost:7687` — Bolt (used by the Spring driver)

Credentials: `neo4j / tu_password` (set in `compose.yaml`).

Run the app:

```bash
./mvnw spring-boot:run
```

The API listens on `localhost:8080`.

## Loading data

Cypher scripts go in `import/`. To run one against the live container:

```bash
docker exec -it neo4j cypher-shell -u neo4j -p tu_password -f /var/lib/neo4j/import/liquidgrapg.cypher
```

## Project structure

```
import/          # Cypher migration scripts
src/             # Spring Boot application
compose.yaml     # Neo4j service definition
```

`data/` is created by Docker at runtime and is git-ignored (holds the Neo4j database files).

## Notes

- JWT secret and Neo4j password are hardcoded in `application.properties` — move them to environment variables before deploying.
- JWT tokens expire after 24 hours (`jwt.expiration=86400000`).
