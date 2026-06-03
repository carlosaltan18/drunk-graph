# Documentacion del sistema de recomendaciones

## 1. Proposito

DrunkGraph es una aplicacion para recomendar bebidas a usuarios con base en sus gustos, presupuesto, preferencia por alcohol y bebidas ya consumidas. El sistema usa Neo4j como base de datos de grafos para modelar usuarios, bebidas, sabores y lugares.

El motor de recomendaciones vive en el backend Spring Boot, dentro del modulo:

```text
apps/api/src/main/java/com/uvg/drunkgraph/modules/recommendation
```

El flujo principal es:

```text
RecommendationHandler -> RecommendationServiceImpl -> RecommendationRepository -> Neo4j
```

## 2. Requerimientos de software

Para ejecutar todo el proyecto localmente se necesita:

| Software | Version recomendada | Uso |
|---|---:|---|
| Java JDK | 21 | Ejecutar Spring Boot |
| Maven Wrapper | Incluido en `apps/api` | Compilar la API |
| Node.js | 20 o superior | Ejecutar Next.js |
| pnpm | 9 o superior | Instalar dependencias frontend |
| Docker Desktop | Version reciente | Levantar Neo4j, FusionAuth y servicios auxiliares |
| just | Version reciente | Ejecutar comandos del proyecto |
| Neo4j | Local por Docker o AuraDB | Base de datos de grafos |
| FusionAuth | Local por Docker o servicio externo | Autenticacion OAuth/JWT |
| Cloudinary | Cuenta activa | Firmar uploads y resolver URLs de imagenes |

Para desplegar solo el backend en Render se necesita:

| Recurso | Uso |
|---|---|
| Dockerfile del root | Construye `apps/api` |
| Java 21 dentro de la imagen | Runtime de Spring Boot |
| Neo4j AuraDB o Neo4j remoto | Base de datos de produccion |
| Variables de entorno en Render | Configuracion de Neo4j, FusionAuth y Cloudinary |

## 3. Variables de entorno necesarias

El backend toma su configuracion desde variables de entorno. En local se cargan desde el archivo `.env` del root; en Render se deben copiar en la seccion **Environment Variables**.

```env
NEO4J_URI=neo4j+s://<database-id>.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=<password-de-neo4j>

FUSIONAUTH_ISSUER_URI=https://<fusionauth-host>
FUSIONAUTH_JWKS_URI=https://<fusionauth-host>/.well-known/jwks.json

CLOUDINARY_CLOUD_NAME=<cloud-name>
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>

SPRING_PROFILES_ACTIVE=prod
PORT=8080
```

Notas:

- En produccion no se debe usar `bolt://localhost:7687`, porque dentro de Render `localhost` apunta al contenedor de la API.
- Para Neo4j AuraDB se usa normalmente `neo4j+s://...`.
- `PORT` lo inyecta Render automaticamente. La aplicacion usa `server.port=${PORT:8080}`.
- `SPRING_PROFILES_ACTIVE=prod` evita correr la API con perfil de desarrollo.

## 4. Instalacion local

### 4.1 Clonar el proyecto

```bash
git clone https://github.com/carlosaltan18/drunk-graph.git
cd drunk-graph
```

### 4.2 Crear archivos de entorno

```bash
just setup
```

Esto crea:

```text
.env
apps/web/.env.local
```

Luego se deben completar los secretos reales de OAuth, Neo4j y Cloudinary.

### 4.3 Levantar infraestructura local

```bash
just infra-up
```

Esto levanta Neo4j, FusionAuth, Postgres para FusionAuth y servicios auxiliares definidos en `compose.yaml`.

### 4.4 Instalar dependencias del frontend

```bash
pnpm install
```

### 4.5 Ejecutar toda la app

```bash
just dev
```

Esto levanta:

```text
Spring Boot API -> http://localhost:8080
Next.js Web     -> http://localhost:3000
OpenAPI watcher
```

### 4.6 Ejecutar solo el backend

En sistemas compatibles con `sh`:

```bash
just api
```

En PowerShell, desde el root:

```powershell
Get-Content .env | Where-Object { $_ -match '^\s*[^#][^=]*=' } | ForEach-Object { $k,$v = $_ -split '=',2; [Environment]::SetEnvironmentVariable($k.Trim(), $v.Trim(), 'Process') }; Set-Location apps/api; .\mvnw.cmd spring-boot:run
```

Prueba rapida:

```powershell
Invoke-RestMethod http://localhost:8080/api/health
```

Respuesta esperada:

```json
{
  "status": "ok"
}
```

## 5. Instalacion en Render

El backend se puede desplegar como servicio Docker.

Configuracion recomendada:

| Campo Render | Valor |
|---|---|
| Service Type | Web Service |
| Runtime | Docker |
| Root Directory | Root del repositorio |
| Dockerfile Path | `Dockerfile` |
| Health Check Path | `/api/health` |

Variables minimas en Render:

```env
NEO4J_URI=neo4j+s://<database-id>.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=<password>
FUSIONAUTH_ISSUER_URI=<issuer-publico>
FUSIONAUTH_JWKS_URI=<issuer-publico>/.well-known/jwks.json
CLOUDINARY_CLOUD_NAME=<cloud-name>
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>
SPRING_PROFILES_ACTIVE=prod
```

Render detecta el puerto automaticamente por la variable `PORT`.

## 6. Modelo de datos del recomendador

El sistema se basa en cuatro nodos principales de Neo4j:

```text
User
Drink
Flavor
Place
```

Relaciones principales:

```text
(User)-[:LIKES {score}]->(Flavor)
(Drink)-[:HAS_FLAVOR {intensity}]->(Flavor)
(User)-[:CONSUMED {rating, date}]->(Drink)
(Drink)-[:SERVED_AT]->(Place)
```

Propiedades relevantes:

| Nodo o relacion | Propiedad | Descripcion |
|---|---|---|
| `User` | `id` | Identificador del usuario, tomado del JWT |
| `User` | `budget_max` | Presupuesto maximo |
| `User` | `prefers_alcohol` | Define si acepta bebidas alcoholicas |
| `LIKES` | `score` | Peso del gusto del usuario por un sabor, de 0.0 a 1.0 |
| `Drink` | `price` | Precio de la bebida |
| `Drink` | `alcohol_pct` | Porcentaje de alcohol |
| `HAS_FLAVOR` | `intensity` | Intensidad del sabor en la bebida, de 0.0 a 1.0 |
| `CONSUMED` | `rating` | Calificacion dada por el usuario, de 1 a 5 |

Antes de pedir recomendaciones, el usuario debe tener preferencias y gustos registrados. En especial, `budgetMax` debe ser mayor que cero para que el componente de precio tenga sentido.

## 7. Algoritmo de recomendacion

El calculo se realiza en `RecommendationRepository` con Cypher. Para cada bebida candidata:

1. Se buscan sabores que coinciden entre el usuario y la bebida.
2. Se calcula una interseccion de sabores.
3. Se calcula una union entre sabores del usuario y sabores de la bebida.
4. Se calcula un bono ponderado con `score * intensity`.
5. Se aplica un ajuste por precio segun el presupuesto del usuario.
6. Se ordena por `scoreFinal` descendente.

Formula usada:

```text
scoreFlavor = ((intersection / unionSize) * 0.5) + ((weightedBonus / unionSize) * 0.5)
```

Donde:

```text
weightedBonus = sum(user.LIKES.score * drink.HAS_FLAVOR.intensity)
```

El componente de precio:

```text
si drink.price > user.budget_max:
    scorePrice = -0.30
si no:
    scorePrice = (1.0 - drink.price / user.budget_max) * 0.20
```

Score final:

```text
scoreFinal = scoreFlavor + scorePrice
```

La consulta de top recomendaciones tambien excluye bebidas ya consumidas:

```text
WHERE NOT (u)-[:CONSUMED]->(d)
```

Y respeta la preferencia de alcohol:

```text
WHERE (u.prefers_alcohol = true OR d.alcohol_pct = 0)
```

## 8. Endpoints del sistema de recomendaciones

Todos estos endpoints requieren un token JWT valido, excepto `/api/health`.

### 8.1 Obtener recomendaciones

```http
GET /api/users/me/recommendations?limit=10
Authorization: Bearer <jwt>
```

Ejemplo de respuesta:

```json
[
  {
    "drinkId": "abc-123",
    "drink": "Mojito",
    "category": "Coctel",
    "price": 45.0,
    "scoreFlavor": 0.612,
    "scorePrice": 0.08,
    "scoreFinal": 0.692,
    "imageUrls": [
      "https://res.cloudinary.com/demo/image/upload/drinks/mojito.jpg"
    ]
  }
]
```

### 8.2 Obtener recomendacion de una bebida especifica

```http
GET /api/users/me/recommendations/{drinkId}
Authorization: Bearer <jwt>
```

Si no existe recomendacion para esa bebida, responde `404`.

### 8.3 Configurar preferencias del usuario

```http
PUT /api/users/me
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "budgetMax": 100.0,
  "prefersAlcohol": true
}
```

### 8.4 Registrar gusto por sabor

```http
POST /api/users/me/tastes
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "flavor": "citrus",
  "weight": 0.8
}
```

### 8.5 Registrar consumo

```http
POST /api/users/me/consumption
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "drinkId": "abc-123",
  "rating": 5
}
```

Registrar consumo afecta las recomendaciones porque las bebidas consumidas se excluyen del top.

## 9. Carga de datos para que el motor funcione

Para que el motor recomiende, deben existir:

1. Usuarios autenticados y provisionados en Neo4j.
2. Sabores (`Flavor`).
3. Lugares (`Place`).
4. Bebidas (`Drink`) conectadas a un lugar con `SERVED_AT`.
5. Relaciones `HAS_FLAVOR` entre bebidas y sabores.
6. Relaciones `LIKES` entre usuario y sabores.

Los administradores pueden crear lugares, sabores y bebidas usando los endpoints admin:

```http
POST /api/admin/places
POST /api/admin/flavors
POST /api/admin/places/{placeId}/drinks/batch
PUT  /api/admin/drinks/{id}
```

## 10. Como usar el recomendador como motor para otras aplicaciones

El sistema puede usarse como motor de recomendaciones independiente si se despliega la API como servicio REST.

### Opcion A: Consumo por HTTP

Otra aplicacion puede enviar peticiones al backend:

```http
GET https://drunk-graph.onrender.com/api/users/me/recommendations?limit=10
Authorization: Bearer <jwt>
```

Requisitos para la app consumidora:

- Debe obtener un JWT compatible con el `issuer` y `JWKS` configurados en Spring.
- Debe crear o actualizar gustos del usuario con `/api/users/me/tastes`.
- Debe actualizar presupuesto y preferencia de alcohol con `PUT /api/users/me`.
- Debe cargar bebidas, sabores y lugares por endpoints admin o por scripts de importacion.

### Opcion B: Servicio interno detras de un API Gateway

La API de recomendaciones se puede exponer detras de un gateway que se encargue de:

- Validar identidad.
- Transformar tokens externos al JWT esperado por Spring.
- Aplicar rate limiting.
- Ocultar endpoints admin.

### Opcion C: Adaptar el modelo a otros dominios

El modelo puede generalizarse:

```text
User  -> Persona que recibe recomendaciones
Drink -> Item recomendado
Flavor -> Atributo del item
Place -> Fuente, tienda, ubicacion o proveedor
```

Ejemplos:

| Dominio | Item | Atributo |
|---|---|---|
| Restaurantes | Platillo | Ingrediente o sabor |
| Musica | Cancion | Genero o mood |
| Ecommerce | Producto | Categoria o caracteristica |
| Turismo | Lugar | Interes o actividad |

La idea central se mantiene: recomendaciones por similitud entre preferencias del usuario y atributos ponderados del item.

## 11. Archivos relacionados

| Archivo | Responsabilidad |
|---|---|
| `RecommendationHandler.java` | Expone endpoints REST de recomendaciones |
| `RecommendationServiceImpl.java` | Orquesta la llamada al repositorio |
| `RecommendationRepository.java` | Ejecuta el algoritmo Cypher |
| `UserRepository.java` | Guarda gustos, preferencias y consumos |
| `DrinkRepository.java` | Administra bebidas y relaciones con sabores/lugares |
| `CloudinaryImageResolver.java` | Convierte public IDs en URLs publicas |
| `SecurityConfig.java` | Protege endpoints con JWT |

