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
  return {
    id: faker.string.uuid(),
    name: `${faker.word.adjective()} ${faker.word.noun()}`,
    category: faker.helpers.arrayElement(CATEGORIES),
    placeId: placeId ?? faker.helpers.arrayElement(PLACES).id,
    alcoholPct: faker.number.float({ min: 0, max: 45, fractionDigits: 1 }),
    price: faker.number.float({ min: 20, max: 200, fractionDigits: 2 }),
    flavors: fakeFlavors(),
    imageUrls: Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () =>
      faker.image.urlPicsumPhotos({ width: 400, height: 400 })
    ),
  }
}

function fakeRecommendation() {
  const drink = fakeDrink()
  return {
    drinkId: drink.id,
    drink: drink.name,
    category: drink.category,
    price: drink.price,
    imageUrls: drink.imageUrls,
    scoreFlavor: faker.number.float({ min: 0.3, max: 1.0, fractionDigits: 2 }),
    scorePrice: faker.number.float({ min: 0.0, max: 0.2, fractionDigits: 2 }),
    scoreFinal: faker.number.float({ min: 0.3, max: 1.0, fractionDigits: 2 }),
  }
}

function fakeFlavor() {
  return { name: faker.helpers.arrayElement(FLAVORS), description: faker.lorem.sentence() }
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
  getMyConsumption: () => Array.from({ length: faker.number.int({ min: 3, max: 8 }) }, () => fakeDrink()),
  logConsumption: () => ({ message: "Consumption recorded" }),
  removeConsumption: () => ({ message: "Consumption removed" }),
  listDrinks: () => Array.from({ length: faker.number.int({ min: 8, max: 15 }) }, () => fakeDrink()),
  getDrink: () => fakeDrink(),
  listDrinksByCategory: () => Array.from({ length: faker.number.int({ min: 4, max: 10 }) }, () => fakeDrink()),
  listFlavors: () => FLAVORS.map(name => ({ name, description: faker.lorem.sentence() })),

  // admin
  listPlaces: () => PLACES,
  createPlace: (req) => ({ id: faker.string.uuid(), ...req.body }),
  updatePlace: (req) => ({ id: req.params.id, ...req.body }),
  deletePlace: () => ({ message: "Place deleted" }),
  adminListDrinks: () => Array.from({ length: faker.number.int({ min: 5, max: 15 }) }, () => fakeDrink()),
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
