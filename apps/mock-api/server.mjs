import { readFileSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"
import express from "express"
import { faker } from "@faker-js/faker"

faker.seed(1)

const __dirname = dirname(fileURLToPath(import.meta.url))
const specsDir = resolve(__dirname, "../../apps/api/openapi")
const client = JSON.parse(readFileSync(`${specsDir}/client.json`, "utf8"))
const admin = JSON.parse(readFileSync(`${specsDir}/admin.json`, "utf8"))

// ── Faker factories ───────────────────────────────────────────────────────────

const FLAVORS = ["sweet", "citrus", "bitter", "spicy", "smoky", "sour", "herbal", "fruity", "earthy", "floral"]
const CATEGORIES = ["cocktail", "shot", "beer", "wine", "spirit", "mocktail"]
const PLACES = [
  { id: "place-1", name: "Shotios", location: "Zona 10, Guatemala City" },
  { id: "place-2", name: "Donde el Gringo", location: "Antigua Guatemala" },
  { id: "place-3", name: "Club Gallo Negro", location: "Dinamia Cayala Z16, Local 9A" },
  { id: "place-4", name: "Barezzito", location: "Boulevard Austriaco 37-01 Zona 16" },
]

function fakeFlavors() {
  return Object.fromEntries(
    faker.helpers.arrayElements(FLAVORS, { min: 2, max: 5 })
      .map(f => [f, faker.number.float({ min: 0.1, max: 1.0, fractionDigits: 1 })])
  )
}

function fakeDrink(placeId) {
  const place = placeId
    ? PLACES.find(p => p.id === placeId) ?? PLACES[0]
    : faker.helpers.arrayElement(PLACES)
  return {
    id: faker.string.uuid(),
    name: `${faker.word.adjective()} ${faker.word.noun()}`,
    category: faker.helpers.arrayElement(CATEGORIES),
    placeId: place.id,
    placeName: place.name,
    alcoholPct: faker.number.float({ min: 0, max: 45, fractionDigits: 1 }),
    price: faker.number.float({ min: 20, max: 200, fractionDigits: 2 }),
    flavors: fakeFlavors(),
    images: Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => ({
      id: `drinks/${faker.string.alphanumeric(20)}`,
      url: faker.image.urlPicsumPhotos({ width: 400, height: 400 }),
    })),
  }
}

function fakeRecommendation() {
  const drink = fakeDrink()
  return {
    drinkId: drink.id,
    drink: drink.name,
    category: drink.category,
    price: drink.price,
    imageUrls: drink.images.map(img => img.url),
    scoreFlavor: faker.number.float({ min: 0.3, max: 1.0, fractionDigits: 2 }),
    scorePrice: faker.number.float({ min: 0.0, max: 0.2, fractionDigits: 2 }),
    scoreFinal: faker.number.float({ min: 0.3, max: 1.0, fractionDigits: 2 }),
  }
}

function fakeConsumedDrink() {
  const place = faker.helpers.arrayElement(PLACES)
  return {
    id: faker.string.uuid(),
    name: `${faker.word.adjective()} ${faker.word.noun()}`,
    category: faker.helpers.arrayElement(CATEGORIES),
    placeId: place.id,
    placeName: place.name,
    price: faker.number.float({ min: 20, max: 200, fractionDigits: 2 }),
    rating: faker.number.int({ min: 1, max: 5 }),
    date: faker.date.recent({ days: 60 }).toISOString().split('T')[0],
    flavors: fakeFlavors(),
    imageUrls: Array.from({ length: faker.number.int({ min: 1, max: 2 }) }, () =>
      faker.image.urlPicsumPhotos({ width: 400, height: 400 })
    ),
  }
}

function fakeFlavor() {
  return { name: faker.helpers.arrayElement(FLAVORS), description: faker.lorem.sentence() }
}

function paged(req, items) {
  const page = parseInt(req.query.page ?? "0")
  const limit = parseInt(req.query.limit ?? "20")
  const start = page * limit
  return { elements: items.slice(start, start + limit), total: items.length, page, limit }
}

// ── Route handlers keyed by operationId ──────────────────────────────────────

const handlers = {
  // client
  getMe: () => ({
    id: faker.string.uuid(),
    alias: faker.internet.username(),
    age: faker.number.int({ min: 18, max: 45 }),
    budgetMax: faker.number.float({ min: 50, max: 300, fractionDigits: 2 }),
    prefersAlcohol: faker.datatype.boolean(),
    tastes: fakeFlavors(),
  }),
  getMyTastes: () => fakeFlavors(),
  addTaste: () => ({ message: "Taste added" }),
  removeTaste: () => ({ message: "Taste removed" }),
  getRecommendations: () => Array.from({ length: faker.number.int({ min: 5, max: 10 }) }, fakeRecommendation),
  getRecommendation: (req) => ({ ...fakeRecommendation(), drinkId: req.params.drinkId }),
  getMyStats: () => ({
    tried: faker.number.int({ min: 1, max: 40 }),
    venues: faker.number.int({ min: 1, max: 4 }),
    favCategory: faker.helpers.arrayElement(CATEGORIES),
  }),
  getMyConsumption: (req) => paged(req, Array.from({ length: faker.number.int({ min: 3, max: 8 }) }, fakeConsumedDrink)),
  logConsumption: () => ({ message: "Consumption recorded" }),
  removeConsumption: () => ({ message: "Consumption removed" }),
  updatePreferences: (req) => ({
    id: faker.string.uuid(),
    alias: faker.internet.username(),
    age: faker.number.int({ min: 18, max: 45 }),
    budgetMax: req.body?.budgetMax ?? faker.number.float({ min: 50, max: 300, fractionDigits: 2 }),
    prefersAlcohol: req.body?.prefersAlcohol ?? faker.datatype.boolean(),
    tastes: fakeFlavors(),
  }),
  listDrinks: (req) => paged(req, Array.from({ length: faker.number.int({ min: 8, max: 15 }) }, () => fakeDrink())),
  getDrink: () => fakeDrink(),
  listDrinksByCategory: (req) => paged(req, Array.from({ length: faker.number.int({ min: 4, max: 10 }) }, () => fakeDrink())),
  listFlavors: () => FLAVORS.map(name => ({ name, description: faker.lorem.sentence() })),

  // admin
  listPlaces: (req) => paged(req, PLACES),
  createPlace: (req) => ({ id: faker.string.uuid(), ...req.body }),
  updatePlace: (req) => ({ id: req.params.id, ...req.body }),
  deletePlace: () => ({ message: "Place deleted" }),
  adminListDrinks: (req) => {
    const all = Array.from({ length: faker.number.int({ min: 5, max: 15 }) }, () => fakeDrink())
    const filtered = req.query.placeId ? all.filter(d => d.placeId === req.query.placeId) : all
    return paged(req, filtered)
  },
  adminGetDrink: () => fakeDrink(),
  importDrinks: (req) => Array.from({ length: req.body?.drinks?.length ?? 3 }, () => fakeDrink(req.params.placeId)),
  updateDrink: (req) => ({ ...fakeDrink(), id: req.params.id, ...req.body }),
  deleteDrink: () => ({ message: "Drink deleted" }),
  adminListFlavors: () => FLAVORS.map(name => ({ name, description: faker.lorem.sentence() })),
  createFlavor: (req) => ({ name: req.body?.name, description: req.body?.description }),
  updateFlavor: (req) => ({ name: req.params.name, ...req.body }),
  deleteFlavor: () => ({ message: "Flavor deleted" }),
  signUpload: () => ({
    signature: faker.string.alphanumeric(40),
    timestamp: Math.floor(Date.now() / 1000),
    cloudName: "drunkgraph",
    apiKey: faker.string.numeric(15),
    folder: "drinks",
  }),
}

// ── Register routes from OpenAPI specs ────────────────────────────────────────

const app = express()
app.use(express.json())

function openApiPathToExpress(path) {
  return path.replace(/\{(\w+)\}/g, ":$1")
}

function registerSpec(spec) {
  for (const [path, methods] of Object.entries(spec.paths ?? {})) {
    const expressPath = openApiPathToExpress(path)
    for (const [method, op] of Object.entries(methods)) {
      if (!["get", "post", "put", "patch", "delete"].includes(method)) continue
      const operationId = op.operationId
      const handler = handlers[operationId]
      if (!handler) {
        console.warn(`[mock] no handler for ${operationId} (${method.toUpperCase()} ${path})`)
        app[method](expressPath, (_req, res) => res.status(501).json({ error: `No mock for ${operationId}` }))
        continue
      }
      app[method](expressPath, (req, res) => res.json(handler(req)))
    }
  }
}

registerSpec(client)
registerSpec(admin)

app.listen(8080, () => console.log("[mock-api] listening on http://localhost:8080"))
