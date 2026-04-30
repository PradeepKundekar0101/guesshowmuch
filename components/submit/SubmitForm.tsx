"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle } from "lucide-react"
import { PhotoUpload } from "@/components/submit/PhotoUpload"

const CUISINE_TYPES = [
  "Vietnamese", "Thai", "Japanese", "Chinese", "Korean", "Indian",
  "Mexican", "Italian", "Greek", "Middle Eastern", "Malaysian",
  "Taiwanese", "Australian", "Vegetarian", "Asian Fusion", "Other",
] as const

const inputBase =
  "w-full rounded-xl border border-rule bg-surface px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-ink"
const labelBase =
  "mb-2 block text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-soft"

export function SubmitForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [photoUrl, setPhotoUrl] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const form = new FormData(e.currentTarget)
    const address = form.get("address") as string
    const suburb = form.get("suburb") as string

    const query = `${address}, ${suburb}, Brisbane, Australia`
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    const geoUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&country=au&limit=1`

    try {
      const geoRes = await fetch(geoUrl)
      const geoData = await geoRes.json()

      if (!geoData.features || geoData.features.length === 0) {
        setError("Could not find that address. Please check and try again.")
        setLoading(false)
        return
      }

      const [lng, lat] = geoData.features[0].center

      const res = await fetch("/api/restaurants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          dish_name: form.get("dish_name"),
          price: form.get("price"),
          cuisine_type: form.get("cuisine_type"),
          address,
          suburb,
          latitude: lat,
          longitude: lng,
          photo_url: photoUrl || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Failed to submit. Please try again.")
        setLoading(false)
        return
      }

      router.push("/")
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-2xl border border-rule bg-paper-dim/40 p-4">
        <p className="text-[12px] leading-relaxed text-ink-soft">
          You&apos;re adding a new spot to the guide. Keep it under
          <span className="price-num font-semibold text-ink"> $15</span> and
          we&apos;ll feature it on the map.
        </p>
      </div>

      <div>
        <label htmlFor="name" className={labelBase}>Restaurant name</label>
        <input id="name" name="name" required className={inputBase} placeholder="e.g. Pho Viet Express" />
      </div>
      <div>
        <label htmlFor="dish_name" className={labelBase}>Dish name</label>
        <input id="dish_name" name="dish_name" required className={inputBase} placeholder="e.g. Beef Pho" />
      </div>
      <div>
        <label htmlFor="price" className={labelBase}>Price (AUD)</label>
        <div className="relative">
          <span className="price-num pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-ink-muted">
            $
          </span>
          <input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0.01"
            max="15"
            required
            className={`${inputBase} price-num pl-7`}
            placeholder="4.90"
          />
        </div>
      </div>
      <div>
        <label htmlFor="cuisine_type" className={labelBase}>Cuisine</label>
        <select id="cuisine_type" name="cuisine_type" required className={inputBase}>
          <option value="">Select cuisine…</option>
          {CUISINE_TYPES.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="address" className={labelBase}>Street address</label>
        <input id="address" name="address" required className={inputBase} placeholder="e.g. 123 Mains Road" />
      </div>
      <div>
        <label htmlFor="suburb" className={labelBase}>Suburb</label>
        <input id="suburb" name="suburb" required className={inputBase} placeholder="e.g. Sunnybank" />
      </div>
      <PhotoUpload onUpload={setPhotoUrl} />
      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-cinnabar-200 bg-cinnabar-50 px-4 py-3 text-sm text-cinnabar-700">
          <AlertCircle size={16} strokeWidth={2} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-brand py-3.5 text-[13px] font-semibold uppercase tracking-[0.08em] text-white transition-all hover:bg-brand-hover disabled:opacity-50"
      >
        {loading ? "Submitting…" : "Submit restaurant"}
      </button>
    </form>
  )
}
