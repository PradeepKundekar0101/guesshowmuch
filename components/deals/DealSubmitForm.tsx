"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PhotoUpload } from "@/components/submit/PhotoUpload"

export function DealSubmitForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [photoUrl, setPhotoUrl] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const form = new FormData(e.currentTarget)

    try {
      const res = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.get("title"),
          description: form.get("description") || null,
          deal_price: form.get("deal_price"),
          original_price: form.get("original_price") || null,
          expires_at: form.get("expires_at"),
          photo_url: photoUrl || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Failed to submit deal")
        return
      }

      router.push("/deals")
    } catch {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1.5">Deal title *</label>
        <input id="title" name="title" required className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" placeholder="e.g. Half price pho today only!" />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
        <textarea id="description" name="description" rows={2} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" placeholder="Optional details..." />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="deal_price" className="block text-sm font-medium text-gray-700 mb-1.5">Deal price (AUD) *</label>
          <input id="deal_price" name="deal_price" type="number" step="0.01" min="0.01" max="15" required className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" placeholder="4.90" />
        </div>
        <div>
          <label htmlFor="original_price" className="block text-sm font-medium text-gray-700 mb-1.5">Original price</label>
          <input id="original_price" name="original_price" type="number" step="0.01" min="0.01" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" placeholder="9.90" />
        </div>
      </div>
      <div>
        <label htmlFor="expires_at" className="block text-sm font-medium text-gray-700 mb-1.5">Expires at *</label>
        <input id="expires_at" name="expires_at" type="datetime-local" required className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
      </div>
      <PhotoUpload onUpload={setPhotoUrl} />
      {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
      <button type="submit" disabled={loading} className="w-full rounded-2xl bg-orange-500 py-4 text-base font-bold text-white transition-colors hover:bg-orange-600 disabled:opacity-50">
        {loading ? "Submitting..." : "Submit Deal"}
      </button>
    </form>
  )
}
