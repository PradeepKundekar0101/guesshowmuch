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

type CsvRow = {
  name: string
  photo_url: string
}

function parseCsv(): CsvRow[] {
  const csvPath = resolve(__dirname, "sample-data.csv")
  const csv = readFileSync(csvPath, "utf-8")
  const lines = csv.trim().split("\n")
  const headers = lines[0].split(",")
  const nameIdx = headers.indexOf("name")
  const photoIdx = headers.indexOf("photo_url")

  if (nameIdx === -1 || photoIdx === -1) {
    console.error("CSV must contain 'name' and 'photo_url' columns")
    process.exit(1)
  }

  return lines
    .slice(1)
    .map((line) => {
      const cols = line.split(",")
      return {
        name: cols[nameIdx]?.trim() ?? "",
        photo_url: cols[photoIdx]?.trim() ?? "",
      }
    })
    .filter((r) => r.name && r.photo_url)
}

async function run() {
  const rows = parseCsv()
  console.log(`Updating photos for ${rows.length} restaurants…\n`)

  let updated = 0
  let inserted = 0
  let missing = 0

  for (const row of rows) {
    const { data: existing, error: findErr } = await supabase
      .from("restaurants")
      .select("id, name")
      .eq("name", row.name)
      .limit(1)

    if (findErr) {
      console.error(`  ✗ ${row.name}: ${findErr.message}`)
      continue
    }

    if (existing && existing.length > 0) {
      const { error: updateErr } = await supabase
        .from("restaurants")
        .update({ photo_url: row.photo_url })
        .eq("id", existing[0].id)

      if (updateErr) {
        console.error(`  ✗ ${row.name}: ${updateErr.message}`)
      } else {
        console.log(`  • ${row.name}`)
        updated++
      }
    } else {
      missing++
      console.log(`  - ${row.name} (not in DB — skipped)`)
    }
  }

  console.log(`\nDone. Updated ${updated}. Skipped ${missing}. Inserted ${inserted}.`)
}

run().catch((err) => {
  console.error("Failed:", err.message)
  process.exit(1)
})
