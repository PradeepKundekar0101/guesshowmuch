import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = createServerClient()

  const { data: restaurant, error: fetchError } = await supabase
    .from("restaurants").select("flag_count").eq("id", id).single()

  if (fetchError || !restaurant) {
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
  }

  const newCount = restaurant.flag_count + 1
  const { error: updateError } = await supabase
    .from("restaurants").update({ flag_count: newCount }).eq("id", id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }
  return NextResponse.json({ flag_count: newCount })
}
