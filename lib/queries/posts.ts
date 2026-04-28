import { createServerClient } from "@/lib/supabase/server"

export type Post = {
  id: string
  user_email: string
  content: string
  photo_url: string | null
  created_at: string
}

export async function getPosts(): Promise<Post[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) {
    console.error("Failed to fetch posts:", error.message)
    return []
  }

  return data as Post[]
}
