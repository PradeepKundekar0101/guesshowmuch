import { getActiveRestaurants } from "@/lib/queries/restaurants"
import { MapView } from "./map-view"

export default async function Home() {
  const restaurants = await getActiveRestaurants()

  return <MapView restaurants={restaurants} />
}
