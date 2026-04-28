import sharp from "sharp"
import { readFileSync, writeFileSync, mkdirSync } from "fs"
import { resolve } from "path"

const ICONS_DIR = resolve(__dirname, "../public/icons")

mkdirSync(ICONS_DIR, { recursive: true })

const baseSvg = readFileSync(resolve(ICONS_DIR, "icon.svg"))
const maskableSvg = readFileSync(resolve(ICONS_DIR, "icon-maskable.svg"))

type IconSpec = {
  source: Buffer
  filename: string
  size: number
  background?: string
}

const specs: IconSpec[] = [
  // Standard PWA icons
  { source: baseSvg, filename: "icon-192.png", size: 192 },
  { source: baseSvg, filename: "icon-512.png", size: 512 },
  // Maskable for Android adaptive icons
  { source: maskableSvg, filename: "icon-maskable-192.png", size: 192 },
  { source: maskableSvg, filename: "icon-maskable-512.png", size: 512 },
  // iOS / Apple touch icon
  { source: baseSvg, filename: "apple-touch-icon.png", size: 180 },
  // Favicons
  { source: baseSvg, filename: "favicon-32.png", size: 32 },
  { source: baseSvg, filename: "favicon-16.png", size: 16 },
]

async function run() {
  console.log(`Generating ${specs.length} icons → ${ICONS_DIR}\n`)
  for (const spec of specs) {
    const out = resolve(ICONS_DIR, spec.filename)
    const buffer = await sharp(spec.source, { density: 384 })
      .resize(spec.size, spec.size, {
        fit: "contain",
        background: spec.background ?? { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png({ compressionLevel: 9 })
      .toBuffer()
    writeFileSync(out, buffer)
    console.log(`  • ${spec.filename}  (${spec.size}×${spec.size})`)
  }
  console.log(`\nDone.`)
}

run().catch((err) => {
  console.error("Failed:", err)
  process.exit(1)
})
