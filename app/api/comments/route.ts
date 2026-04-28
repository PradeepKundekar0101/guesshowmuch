import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const restaurantId = searchParams.get("restaurant_id")

  if (!restaurantId) {
    return NextResponse.json({ error: "restaurant_id is required" }, { status: 400 })
  }

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { restaurant_id, content, user_email } = body

  if (!restaurant_id || !content || !user_email) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("comments")
    .insert({ restaurant_id, content, user_email })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
