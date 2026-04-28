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
    <div className="border-t border-gray-100 pt-6 text-center">
      <button
        onClick={handleFlag}
        disabled={flagged || loading}
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all ${
          flagged
            ? "border-gray-200 bg-gray-50 text-gray-400"
            : "border-gray-200 text-gray-500 hover:border-red-200 hover:bg-red-50 hover:text-red-500"
        }`}
      >
        {flagged ? <Check size={14} /> : <Flag size={14} />}
        {flagged ? "Flagged" : "Report outdated info"}
      </button>
      {flagged && (
        <p className="mt-1.5 text-[11px] text-gray-400">Thanks for reporting</p>
      )}
    </div>
  )
}
