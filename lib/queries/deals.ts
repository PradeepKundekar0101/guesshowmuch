import { createServerClient } from "@/lib/supabase/server"

export type DealRestaurant = {
  id: string
  name: string
  suburb: string | null
  cuisine_type: string | null
  dish_name: string
  price: number
  photo_url: string | null
}

export type Deal = {
  id: string
  restaurant_id: string | null
  title: string
  description: string | null
  original_price: number | null
  deal_price: number
  expires_at: string
  photo_url: string | null
  is_active: boolean
  created_at: string
  vote_score: number
  up_count: number
  down_count: number
  restaurant: DealRestaurant | null
}

const DEAL_SELECT = `
  id,
  restaurant_id,
  title,
  description,
  original_price,
  deal_price,
  expires_at,
  photo_url,
  is_active,
  created_at,
  vote_score,
  up_count,
  down_count,
  restaurant:restaurants (
    id,
    name,
    suburb,
    cuisine_type,
    dish_name,
    price,
    photo_url
  )
`

export async function getActiveDeals(): Promise<Deal[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("deals")
    .select(DEAL_SELECT)
    .eq("is_active", true)
    .gt("expires_at", new Date().toISOString())
    .order("vote_score", { ascending: false })
    .order("expires_at", { ascending: true })

  if (error) {
    console.error("Failed to fetch deals:", error.message)
    return []
  }

  return (data ?? []) as unknown as Deal[]
}

export async function getDealsForRestaurant(
  restaurantId: string
): Promise<Deal[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("deals")
    .select(DEAL_SELECT)
    .eq("restaurant_id", restaurantId)
    .eq("is_active", true)
    .gt("expires_at", new Date().toISOString())
    .order("expires_at", { ascending: true })

  if (error) {
    console.error("Failed to fetch deals for restaurant:", error.message)
    return []
  }

  return (data ?? []) as unknown as Deal[]
}
