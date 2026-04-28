import { notFound } from "next/navigation"
import { getRestaurantById } from "@/lib/queries/restaurants"
import { getCommentsByRestaurant } from "@/lib/queries/comments"
import { getDealsForRestaurant } from "@/lib/queries/deals"
import { getPostsForRestaurant } from "@/lib/queries/posts"
import { RestaurantDetail } from "@/components/restaurant/RestaurantDetail"

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [restaurant, comments, deals, posts] = await Promise.all([
    getRestaurantById(id),
    getCommentsByRestaurant(id),
    getDealsForRestaurant(id),
    getPostsForRestaurant(id),
  ])

  if (!restaurant) {
    notFound()
  }

  return (
    <RestaurantDetail
      restaurant={restaurant}
      comments={comments}
      deals={deals}
      posts={posts}
    />
  )
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
