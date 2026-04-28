import { createServerClient } from "@/lib/supabase/server"

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
}

export async function getActiveDeals(): Promise<Deal[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("deals")
    .select("*")
    .eq("is_active", true)
    .gt("expires_at", new Date().toISOString())
    .order("expires_at", { ascending: true })

  if (error) {
    console.error("Failed to fetch deals:", error.message)
    return []
  }

  return data as Deal[]
}
