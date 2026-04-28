import { createServerClient } from "@/lib/supabase/server"
import type { Restaurant } from "@/lib/types/database"

export async function getActiveRestaurants(city: string = "Brisbane"): Promise<Restaurant[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("city", city)
    .eq("is_active", true)
    .lt("flag_count", 3)
    .order("price", { ascending: true })

  if (error) {
    console.error("Failed to fetch restaurants:", error.message)
    return []
  }

  return data as Restaurant[]
}

export async function getRestaurantById(id: string): Promise<Restaurant | null> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    console.error("Failed to fetch restaurant:", error.message)
    return null
  }

  return data as Restaurant
}
