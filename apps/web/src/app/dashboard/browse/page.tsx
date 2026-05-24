import { DrinkBrowseScreen } from "@/components/magicpath/client-browse/DrinkBrowseScreen"
import { createServerApi } from "@/lib/api/server"

export default async function BrowsePage() {
  const api = await createServerApi()
  const { data } = await api.GET('/api/drinks', { params: { query: { page: 0, limit: 20 } } })
  return <DrinkBrowseScreen initialPage={data} />
}
