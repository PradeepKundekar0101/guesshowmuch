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
    return <AuthPrompt message="Sign in to comment" />
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
        placeholder="Add a comment..."
        required
        className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
      />
      <button
        type="submit"
        disabled={loading || !content.trim()}
        className="shrink-0 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        Post
      </button>
    </form>
  )
}
