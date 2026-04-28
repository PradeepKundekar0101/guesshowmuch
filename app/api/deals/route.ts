import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

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

export async function GET() {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("deals")
    .select(DEAL_SELECT)
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
  const {
    restaurant_id,
    title,
    description,
    deal_price,
    original_price,
    expires_at,
    photo_url,
  } = body

  if (!restaurant_id) {
    return NextResponse.json(
      { error: "Pick a restaurant for this deal" },
      { status: 400 }
    )
  }
  if (!title || !deal_price || !expires_at) {
    return NextResponse.json(
      { error: "Title, deal price, and expiry are required" },
      { status: 400 }
    )
  }

  const supabase = createServerClient()

  // Validate the restaurant exists and grab its current price as a fallback
  const { data: restaurant, error: rErr } = await supabase
    .from("restaurants")
    .select("id, price")
    .eq("id", restaurant_id)
    .single()

  if (rErr || !restaurant) {
    return NextResponse.json(
      { error: "That restaurant doesn't exist" },
      { status: 400 }
    )
  }

  const dealPriceNum = parseFloat(deal_price)
  const originalPriceNum =
    original_price && original_price !== ""
      ? parseFloat(original_price)
      : restaurant.price

  if (dealPriceNum >= originalPriceNum) {
    return NextResponse.json(
      { error: "Deal price must be less than the original price" },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from("deals")
    .insert({
      restaurant_id,
      title,
      description: description || null,
      deal_price: dealPriceNum,
      original_price: originalPriceNum,
      expires_at,
      photo_url: photo_url || null,
    })
    .select(DEAL_SELECT)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
