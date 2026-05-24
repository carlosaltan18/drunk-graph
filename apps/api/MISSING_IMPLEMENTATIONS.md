# Missing Service Implementations

All HTTP handlers and interfaces are already wired. The stubs below throw
`UnsupportedOperationException` at runtime — these are the methods that need
real Neo4j Cypher queries.

---

## 1. `UserServiceImpl` — 2 methods

**File:** `src/main/java/com/uvg/drunkgraph/modules/user/service/UserServiceImpl.java`

### `updatePreferences(String userId, UserPreferencesRequest request) → User`

Called by `PUT /api/users/me` (`updatePreferences` operation).

Expected behaviour:
- `MATCH (u:User {id: $userId})` and `SET u.budget_max`, `u.prefers_alcohol`
  with the non-null fields from `UserPreferencesRequest` (both fields are
  nullable — only update what is present).
- Return the updated `User` (re-fetch or build from the patched node).

Request fields (`UserPreferencesRequest`):
```
Double  budgetMax        → stored as u.budget_max
Boolean prefersAlcohol   → stored as u.prefers_alcohol
```

Response type: `User` (same shape returned by `getMe`).

---

### `getStats(String userId) → UserStats`

Called by `GET /api/users/me/stats` (`getMyStats` operation).

Expected behaviour — compute from the graph and return a `UserStats`:

| Field | How to derive |
|---|---|
| `int tried` | `count` of `(u)-[:CONSUMED]->(d:Drink)` relationships |
| `int venues` | `count(DISTINCT p)` where `(u)-[:CONSUMED]->(d)-[:SERVED_AT]->(p:Place)` |
| `String favCategory` | `d.category` with the highest consumption count for this user |

Response type: `UserStats { int tried; int venues; String favCategory; }`

---

## 2. `DrinkServiceImpl` — 3 methods

**File:** `src/main/java/com/uvg/drunkgraph/modules/drink/service/DrinkServiceImpl.java`

> Tip: `DrinkRepository` already has `listAllWithFlavors`, `findByCategory`, and
> `findById` with full Cypher + Cloudinary image resolution. Model the new
> queries after those.

### `importBatch(String placeId, DrinkBatchRequest request) → List<Drink>`

Called by `POST /api/admin/places/{placeId}/drinks/batch` (`importDrinks` operation).

Expected behaviour:
- For each `DrinkItemRequest` in `request.getDrinks()`:
  - Generate a new UUID for `id`.
  - `MERGE (p:Place {id: $placeId})` (place must already exist).
  - `CREATE (d:Drink { id, name, category, alcohol_pct, price, images })` where
    `images` is `imagePublicIds` (a `List<String>` of Cloudinary public IDs —
    resolution to full URLs is done at read time by `ImageResolver`).
  - `CREATE (d)-[:SERVED_AT]->(p)`.
  - For each entry in `flavors` map: `MERGE (f:Flavor {name: $flavor})` then
    `CREATE (d)-[:HAS_FLAVOR {intensity: $score}]->(f)`.
- Return the list of created `Drink` objects (re-fetch via
  `drinkRepo.findById(id)` or map directly from the created nodes).

Request fields (`DrinkItemRequest`):
```
String               name
String               category
double               alcoholPct
double               price
Map<String, Double>  flavors          // flavor name → intensity 0.0–1.0
List<String>         imagePublicIds   // Cloudinary public IDs
```

---

### `update(String id, DrinkEditRequest request) → Drink`

Called by `PUT /api/admin/drinks/{id}` (`updateDrink` operation).

Expected behaviour:
- `MATCH (d:Drink {id: $id})` — throw `ResourceNotFoundException` if missing.
- `SET d.name`, `d.category`, `d.alcohol_pct`, `d.price`, `d.images`
  (= `imagePublicIds`).
- Replace the `SERVED_AT` relationship: delete the old one, create
  `(d)-[:SERVED_AT]->(p:Place {id: $placeId})`.
- Replace all `HAS_FLAVOR` relationships: `MATCH (d)-[r:HAS_FLAVOR]->() DELETE r`,
  then recreate from `request.getFlavors()`.
- Return the updated `Drink` (re-fetch via `drinkRepo.findById(id)`).

Request fields (`DrinkEditRequest`):
```
String               name
String               category
String               placeId          // target place (replaces current SERVED_AT)
double               alcoholPct
double               price
Map<String, Double>  flavors
List<String>         imagePublicIds
```

---

### `delete(String id) → void`

Called by `DELETE /api/admin/drinks/{id}` (`deleteDrink` operation).

Expected behaviour:
- `MATCH (d:Drink {id: $id})` — throw `ResourceNotFoundException` if missing.
- `DETACH DELETE d` (removes the node and all its relationships).

---

## 3. `FlavorServiceImpl` — 3 methods

**File:** `src/main/java/com/uvg/drunkgraph/modules/flavor/service/FlavorServiceImpl.java`

### `create(FlavorRequest request) → Flavor`

Called by `POST /api/admin/flavors` (`createFlavor` operation).

Expected behaviour:
- `CREATE (f:Flavor { name: $name, description: $description })` — name should
  be unique; consider throwing a 409 if a flavor with that name already exists.
- Return the created `Flavor`.

Request fields (`FlavorRequest`): `String name`, `String description`.

---

### `update(String name, FlavorRequest request) → Flavor`

Called by `PUT /api/admin/flavors/{name}` (`updateFlavor` operation).

Expected behaviour:
- `MATCH (f:Flavor {name: $name})` — throw `ResourceNotFoundException` if
  missing.
- `SET f.description = $description` (and `f.name = $newName` if
  `request.getName()` differs from the path param).
- Return the updated `Flavor`.

---

### `delete(String name) → void`

Called by `DELETE /api/admin/flavors/{name}` (`deleteFlavor` operation).

Expected behaviour:
- `MATCH (f:Flavor {name: $name})` — throw `ResourceNotFoundException` if
  missing.
- `DETACH DELETE f`.

---

## 4. `AdminPlaceServiceImpl` — 4 methods (entire class)

**File:** `src/main/java/com/uvg/drunkgraph/modules/place/service/AdminPlaceServiceImpl.java`

There is no `PlaceRepository` yet — you will need to create one (follow the
pattern of `DrinkRepository`; inject `Neo4jClient`).

Place node shape in Neo4j: `(:Place { id, name, location })`.

### `listAll(String search, int page, int limit) → PagedResult<Place>`

Called by `GET /api/admin/places` (`listPlaces` operation).

Expected behaviour:
- Count and paginate `(:Place)` nodes, optionally filtering by
  `toLower(p.name) CONTAINS toLower($search)` when `search != null`.
- Return `PagedResult<Place>`.

---

### `create(PlaceRequest request) → Place`

Called by `POST /api/admin/places` (`createPlace` operation).

Expected behaviour:
- Generate UUID for `id`.
- `CREATE (p:Place { id, name, location })`.
- Return the created `Place`.

Request fields (`PlaceRequest`): `String name`, `String location`.

---

### `update(String id, PlaceRequest request) → Place`

Called by `PUT /api/admin/places/{id}` (`updatePlace` operation).

Expected behaviour:
- `MATCH (p:Place {id: $id})` — throw `ResourceNotFoundException` if missing.
- `SET p.name`, `p.location`.
- Return the updated `Place`.

---

### `softDelete(String id) → void`

Called by `DELETE /api/admin/places/{id}` (`deletePlace` operation).  
Note: the handler already returns `"Place deactivated"` in its response message.

Decide with the team whether this should be a true `DETACH DELETE` or a soft
delete (e.g. `SET p.active = false`). The current response message says
"deactivated", suggesting soft delete is the intent. If you go with soft delete,
also filter `listAll` to exclude inactive places.

---

## Summary table

| Service | Method | Endpoint |
|---|---|---|
| `UserServiceImpl` | `updatePreferences` | `PUT /api/users/me` |
| `UserServiceImpl` | `getStats` | `GET /api/users/me/stats` |
| `DrinkServiceImpl` | `importBatch` | `POST /api/admin/places/{placeId}/drinks/batch` |
| `DrinkServiceImpl` | `update` | `PUT /api/admin/drinks/{id}` |
| `DrinkServiceImpl` | `delete` | `DELETE /api/admin/drinks/{id}` |
| `FlavorServiceImpl` | `create` | `POST /api/admin/flavors` |
| `FlavorServiceImpl` | `update` | `PUT /api/admin/flavors/{name}` |
| `FlavorServiceImpl` | `delete` | `DELETE /api/admin/flavors/{name}` |
| `AdminPlaceServiceImpl` | `listAll` | `GET /api/admin/places` |
| `AdminPlaceServiceImpl` | `create` | `POST /api/admin/places` |
| `AdminPlaceServiceImpl` | `update` | `PUT /api/admin/places/{id}` |
| `AdminPlaceServiceImpl` | `softDelete` | `DELETE /api/admin/places/{id}` |

> All read-side endpoints (`GET /api/drinks`, `GET /api/users/me`,
> `GET /api/users/me/consumption`, `GET /api/users/me/recommendations`, etc.)
> are fully implemented and working.
