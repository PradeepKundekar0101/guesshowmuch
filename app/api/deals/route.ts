import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("deals")
    .select("*")
    .eq("is_active", true)
    .gt("expires_at", new Date().toISOString())
    .order("expires_at", { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { title, description, deal_price, original_price, expires_at, photo_url } = body

  if (!title || !deal_price || !expires_at) {
    return NextResponse.json({ error: "Title, deal price, and expiry are required" }, { status: 400 })
  }

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("deals")
    .insert({
      title,
      description: description || null,
      deal_price: parseFloat(deal_price),
      original_price: original_price ? parseFloat(original_price) : null,
      expires_at,
      photo_url: photo_url || null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
