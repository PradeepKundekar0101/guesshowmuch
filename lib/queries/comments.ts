import { createServerClient } from "@/lib/supabase/server"

export type Comment = {
  id: string
  restaurant_id: string
  user_email: string
  content: string
  created_at: string
}

export async function getCommentsByRestaurant(restaurantId: string): Promise<Comment[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) {
    console.error("Failed to fetch comments:", error.message)
    return []
  }

  return data as Comment[]
}
