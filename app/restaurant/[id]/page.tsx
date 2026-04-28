import { notFound } from "next/navigation"
import { getRestaurantById } from "@/lib/queries/restaurants"
import { RestaurantDetail } from "@/components/restaurant/RestaurantDetail"

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const restaurant = await getRestaurantById(id)

  if (!restaurant) {
    notFound()
  }

  return <RestaurantDetail restaurant={restaurant} />
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const restaurant = await getRestaurantById(id)

  if (!restaurant) {
    return { title: "Restaurant Not Found" }
  }

  return {
    title: `${restaurant.dish_name} for $${restaurant.price} at ${restaurant.name} — Guess How Much?`,
    description: `${restaurant.dish_name} for just $${restaurant.price} at ${restaurant.name} in ${restaurant.suburb}, Brisbane. Community-verified cheap eats.`,
  }
}
