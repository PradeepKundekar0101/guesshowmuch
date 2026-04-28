import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

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

export async function GET() {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { content, photo_url, user_email, restaurant_id } = body

  if (!content || !user_email) {
    return NextResponse.json(
      { error: "Content and email are required" },
      { status: 400 }
    )
  }

  const supabase = createServerClient()

  // If a restaurant is mentioned, validate it exists
  if (restaurant_id) {
    const { data: restaurant, error: rErr } = await supabase
      .from("restaurants")
      .select("id")
      .eq("id", restaurant_id)
      .single()

    if (rErr || !restaurant) {
      return NextResponse.json(
        { error: "That restaurant doesn't exist" },
        { status: 400 }
      )
    }
  }

  const { data, error } = await supabase
    .from("posts")
    .insert({
      content,
      photo_url: photo_url || null,
      user_email,
      restaurant_id: restaurant_id || null,
    })
    .select(POST_SELECT)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
