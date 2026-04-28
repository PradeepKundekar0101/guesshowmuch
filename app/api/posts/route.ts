import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { content, photo_url, user_email } = body

  if (!content || !user_email) {
    return NextResponse.json({ error: "Content and email are required" }, { status: 400 })
  }

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("posts")
    .insert({ content, photo_url: photo_url || null, user_email })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
