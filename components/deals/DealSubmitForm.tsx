"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle } from "lucide-react"
import { PhotoUpload } from "@/components/submit/PhotoUpload"
import { RestaurantPicker } from "@/components/shared/RestaurantPicker"
import { formatPrice } from "@/lib/utils/price"
import type { Restaurant } from "@/lib/types/database"

const inputBase =
  "w-full rounded-xl border border-rule bg-surface px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-cinnabar-500"
const labelBase =
  "mb-2 block text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-soft"

type DealSubmitFormProps = {
  restaurants: Restaurant[]
}

export function DealSubmitForm({ restaurants }: DealSubmitFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [photoUrl, setPhotoUrl] = useState("")
  const [restaurantId, setRestaurantId] = useState<string | null>(null)
  const [dealPrice, setDealPrice] = useState("")

  const selectedRestaurant = useMemo(
    () => restaurants.find((r) => r.id === restaurantId) ?? null,
    [restaurants, restaurantId]
  )

  const suggestedOriginal = selectedRestaurant?.price.toFixed(2) ?? ""
  const dealPriceNum = parseFloat(dealPrice)
  const originalPriceNum = selectedRestaurant?.price ?? 0
  const discount =
    selectedRestaurant && dealPriceNum > 0 && dealPriceNum < originalPriceNum
      ? Math.round(((originalPriceNum - dealPriceNum) / originalPriceNum) * 100)
      : null

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!restaurantId) {
      setError("Please pick a restaurant first.")
      setLoading(false)
      return
    }

    const form = new FormData(e.currentTarget)

    try {
      const res = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurant_id: restaurantId,
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
      <div className="rounded-2xl border border-cinnabar-200/70 bg-cinnabar-50/60 p-4">
        <p className="eyebrow text-cinnabar-600">Hot deals run cinnabar</p>
        <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">
          Every deal is anchored to a real restaurant on the map and runs on a
          countdown — make every minute count.
        </p>
      </div>

      <div>
        <label className={labelBase}>Restaurant</label>
        <RestaurantPicker
          restaurants={restaurants}
          value={restaurantId}
          onChange={setRestaurantId}
        />
        {selectedRestaurant && (
          <p className="mt-1.5 text-[11px] text-ink-muted">
            Usual price{" "}
            <span className="price-num font-semibold text-ink-soft">
              {formatPrice(selectedRestaurant.price)}
            </span>{" "}
            for {selectedRestaurant.dish_name}.
          </p>
        )}
      </div>

      <div>
        <label htmlFor="title" className={labelBase}>Deal title</label>
        <input
          id="title"
          name="title"
          required
          className={inputBase}
          placeholder="e.g. Half-price pho — today only"
        />
      </div>

      <div>
        <label htmlFor="description" className={labelBase}>Description</label>
        <textarea
          id="description"
          name="description"
          rows={2}
          className={`${inputBase} resize-none`}
          placeholder="Optional details — what's the catch, who knew, etc."
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="deal_price" className={labelBase}>Deal price</label>
          <input
            id="deal_price"
            name="deal_price"
            type="number"
            step="0.01"
            min="0.01"
            max="15"
            required
            value={dealPrice}
            onChange={(e) => setDealPrice(e.target.value)}
            className={`${inputBase} price-num`}
            placeholder="4.90"
          />
        </div>
        <div>
          <label htmlFor="original_price" className={labelBase}>
            Original price{" "}
            <span className="font-normal normal-case tracking-normal text-ink-muted">
              (defaults to usual)
            </span>
          </label>
          <input
            id="original_price"
            name="original_price"
            type="number"
            step="0.01"
            min="0.01"
            defaultValue={suggestedOriginal}
            key={suggestedOriginal /* refresh defaultValue when restaurant changes */}
            className={`${inputBase} price-num`}
            placeholder={suggestedOriginal || "9.90"}
          />
        </div>
      </div>

      {discount !== null && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3">
          <span className="text-[12px] text-emerald-700">
            That&apos;s a{" "}
            <span className="price-num font-semibold">{discount}%</span> saving on{" "}
            <span className="font-medium">{selectedRestaurant?.name}</span>.
          </span>
          <span className="price-num text-[14px] font-semibold text-emerald-700">
            −{discount}%
          </span>
        </div>
      )}

      <div>
        <label htmlFor="expires_at" className={labelBase}>Expires at</label>
        <input
          id="expires_at"
          name="expires_at"
          type="datetime-local"
          required
          className={inputBase}
        />
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
        disabled={loading || !restaurantId}
        className="w-full rounded-full bg-cinnabar-500 py-3.5 text-[13px] font-semibold uppercase tracking-[0.08em] text-paper transition-all hover:bg-cinnabar-600 disabled:opacity-50"
      >
        {loading ? "Submitting…" : "Post the deal"}
      </button>
    </form>
  )
}
