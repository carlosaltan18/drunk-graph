import { watch, existsSync, mkdirSync } from "fs"
import { execSync } from "child_process"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, "..")
const specDir = resolve(root, "apps/api/openapi")

const specs = {
  "client.json": "generate:api",
  "admin.json":  "generate:admin-api",
}

if (!existsSync(specDir)) {
  mkdirSync(specDir, { recursive: true })
}

console.log("[watch-openapi] Watching", specDir)

const debounces = {}

watch(specDir, (event, filename) => {
  const script = specs[filename]
  if (!script) return
  if (!existsSync(resolve(specDir, filename))) return

  clearTimeout(debounces[filename])
  debounces[filename] = setTimeout(() => {
    console.log(`[watch-openapi] ${filename} changed, running ${script}...`)
    try {
      execSync(`pnpm --filter web ${script}`, { stdio: "inherit", cwd: root })
      console.log(`[watch-openapi] ${script} done.`)
    } catch (e) {
      console.error(`[watch-openapi] ${script} failed:`, e.message)
    }
  }, 500)
})
