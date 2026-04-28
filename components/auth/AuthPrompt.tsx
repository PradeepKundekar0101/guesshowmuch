"use client"

import { useState } from "react"
import { Mail } from "lucide-react"
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
      <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-3.5">
        <Mail size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-emerald-600" />
        <div>
          <p className="text-[13px] font-semibold text-emerald-700">
            Magic link sent
          </p>
          <p className="mt-0.5 text-[12px] leading-relaxed text-emerald-700/80">
            Check your inbox and tap the link to sign in.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-rule bg-paper-dim/40 p-4">
      <p className="mb-3 text-[13px] text-ink-soft">{message}</p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          required
          className="flex-1 rounded-full border border-rule bg-surface px-4 py-2.5 text-[13px] text-ink outline-none transition-colors focus:border-ink"
        />
        <button
          type="submit"
          disabled={loading}
          className="shrink-0 rounded-full bg-ink px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.06em] text-paper transition-all hover:bg-ink/90 disabled:opacity-40"
        >
          {loading ? "…" : "Send"}
        </button>
      </form>
      {error && <p className="mt-2 text-[11px] text-cinnabar-600">{error}</p>}
    </div>
  )
}
