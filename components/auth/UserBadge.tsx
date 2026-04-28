"use client"

import { useAuth } from "@/components/auth/AuthProvider"
import { anonymizeEmail } from "@/lib/utils/auth"

export function UserBadge() {
  const { user, loading, signOut } = useAuth()

  if (loading || !user) return null

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-gray-500">{anonymizeEmail(user.email ?? "")}</span>
      <button
        onClick={signOut}
        className="text-xs text-gray-400 underline hover:text-gray-600"
      >
        Sign out
      </button>
    </div>
  )
}
