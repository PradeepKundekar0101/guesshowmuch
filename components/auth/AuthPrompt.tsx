"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth/AuthProvider"

type AuthPromptProps = {
  message?: string
}

export function AuthPrompt({ message = "Sign in to post" }: AuthPromptProps) {
  const { signInWithEmail } = useAuth()
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)
    setError(null)

    const { error: authError } = await signInWithEmail(email)

    if (authError) {
      setError(authError)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="rounded-xl bg-emerald-50 px-4 py-3 text-center">
        <p className="text-sm font-medium text-emerald-700">Magic link sent!</p>
        <p className="mt-1 text-xs text-emerald-600">Check your email and click the link to sign in.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <p className="mb-3 text-sm text-gray-600">{message}</p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="shrink-0 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 disabled:opacity-50"
        >
          {loading ? "..." : "Send Link"}
        </button>
      </form>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  )
}
