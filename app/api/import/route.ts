import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  const body = await request.json()
  const { passphrase, restaurants } = body

  if (!passphrase || passphrase !== process.env.ADMIN_PASSPHRASE) {
    return NextResponse.json({ error: "Invalid passphrase" }, { status: 401 })
  }

  if (!Array.isArray(restaurants) || restaurants.length === 0) {
    return NextResponse.json({ error: "No restaurants provided" }, { status: 400 })
  }

  const supabase = createServerClient()
  const errors: string[] = []

  const validRows = restaurants.filter((row: Record<string, unknown>, i: number) => {
    if (!row.name || !row.dish_name || !row.price || !row.latitude || !row.longitude) {
      errors.push(`Row ${i + 1}: missing required fields`)
      return false
    }
    const price = parseFloat(String(row.price))
    if (isNaN(price) || price <= 0 || price > 15) {
      errors.push(`Row ${i + 1}: price must be between $0.01 and $15.00`)
      return false
    }
    return true
  })

  let imported = 0
  if (validRows.length > 0) {
    const insertRows = validRows.map((row: Record<string, unknown>) => ({
      name: String(row.name),
      dish_name: String(row.dish_name),
      price: parseFloat(String(row.price)),
      cuisine_type: row.cuisine_type ? String(row.cuisine_type) : null,
      address: row.address ? String(row.address) : null,
      suburb: row.suburb ? String(row.suburb) : null,
      city: row.city ? String(row.city) : "Brisbane",
      latitude: parseFloat(String(row.latitude)),
      longitude: parseFloat(String(row.longitude)),
      photo_url: row.photo_url ? String(row.photo_url) : null,
      pin_type: "standard" as const,
    }))

    const { error } = await supabase.from("restaurants").insert(insertRows)
    if (error) {
      errors.push(`Database error: ${error.message}`)
    } else {
      imported = insertRows.length
    }
  }

  return NextResponse.json({ imported, errors })
}
