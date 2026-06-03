# DrunkGraph

DrunkGraph es una plataforma web de recomendaciones de bebidas basada en grafos. El usuario registra sus gustos, presupuesto y preferencia por alcohol; el backend consulta Neo4j y calcula recomendaciones personalizadas en tiempo real usando relaciones entre usuarios, sabores, bebidas y lugares.

## Tabla de Contenido

- [Arquitectura](#arquitectura)
- [Stack](#stack)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Requisitos](#requisitos)
- [Configuracion Local](#configuracion-local)
- [Comandos](#comandos)
- [Modelo de Grafo](#modelo-de-grafo)
- [Motor de Recomendaciones](#motor-de-recomendaciones)
- [Endpoints Principales](#endpoints-principales)
- [Importar Data a Neo4j](#importar-data-a-neo4j)
- [Deploy del Backend en Render](#deploy-del-backend-en-render)
- [Documentacion Extra](#documentacion-extra)
- [Troubleshooting](#troubleshooting)

## Arquitectura

```text
Usuario
  |
  v
Next.js Web (apps/web)
  |  Browser requests via /api/proxy and /api/admin-proxy
  v
Spring Boot API (apps/api)
  |  JWT validation with FusionAuth JWKS
  v
Neo4j Graph Database

Servicios auxiliares:
- FusionAuth: autenticacion OAuth/JWT
- Postgres: base interna de FusionAuth
- Cloudinary: imagenes de bebidas
- MinIO: servicio local incluido en compose para compatibilidad/experimentos
```

El frontend nunca llama directamente al backend desde el navegador. Las peticiones pasan por proxies de Next.js que adjuntan el JWT de la sesion actual.

## Stack

| Capa | Tecnologia |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, SWR, BetterAuth, Tailwind CSS |
| Backend | Java 21, Spring Boot 4.0.7-SNAPSHOT, Spring Web MVC, Spring Security |
| Base de datos | Neo4j |
| Auth | FusionAuth, OAuth2 Resource Server, JWT con JWKS |
| Imagenes | Cloudinary |
| Mock API | Express 5, Faker |
| Dev tooling | pnpm, Maven Wrapper, Docker Compose, just |
| Deploy backend | Docker, Render |

## Estructura del Proyecto

```text
.
├── apps/
│   ├── api/                 # Backend Spring Boot
│   │   ├── src/main/java/   # Codigo Java
│   │   ├── src/main/resources/
│   │   └── import/          # Scripts Cypher para Neo4j
│   ├── web/                 # Frontend Next.js
│   └── mock-api/            # API falsa para desarrollo frontend
├── docs/                    # Documentacion tecnica y diagramas
├── fusionauth/              # Kickstart y templates de FusionAuth
├── minio-init/              # Inicializacion local de MinIO
├── compose.yaml             # Infra local
├── Dockerfile               # Imagen del backend para Render
├── justfile                 # Comandos del proyecto
├── .env.example             # Variables del root
└── pnpm-workspace.yaml
```

## Requisitos

Instala lo siguiente antes de levantar el proyecto:

| Software | Version recomendada |
|---|---:|
| Java JDK | 21 |
| Docker Desktop | Reciente |
| Node.js | 20 o superior |
| pnpm | 9 o superior |
| just | Reciente |
| Git | Reciente |

En Windows, varios comandos de `just` usan sintaxis `sh`. Lo mas comodo es ejecutar esos comandos desde Git Bash o WSL. Si solo tienes PowerShell, puedes copiar los archivos de entorno manualmente y usar el comando mostrado en [levantar solo el backend](#levantar-solo-el-backend).

## Configuracion Local

### 1. Clonar el repositorio

```bash
git clone https://github.com/carlosaltan18/drunk-graph.git
cd drunk-graph
```

### 2. Crear archivos de entorno

```bash
just setup
```

Esto crea:

```text
.env
apps/web/.env.local
```

Alternativa en PowerShell si no usas `just setup`:

```powershell
Copy-Item .env.example .env
Copy-Item apps/web/.env.local.example apps/web/.env.local
```

### 3. Completar secretos

Edita `.env` y completa los valores reales que apliquen:

```env
GOOGLE_CLIENT_ID=<tu_google_client_id>
GOOGLE_CLIENT_SECRET=<tu_google_client_secret>
GITHUB_CLIENT_ID=<tu_github_client_id>
GITHUB_CLIENT_SECRET=<tu_github_client_secret>

CLOUDINARY_CLOUD_NAME=<tu_cloud_name>
CLOUDINARY_API_KEY=<tu_api_key>
CLOUDINARY_API_SECRET=<tu_api_secret>
```

Para desarrollo local con Docker puedes dejar:

```env
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=password123!
FUSIONAUTH_ISSUER_URI=http://localhost:9011
FUSIONAUTH_JWKS_URI=http://localhost:9011/.well-known/jwks.json
SPRING_PROFILES_ACTIVE=dev
```

Para Neo4j AuraDB usa:

```env
NEO4J_URI=neo4j+s://<database-id>.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=<password-real-de-aura>
```

### 4. Levantar infraestructura

```bash
just infra-up
```

Esto levanta Neo4j, FusionAuth, Postgres y MinIO. Espera alrededor de 30 segundos para que FusionAuth termine el kickstart.

### 5. Instalar dependencias web

```bash
pnpm install
```

### 6. Levantar toda la app

```bash
just dev
```

Servicios locales:

| Servicio | URL |
|---|---|
| Web | http://localhost:3000 |
| API | http://localhost:8080 |
| Health API | http://localhost:8080/api/health |
| Client API Docs | http://localhost:8080/client/docs |
| Admin API Docs | http://localhost:8080/admin/docs |
| FusionAuth | http://localhost:9011 |
| Neo4j Browser | http://localhost:7474 |
| MinIO Console | http://localhost:9101 |

## Levantar Solo el Backend

Con shell compatible con `sh`:

```bash
just api
```

Con PowerShell desde el root:

```powershell
Get-Content .env | Where-Object { $_ -match '^\s*[^#][^=]*=' } | ForEach-Object { $k,$v = $_ -split '=',2; [Environment]::SetEnvironmentVariable($k.Trim(), $v.Trim(), 'Process') }; Set-Location apps/api; .\mvnw.cmd spring-boot:run
```

Probar:

```powershell
Invoke-RestMethod http://localhost:8080/api/health
```

Respuesta esperada:

```json
{
  "status": "ok"
}
```

## Comandos

| Comando | Descripcion |
|---|---|
| `just setup` | Crea `.env` y `apps/web/.env.local` desde ejemplos |
| `just dev` | Levanta API, web y watcher OpenAPI |
| `just api` | Levanta solo Spring Boot en `:8080` |
| `just web` | Levanta solo Next.js en `:3000` |
| `just mock-api` | Levanta API falsa en `:8080` |
| `just watch` | Observa cambios OpenAPI |
| `just compile` | Compila la API para activar reload |
| `just infra-up` | Levanta infraestructura Docker |
| `just infra-down` | Detiene infraestructura Docker |
| `just infra-reset` | Borra volumenes y recrea infraestructura |
| `just fusionauth-reset` | Reinicia FusionAuth y su Postgres |
| `just seed <file>` | Ejecuta un `.cypher` desde `apps/api/import/` |
| `just generate-api` | Regenera clientes TypeScript desde OpenAPI |

## Modelo de Grafo

Nodos principales:

```text
(:User)
(:Drink)
(:Flavor)
(:Place)
```

Relaciones:

```text
(User)-[:LIKES {score}]->(Flavor)
(Drink)-[:HAS_FLAVOR {intensity}]->(Flavor)
(User)-[:CONSUMED {rating, date}]->(Drink)
(Drink)-[:SERVED_AT]->(Place)
```

Restricciones principales:

```cypher
CREATE CONSTRAINT drink_id_unique IF NOT EXISTS
FOR (d:Drink) REQUIRE d.id IS UNIQUE;

CREATE CONSTRAINT flavor_name_unique IF NOT EXISTS
FOR (f:Flavor) REQUIRE f.name IS UNIQUE;

CREATE CONSTRAINT user_id_unique IF NOT EXISTS
FOR (u:User) REQUIRE u.id IS UNIQUE;

CREATE CONSTRAINT place_id_unique IF NOT EXISTS
FOR (p:Place) REQUIRE p.id IS UNIQUE;
```

## Motor de Recomendaciones

El motor vive en:

```text
apps/api/src/main/java/com/uvg/drunkgraph/modules/recommendation
```

Flujo:

```text
RecommendationHandler
  -> RecommendationServiceImpl
  -> RecommendationRepository
  -> Neo4jClient
  -> Neo4j
```

El ranking considera:

- Coincidencia entre sabores que le gustan al usuario y sabores de la bebida.
- Peso del gusto del usuario: `LIKES.score`.
- Intensidad del sabor en la bebida: `HAS_FLAVOR.intensity`.
- Presupuesto maximo del usuario.
- Preferencia por bebidas alcoholicas o sin alcohol.
- Bebidas ya consumidas, que se excluyen del top.

Formula base:

```text
scoreFlavor = ((intersection / unionSize) * 0.5)
            + ((weightedBonus / unionSize) * 0.5)

weightedBonus = sum(LIKES.score * HAS_FLAVOR.intensity)
scoreFinal = scoreFlavor + scorePrice
```

El ajuste de precio penaliza bebidas fuera del presupuesto:

```text
si drink.price > user.budget_max:
    scorePrice = -0.30
si no:
    scorePrice = (1.0 - drink.price / user.budget_max) * 0.20
```

## Endpoints Principales

### Publicos

| Metodo | Ruta | Uso |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `GET` | `/client/docs` | Docs cliente |
| `GET` | `/admin/docs` | Docs admin |
| `GET` | `/v3/api-docs/**` | OpenAPI |

### Usuario autenticado

| Metodo | Ruta | Uso |
|---|---|---|
| `GET` | `/api/users/me` | Perfil actual |
| `PUT` | `/api/users/me` | Actualizar presupuesto/preferencia de alcohol |
| `GET` | `/api/users/me/tastes` | Listar gustos |
| `POST` | `/api/users/me/tastes` | Agregar gusto |
| `DELETE` | `/api/users/me/tastes/{flavor}` | Eliminar gusto |
| `GET` | `/api/users/me/recommendations?limit=10` | Top recomendaciones |
| `GET` | `/api/users/me/recommendations/{drinkId}` | Recomendacion para una bebida |
| `POST` | `/api/users/me/consumption` | Registrar consumo |
| `GET` | `/api/users/me/consumption` | Historial de consumo |
| `DELETE` | `/api/users/me/consumption/{drinkId}` | Eliminar consumo |
| `GET` | `/api/users/me/stats` | Estadisticas |
| `GET` | `/api/drinks` | Listar bebidas |
| `GET` | `/api/drinks/{id}` | Detalle de bebida |
| `GET` | `/api/drinks/category/{category}` | Bebidas por categoria |
| `GET` | `/api/flavors` | Listar sabores |

### Administrador autenticado

| Metodo | Ruta | Uso |
|---|---|---|
| `GET` | `/api/admin/places` | Listar lugares |
| `POST` | `/api/admin/places` | Crear lugar |
| `PUT` | `/api/admin/places/{id}` | Actualizar lugar |
| `DELETE` | `/api/admin/places/{id}` | Eliminar lugar |
| `GET` | `/api/admin/flavors` | Listar sabores |
| `POST` | `/api/admin/flavors` | Crear sabor |
| `PUT` | `/api/admin/flavors/{name}` | Actualizar sabor |
| `DELETE` | `/api/admin/flavors/{name}` | Eliminar sabor |
| `GET` | `/api/admin/drinks` | Listar bebidas |
| `GET` | `/api/admin/drinks/{id}` | Detalle de bebida |
| `POST` | `/api/admin/places/{placeId}/drinks/batch` | Importar bebidas |
| `PUT` | `/api/admin/drinks/{id}` | Actualizar bebida |
| `DELETE` | `/api/admin/drinks/{id}` | Eliminar bebida |
| `POST` | `/api/admin/uploads/sign` | Firmar upload Cloudinary |

## Importar Data a Neo4j

Los scripts `.cypher` viven en:

```text
apps/api/import/
```

Para importar el dataset generado desde el JSON:

```bash
just seed neo4j_query_table_data_2026_6_2.cypher
```

El comando hace:

```text
docker cp apps/api/import/<file> neo4j:/tmp/<file>
docker exec -it neo4j cypher-shell -u neo4j -p "$NEO4J_PASSWORD" -f /tmp/<file>
```

Importante:

- Ese script usa `CREATE`, por lo que es mejor ejecutarlo en una base vacia.
- Si ya existen nodos con los mismos `id`, Neo4j puede fallar por constraints.
- Para limpiar una base local de desarrollo puedes usar Neo4j Browser y ejecutar `MATCH (n) DETACH DELETE n;`.

## Deploy del Backend en Render

El backend tiene un `Dockerfile` en el root. Render debe crear un Web Service con runtime Docker.

Configuracion recomendada:

| Campo | Valor |
|---|---|
| Runtime | Docker |
| Dockerfile Path | `Dockerfile` |
| Root Directory | root del repo |
| Health Check Path | `/api/health` |

Variables recomendadas en Render:

```env
NEO4J_URI=neo4j+s://<database-id>.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=<password-real>

FUSIONAUTH_ISSUER_URI=<issuer-publico>
FUSIONAUTH_JWKS_URI=<issuer-publico>/.well-known/jwks.json

CLOUDINARY_CLOUD_NAME=<cloud-name>
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>

SPRING_PROFILES_ACTIVE=prod
```

No agregues `.env` a la imagen Docker. Render debe inyectar las variables en runtime.

Probar deploy:

```bash
curl https://<tu-servicio>.onrender.com/api/health
```

## Documentacion Extra

| Archivo | Contenido |
|---|---|
| [`docs/recommendation-system.md`](docs/recommendation-system.md) | Uso e instalacion del sistema de recomendaciones |
| [`docs/app-report.md`](docs/app-report.md) | Informe tecnico de la aplicacion |
| [`docs/auth.md`](docs/auth.md) | Arquitectura de autenticacion |
| [`docs/diagrams/backend-class-diagram.puml`](docs/diagrams/backend-class-diagram.puml) | Diagrama de clases backend |
| [`docs/diagrams/graph-entity-diagram.puml`](docs/diagrams/graph-entity-diagram.puml) | Diagrama de entidades Neo4j |
| [`docs/diagrams/recommendation-sequence.puml`](docs/diagrams/recommendation-sequence.puml) | Secuencia de recomendaciones |
| [`docs/diagrams/admin-import-sequence.puml`](docs/diagrams/admin-import-sequence.puml) | Secuencia de importacion admin |
| [`docs/diagrams/auth-provisioning-sequence.puml`](docs/diagrams/auth-provisioning-sequence.puml) | Secuencia de auth y provisioning |

Los archivos `.puml` se pueden copiar directamente en PlantText o abrir con cualquier visor PlantUML.

## Troubleshooting

### `GET /` responde 401

Es normal. La raiz no es publica. Usa:

```text
/api/health
```

### Render dice "No open ports detected" por unos segundos

Spring Boot puede tardar en iniciar. Si luego aparece `Detected service running on port <PORT>` y `/api/health` responde, el deploy esta bien.

### Neo4j Aura no conecta

Verifica que uses el protocolo correcto:

```env
NEO4J_URI=neo4j+s://<database-id>.databases.neo4j.io
```

No uses `localhost` en Render.

### Las recomendaciones salen vacias

Revisa que existan:

- `(:Drink)` con relaciones `HAS_FLAVOR`.
- `(:Flavor)` con nombres iguales a los gustos del usuario.
- `(:User)` con relaciones `LIKES`.
- `budget_max` mayor que `0`.
- Bebidas no consumidas por el usuario.
- Bebidas compatibles con `prefers_alcohol`.

### Los docs no cargan en `/docs`

Las rutas actuales son:

```text
/client/docs
/admin/docs
```

Tambien existen los archivos estaticos:

```text
/client-docs.html
/admin-docs.html
```
