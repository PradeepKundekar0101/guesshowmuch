"use client"

import { useAuth } from "@/components/auth/AuthProvider"
import { anonymizeEmail } from "@/lib/utils/auth"

export function UserBadge() {
  const { user, loading, signOut } = useAuth()

  if (loading || !user) return null

  return (
    <div className="flex shrink-0 flex-col items-end leading-tight">
      <span className="text-[12px] font-medium text-ink">
        {anonymizeEmail(user.email ?? "")}
      </span>
      <button
        onClick={signOut}
        className="text-[10px] uppercase tracking-[0.08em] text-ink-muted transition-colors hover:text-ink"
      >
        Sign out
      </button>
    </div>
  )
}
