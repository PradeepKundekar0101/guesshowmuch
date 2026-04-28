"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"
import { AuthPrompt } from "@/components/auth/AuthPrompt"

type CommentFormProps = {
  restaurantId: string
}

export function CommentForm({ restaurantId }: CommentFormProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)

  if (!user) {
    return <AuthPrompt message="Sign in to add a comment" />
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return

    setLoading(true)
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurant_id: restaurantId,
          content: content.trim(),
          user_email: user!.email,
        }),
      })

      if (res.ok) {
        setContent("")
        router.refresh()
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add some context…"
        required
        className="flex-1 rounded-full border border-rule bg-surface px-4 py-2.5 text-[13px] text-ink outline-none transition-colors focus:border-ink"
      />
      <button
        type="submit"
        disabled={loading || !content.trim()}
        className="shrink-0 rounded-full bg-ink px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.06em] text-paper transition-all hover:bg-ink/90 disabled:opacity-40"
      >
        Post
      </button>
    </form>
  )
}
