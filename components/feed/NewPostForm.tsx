"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AtSign } from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { AuthPrompt } from "@/components/auth/AuthPrompt"
import { PhotoUpload } from "@/components/submit/PhotoUpload"
import { RestaurantPicker } from "@/components/shared/RestaurantPicker"
import type { Restaurant } from "@/lib/types/database"

type NewPostFormProps = {
  restaurants: Restaurant[]
  defaultRestaurantId?: string | null
}

export function NewPostForm({
  restaurants,
  defaultRestaurantId = null,
}: NewPostFormProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [content, setContent] = useState("")
  const [photoUrl, setPhotoUrl] = useState("")
  const [restaurantId, setRestaurantId] = useState<string | null>(
    defaultRestaurantId
  )
  const [showPicker, setShowPicker] = useState(Boolean(defaultRestaurantId))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!user) {
    return <AuthPrompt message="Sign in to share a cheap eat find" />
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          photo_url: photoUrl || null,
          user_email: user!.email,
          restaurant_id: restaurantId,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Failed to post")
        return
      }

      setContent("")
      setPhotoUrl("")
      if (!defaultRestaurantId) setRestaurantId(null)
      setShowPicker(Boolean(defaultRestaurantId))
      router.refresh()
    } catch {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-rule bg-surface p-4"
    >
      <p className="eyebrow mb-2">Share a find</p>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What did you eat, where, and how cheap?"
        required
        rows={3}
        className="w-full resize-none rounded-xl border border-rule bg-paper-dim/40 px-3 py-2.5 text-[14px] text-ink outline-none transition-colors focus:border-ink focus:bg-surface"
      />

      {(showPicker || restaurantId) && (
        <div className="mt-3">
          <p className="eyebrow mb-2">Mention a restaurant</p>
          <RestaurantPicker
            restaurants={restaurants}
            value={restaurantId}
            onChange={setRestaurantId}
            placeholder="Tag a restaurant…"
          />
        </div>
      )}

      <div className="mt-3 flex items-center justify-between gap-2">
        {!showPicker && !restaurantId && !defaultRestaurantId && (
          <button
            type="button"
            onClick={() => setShowPicker(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-rule px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-soft transition-all hover:border-ink hover:text-ink"
          >
            <AtSign size={12} strokeWidth={2} />
            Tag a restaurant
          </button>
        )}
        {(showPicker || restaurantId) && <span />}
      </div>

      <div className="mt-3">
        <PhotoUpload onUpload={setPhotoUrl} />
      </div>
      {error && <p className="mt-2 text-[11px] text-cinnabar-600">{error}</p>}
      <button
        type="submit"
        disabled={loading || !content.trim()}
        className="mt-3 w-full rounded-full bg-brand py-2.5 text-[13px] font-semibold uppercase tracking-[0.06em] text-white transition-all hover:bg-brand-hover disabled:opacity-40"
      >
        {loading ? "Posting…" : "Post to feed"}
      </button>
    </form>
  )
}
