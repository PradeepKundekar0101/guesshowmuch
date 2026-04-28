"use client"

import { useState, useEffect } from "react"
import { getVote, setVote } from "@/lib/utils/local-storage"

type VoteButtonsProps = {
  restaurantId: string
  initialScore: number
}

export function VoteButtons({ restaurantId, initialScore }: VoteButtonsProps) {
  const [score, setScore] = useState(initialScore)
  const [currentVote, setCurrentVote] = useState<"up" | "down" | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setCurrentVote(getVote(restaurantId))
  }, [restaurantId])

  async function handleVote(direction: "up" | "down") {
    if (loading) return
    if (currentVote === direction) return

    setLoading(true)
    try {
      const res = await fetch(`/api/restaurants/${restaurantId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction, previousDirection: currentVote }),
      })
      if (res.ok) {
        const data = await res.json()
        setScore(data.vote_score)
        setVote(restaurantId, direction)
        setCurrentVote(direction)
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border-t border-gray-100 pt-6">
      <h3 className="mb-2.5 text-sm font-semibold text-gray-900">
        Is this price still accurate?
      </h3>
      <div className="flex items-center gap-3">
        <button
          onClick={() => handleVote("up")}
          disabled={loading}
          className={`flex flex-1 flex-col items-center rounded-xl py-3 transition-colors ${
            currentVote === "up"
              ? "bg-emerald-100 ring-2 ring-emerald-500"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          <span className="text-2xl">👍</span>
          <span className="mt-1 text-xs text-gray-500">Still accurate</span>
        </button>

        <div className="flex flex-col items-center">
          <span className={`text-lg font-bold ${score >= 0 ? "text-emerald-600" : "text-red-500"}`}>
            {score >= 0 ? `+${score}` : score}
          </span>
          <span className="text-[10px] text-gray-400">votes</span>
        </div>

        <button
          onClick={() => handleVote("down")}
          disabled={loading}
          className={`flex flex-1 flex-col items-center rounded-xl py-3 transition-colors ${
            currentVote === "down"
              ? "bg-red-100 ring-2 ring-red-400"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          <span className="text-2xl">👎</span>
          <span className="mt-1 text-xs text-gray-500">Price changed</span>
        </button>
      </div>
    </div>
  )
}
