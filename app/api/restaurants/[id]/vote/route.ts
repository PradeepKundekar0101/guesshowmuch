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
    return NextResponse.json(
      { error: "Direction must be 'up' or 'down'" },
      { status: 400 }
    )
  }

  let scoreDelta = direction === "up" ? 1 : -1
  let upDelta = direction === "up" ? 1 : 0
  let downDelta = direction === "down" ? 1 : 0

  if (previousDirection === "up") {
    scoreDelta -= 1
    upDelta -= 1
  } else if (previousDirection === "down") {
    scoreDelta += 1
    downDelta -= 1
  }

  const supabase = createServerClient()
  const { data: restaurant, error: fetchError } = await supabase
    .from("restaurants")
    .select("vote_score, up_count, down_count")
    .eq("id", id)
    .single()

  if (fetchError || !restaurant) {
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
  }

  const newScore = restaurant.vote_score + scoreDelta
  const newUp = Math.max((restaurant.up_count ?? 0) + upDelta, 0)
  const newDown = Math.max((restaurant.down_count ?? 0) + downDelta, 0)

  const { error: updateError } = await supabase
    .from("restaurants")
    .update({
      vote_score: newScore,
      up_count: newUp,
      down_count: newDown,
    })
    .eq("id", id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({
    vote_score: newScore,
    up_count: newUp,
    down_count: newDown,
  })
}
