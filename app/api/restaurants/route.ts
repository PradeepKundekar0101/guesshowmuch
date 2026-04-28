import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  const body = await request.json()
  const { name, dish_name, price, cuisine_type, address, suburb, latitude, longitude, photo_url } = body

  if (!name || !dish_name || !price || !cuisine_type || !address || !suburb || !latitude || !longitude) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const numPrice = parseFloat(price)
  if (isNaN(numPrice) || numPrice <= 0 || numPrice > 15) {
    return NextResponse.json({ error: "Price must be between $0.01 and $15.00" }, { status: 400 })
  }

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("restaurants")
    .insert({
      name, dish_name, price: numPrice, cuisine_type, address, suburb,
      city: "Brisbane",
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      photo_url: photo_url || null,
      pin_type: "standard",
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data, { status: 201 })
}
