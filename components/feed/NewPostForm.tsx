"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"
import { AuthPrompt } from "@/components/auth/AuthPrompt"
import { PhotoUpload } from "@/components/submit/PhotoUpload"

export function NewPostForm() {
  const { user } = useAuth()
  const router = useRouter()
  const [content, setContent] = useState("")
  const [photoUrl, setPhotoUrl] = useState("")
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
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Failed to post")
        return
      }

      setContent("")
      setPhotoUrl("")
      router.refresh()
    } catch {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share a cheap eat find..."
        required
        rows={3}
        className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
      />
      <div className="mt-3">
        <PhotoUpload onUpload={setPhotoUrl} />
      </div>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={loading || !content.trim()}
        className="mt-3 w-full rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 disabled:opacity-50"
      >
        {loading ? "Posting..." : "Post"}
      </button>
    </form>
  )
}
