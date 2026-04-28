"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PhotoUpload } from "@/components/submit/PhotoUpload"

const CUISINE_TYPES = [
  "Vietnamese", "Thai", "Japanese", "Chinese", "Korean", "Indian",
  "Mexican", "Italian", "Greek", "Middle Eastern", "Malaysian",
  "Taiwanese", "Australian", "Vegetarian", "Asian Fusion", "Other",
] as const

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
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">Restaurant name *</label>
        <input id="name" name="name" required className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" placeholder="e.g. Pho Viet Express" />
      </div>
      <div>
        <label htmlFor="dish_name" className="block text-sm font-medium text-gray-700 mb-1.5">Dish name *</label>
        <input id="dish_name" name="dish_name" required className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" placeholder="e.g. Beef Pho" />
      </div>
      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1.5">Price (AUD) *</label>
        <input id="price" name="price" type="number" step="0.01" min="0.01" max="15" required className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" placeholder="e.g. 4.90" />
      </div>
      <div>
        <label htmlFor="cuisine_type" className="block text-sm font-medium text-gray-700 mb-1.5">Cuisine type *</label>
        <select id="cuisine_type" name="cuisine_type" required className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
          <option value="">Select cuisine...</option>
          {CUISINE_TYPES.map((type) => (<option key={type} value={type}>{type}</option>))}
        </select>
      </div>
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1.5">Street address *</label>
        <input id="address" name="address" required className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" placeholder="e.g. 123 Mains Road" />
      </div>
      <div>
        <label htmlFor="suburb" className="block text-sm font-medium text-gray-700 mb-1.5">Suburb *</label>
        <input id="suburb" name="suburb" required className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" placeholder="e.g. Sunnybank" />
      </div>
      <PhotoUpload onUpload={setPhotoUrl} />
      {error && (<div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>)}
      <button type="submit" disabled={loading} className="w-full rounded-2xl bg-emerald-500 py-4 text-base font-bold text-white transition-colors hover:bg-emerald-600 disabled:opacity-50">
        {loading ? "Submitting..." : "Submit Restaurant"}
      </button>
    </form>
  )
}
