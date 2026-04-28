"use client"

import { useState, useEffect } from "react"
import { Flag, Check } from "lucide-react"
import { isFlagged, addFlag } from "@/lib/utils/local-storage"

type FlagButtonProps = {
  restaurantId: string
}

export function FlagButton({ restaurantId }: FlagButtonProps) {
  const [flagged, setFlagged] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setFlagged(isFlagged(restaurantId))
  }, [restaurantId])

  async function handleFlag() {
    if (flagged || loading) return
    setLoading(true)
    try {
      const res = await fetch(`/api/restaurants/${restaurantId}/flag`, {
        method: "POST",
      })
      if (res.ok) {
        addFlag(restaurantId)
        setFlagged(true)
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border-t border-rule pt-5 text-center">
      <button
        onClick={handleFlag}
        disabled={flagged || loading}
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[12px] font-medium transition-all ${
          flagged
            ? "border-rule bg-paper-dim text-ink-muted"
            : "border-rule text-ink-soft hover:border-cinnabar-200 hover:bg-cinnabar-50 hover:text-cinnabar-600"
        }`}
      >
        {flagged ? <Check size={13} strokeWidth={2} /> : <Flag size={13} strokeWidth={1.75} />}
        {flagged ? "Reported" : "Report outdated info"}
      </button>
      {flagged && (
        <p className="mt-2 text-[11px] tracking-wide text-ink-muted">
          Thanks — we&apos;ll take a look.
        </p>
      )}
    </div>
  )
}
