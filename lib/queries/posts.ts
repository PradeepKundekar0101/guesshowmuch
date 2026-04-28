import { createServerClient } from "@/lib/supabase/server"

export type PostRestaurant = {
  id: string
  name: string
  suburb: string | null
  cuisine_type: string | null
  price: number
  photo_url: string | null
}

export type Post = {
  id: string
  user_email: string
  content: string
  photo_url: string | null
  created_at: string
  restaurant_id: string | null
  restaurant: PostRestaurant | null
}

const POST_SELECT = `
  id,
  user_email,
  content,
  photo_url,
  created_at,
  restaurant_id,
  restaurant:restaurants (
    id,
    name,
    suburb,
    cuisine_type,
    price,
    photo_url
  )
`

export async function getPosts(): Promise<Post[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) {
    console.error("Failed to fetch posts:", error.message)
    return []
  }

  return (data ?? []) as unknown as Post[]
}

export async function getPostsForRestaurant(
  restaurantId: string,
  limit = 10
): Promise<Post[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Failed to fetch posts for restaurant:", error.message)
    return []
  }

  return (data ?? []) as unknown as Post[]
}
