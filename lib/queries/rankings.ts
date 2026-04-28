import { createServerClient } from "@/lib/supabase/server"
import type { Restaurant } from "@/lib/types/database"

export type SuburbRanking = {
  suburb: string
  totalScore: number
  restaurantCount: number
  topRestaurants: Restaurant[]
}

export async function getSuburbRankings(): Promise<SuburbRanking[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("is_active", true)
    .lt("flag_count", 3)
    .order("vote_score", { ascending: false })

  if (error || !data) {
    console.error("Failed to fetch rankings:", error?.message)
    return []
  }

  const suburbMap = new Map<string, Restaurant[]>()
  for (const restaurant of data) {
    const suburb = restaurant.suburb || "Unknown"
    if (!suburbMap.has(suburb)) suburbMap.set(suburb, [])
    suburbMap.get(suburb)!.push(restaurant)
  }

  const rankings: SuburbRanking[] = Array.from(suburbMap.entries()).map(
    ([suburb, restaurants]) => ({
      suburb,
      totalScore: restaurants.reduce((sum, r) => sum + r.vote_score, 0),
      restaurantCount: restaurants.length,
      topRestaurants: restaurants.slice(0, 3),
    })
  )

  rankings.sort((a, b) => b.totalScore - a.totalScore)
  return rankings
}
