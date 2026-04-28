import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
import { resolve } from "path"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function seed() {
  const csvPath = resolve(__dirname, "sample-data.csv")
  const csv = readFileSync(csvPath, "utf-8")
  const lines = csv.trim().split("\n")
  const headers = lines[0].split(",")

  const restaurants = lines.slice(1).map((line) => {
    const values = line.split(",")
    const row: Record<string, string | number | null> = {}
    headers.forEach((header, i) => {
      const val = values[i]?.trim()
      if (header === "price" || header === "latitude" || header === "longitude") {
        row[header] = parseFloat(val)
      } else {
        row[header] = val || null
      }
    })
    return row
  })

  const { data, error } = await supabase.from("restaurants").insert(restaurants)

  if (error) {
    console.error("Seed failed:", error.message)
    process.exit(1)
  }

  console.log(`Seeded ${restaurants.length} restaurants successfully.`)
}

seed()
