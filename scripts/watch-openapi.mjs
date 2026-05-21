import { watch, existsSync, mkdirSync } from "fs"
import { execSync } from "child_process"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const specDir = resolve(__dirname, "../apps/api/openapi")
const specPath = resolve(specDir, "openapi.json")

if (!existsSync(specDir)) {
  mkdirSync(specDir, { recursive: true })
}

console.log("[watch-openapi] Watching", specPath)

let debounce = null

watch(specDir, (event, filename) => {
  if (filename !== "openapi.json") return
  if (!existsSync(specPath)) return

  clearTimeout(debounce)
  debounce = setTimeout(() => {
    console.log("[watch-openapi] Spec changed, regenerating API types...")
    try {
      execSync("pnpm --filter web generate:api", {
        stdio: "inherit",
        cwd: resolve(__dirname, ".."),
      })
      console.log("[watch-openapi] Done.")
    } catch (e) {
      console.error("[watch-openapi] Generation failed:", e.message)
    }
  }, 500)
})
