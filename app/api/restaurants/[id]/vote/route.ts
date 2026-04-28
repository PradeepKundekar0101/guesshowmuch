import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { direction, previousDirection } = body

  if (direction !== "up" && direction !== "down") {
    return NextResponse.json({ error: "Direction must be 'up' or 'down'" }, { status: 400 })
  }

  let delta = direction === "up" ? 1 : -1
  if (previousDirection === "up") delta -= 1
  else if (previousDirection === "down") delta += 1

  const supabase = createServerClient()
  const { data: restaurant, error: fetchError } = await supabase
    .from("restaurants").select("vote_score").eq("id", id).single()

  if (fetchError || !restaurant) {
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
  }

  const newScore = restaurant.vote_score + delta
  const { error: updateError } = await supabase
    .from("restaurants").update({ vote_score: newScore }).eq("id", id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }
  return NextResponse.json({ vote_score: newScore })
}
