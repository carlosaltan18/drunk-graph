# Informe tecnico de la aplicacion DrunkGraph

## 1. Resumen ejecutivo

DrunkGraph es una aplicacion web orientada a recomendar bebidas segun las preferencias de cada usuario. El sistema combina una interfaz web en Next.js, un backend en Spring Boot y una base de datos Neo4j para explotar relaciones entre usuarios, sabores, bebidas y lugares.

La principal caracteristica tecnica es el motor de recomendaciones basado en grafos. En lugar de guardar recomendaciones precomputadas, el backend calcula el ranking en tiempo de consulta usando relaciones `LIKES`, `HAS_FLAVOR` y `CONSUMED`.

## 2. Objetivo del sistema

El objetivo principal es permitir que un usuario reciba recomendaciones personalizadas de bebidas tomando en cuenta:

- Sabores que le gustan.
- Intensidad de esos sabores en cada bebida.
- Presupuesto maximo.
- Preferencia por bebidas con o sin alcohol.
- Bebidas que ya consumio.

Ademas, la aplicacion permite a administradores gestionar lugares, sabores, bebidas e imagenes.

## 3. Alcance funcional

### Usuario final

- Iniciar sesion mediante FusionAuth.
- Consultar su perfil.
- Configurar presupuesto y preferencia de alcohol.
- Registrar gustos por sabores.
- Ver listado de bebidas.
- Consultar recomendaciones personalizadas.
- Registrar bebidas consumidas y calificaciones.
- Consultar estadisticas personales.

### Administrador

- Crear, editar y eliminar lugares.
- Crear, editar y eliminar sabores.
- Importar bebidas por lote.
- Editar y eliminar bebidas.
- Firmar uploads hacia Cloudinary.

## 4. Arquitectura general

El proyecto esta organizado como monorepo:

```text
apps/
  api/       Backend Spring Boot
  web/       Frontend Next.js
  mock-api/  API falsa para desarrollo frontend
docs/        Documentacion tecnica
compose.yaml Infraestructura local
```

Arquitectura logica:

```text
Usuario
  -> Next.js Web
  -> Proxy/API Client
  -> Spring Boot API
  -> Neo4j
  -> Cloudinary
```

FusionAuth emite JWTs que el backend valida usando JWKS. Neo4j almacena el grafo de usuarios, bebidas, sabores y lugares. Cloudinary aloja imagenes de bebidas.

## 5. Backend

El backend esta construido con Spring Boot y se encuentra en:

```text
apps/api
```

Tecnologias principales:

| Tecnologia | Uso |
|---|---|
| Spring Boot | Framework backend |
| Spring Web MVC | Endpoints REST |
| Spring Security | Proteccion por JWT |
| OAuth2 Resource Server | Validacion de tokens |
| Spring Data Neo4j / Neo4jClient | Acceso a Neo4j |
| Neo4j Migrations | Restricciones e inicializacion de esquema |
| Cloudinary SDK | Firma de uploads y URLs de imagenes |
| Lombok | Reduccion de boilerplate |
| Springdoc OpenAPI | Documentacion de API |

### 5.1 Modulos principales

| Modulo | Responsabilidad |
|---|---|
| `user` | Perfil, gustos, preferencias, consumo y estadisticas |
| `drink` | Consulta, importacion, edicion y eliminacion de bebidas |
| `flavor` | Gestion y consulta de sabores |
| `place` | Gestion de lugares |
| `recommendation` | Calculo de recomendaciones |
| `shared` | Respuestas paginadas |
| `exception` | Excepciones de dominio |
| `infra.security` | Seguridad JWT |
| `infra.http` | Controladores REST |
| `infra.cloudinary` | Integracion con Cloudinary |
| `infra.openapi` | Configuracion y exportacion OpenAPI |

## 6. Seguridad

La seguridad se define en `SecurityConfig`.

Existen dos cadenas de filtros:

1. Endpoints admin: `/api/admin/**`
2. Endpoints cliente: resto de endpoints protegidos

Rutas publicas:

```text
/api/health
/v3/api-docs/**
/client-docs.html
/admin-docs.html
/client/docs
/admin/docs
/error
```

El backend funciona como OAuth2 Resource Server. Recibe un `Bearer JWT`, valida firma y emisor con JWKS y extrae el `subject` para identificar al usuario.

La clase `ProvisioningJwtAuthenticationConverter` provisiona automaticamente al usuario en Neo4j cuando llega una solicitud autenticada.

## 7. Modelo de datos

El sistema usa un modelo de grafos con estos nodos:

| Nodo | Descripcion |
|---|---|
| `User` | Usuario autenticado |
| `Drink` | Bebida recomendada o administrada |
| `Flavor` | Sabor o atributo sensorial |
| `Place` | Lugar donde se sirve una bebida |

Relaciones:

| Relacion | Descripcion |
|---|---|
| `LIKES` | Usuario prefiere un sabor con peso `score` |
| `HAS_FLAVOR` | Bebida contiene un sabor con intensidad `intensity` |
| `CONSUMED` | Usuario consumio una bebida con `rating` y `date` |
| `SERVED_AT` | Bebida se sirve en un lugar |

Restricciones Neo4j:

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

## 8. Motor de recomendaciones

El motor se implementa en `RecommendationRepository`. Usa Cypher para buscar bebidas que compartan sabores con el usuario.

Entradas principales:

- `userId`, tomado desde `jwt.getSubject()`.
- `limit`, cantidad maxima de recomendaciones.
- Relaciones `LIKES` del usuario.
- Relaciones `HAS_FLAVOR` de las bebidas.
- Presupuesto y preferencia de alcohol del usuario.

Salida principal:

```json
{
  "drinkId": "id",
  "drink": "nombre",
  "category": "categoria",
  "price": 45.0,
  "scoreFlavor": 0.612,
  "scorePrice": 0.08,
  "scoreFinal": 0.692,
  "imageUrls": []
}
```

El sistema excluye bebidas ya consumidas en el endpoint de top recomendaciones y penaliza bebidas fuera del presupuesto.

## 9. Endpoints principales

### Cliente

| Metodo | Ruta | Descripcion |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/users/me` | Perfil del usuario actual |
| `PUT` | `/api/users/me` | Actualizar preferencias |
| `GET` | `/api/users/me/tastes` | Listar gustos |
| `POST` | `/api/users/me/tastes` | Agregar gusto |
| `DELETE` | `/api/users/me/tastes/{flavor}` | Eliminar gusto |
| `GET` | `/api/users/me/recommendations` | Obtener recomendaciones |
| `GET` | `/api/users/me/recommendations/{drinkId}` | Obtener recomendacion especifica |
| `POST` | `/api/users/me/consumption` | Registrar consumo |
| `GET` | `/api/users/me/consumption` | Listar consumos |
| `GET` | `/api/users/me/stats` | Estadisticas |
| `GET` | `/api/drinks` | Listar bebidas |
| `GET` | `/api/drinks/{id}` | Detalle de bebida |
| `GET` | `/api/flavors` | Listar sabores |

### Administrador

| Metodo | Ruta | Descripcion |
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
| `POST` | `/api/admin/places/{placeId}/drinks/batch` | Importar bebidas |
| `PUT` | `/api/admin/drinks/{id}` | Actualizar bebida |
| `DELETE` | `/api/admin/drinks/{id}` | Eliminar bebida |
| `POST` | `/api/admin/uploads/sign` | Firmar upload Cloudinary |

## 10. Frontend

El frontend esta construido con Next.js y se encuentra en:

```text
apps/web
```

Tecnologias principales:

| Tecnologia | Uso |
|---|---|
| Next.js | App web |
| React | UI |
| BetterAuth | Manejo de sesion |
| openapi-fetch | Cliente tipado hacia la API |
| SWR | Fetching y cache en cliente |
| Tailwind CSS | Estilos |
| lucide-react | Iconos |

El frontend consume la API mediante proxies internos que adjuntan el JWT antes de llamar al backend.

## 11. Despliegue

### Local

```bash
just infra-up
pnpm install
just dev
```

### Backend en Render

El backend se despliega con Docker usando el `Dockerfile` del root. Render inyecta el puerto con `PORT`, por eso `application.properties` usa:

```properties
server.port=${PORT:8080}
```

Health check recomendado:

```text
/api/health
```

## 12. Diagramas PlantText

Los diagramas PlantUML listos para PlantText estan en:

```text
docs/diagrams/backend-class-diagram.puml
docs/diagrams/recommendation-sequence.puml
docs/diagrams/admin-import-sequence.puml
docs/diagrams/auth-provisioning-sequence.puml
docs/diagrams/graph-entity-diagram.puml
```

## 13. Conclusiones

DrunkGraph aplica una arquitectura clara para un sistema de recomendaciones basado en grafos. Neo4j permite expresar de forma natural la relacion entre usuarios, sabores y bebidas, mientras que Spring Boot centraliza seguridad, reglas de negocio y exposicion REST.

La decision de calcular recomendaciones en tiempo de consulta simplifica el sistema y evita procesos batch o colas para el tamano actual del proyecto. Para una escala mayor, el siguiente paso seria agregar caching, precomputacion parcial o analitica offline.

## 14. Mejoras futuras

- Manejar explicitamente usuarios con `budget_max = 0` antes de calcular score de precio.
- Agregar tests automatizados para el algoritmo de recomendacion.
- Separar roles admin y user con claims o authorities especificas.
- Agregar observabilidad con metricas de latencia por endpoint.
- Versionar el contrato OpenAPI en cada release.
- Agregar cache de recomendaciones por usuario si el volumen crece.
