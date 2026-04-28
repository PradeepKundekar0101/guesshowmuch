import { getActiveRestaurants } from "@/lib/queries/restaurants"
import { MapView } from "./map-view"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function Home() {
  const restaurants = await getActiveRestaurants()

  return <MapView restaurants={restaurants} />
}
