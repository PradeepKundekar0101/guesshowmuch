"use client"

import { useState, useEffect } from "react"
import { ThumbsUp, ThumbsDown } from "lucide-react"
import { getVote, setVote } from "@/lib/utils/local-storage"
import { VoteRatioBar } from "@/components/voting/VoteRatioBar"

type VoteButtonsProps = {
  restaurantId: string
  initialScore: number
  initialUpCount?: number
  initialDownCount?: number
}

export function VoteButtons({
  restaurantId,
  initialScore,
  initialUpCount = 0,
  initialDownCount = 0,
}: VoteButtonsProps) {
  const [score, setScore] = useState(initialScore)
  const [upCount, setUpCount] = useState(initialUpCount)
  const [downCount, setDownCount] = useState(initialDownCount)
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
        if (typeof data.up_count === "number") setUpCount(data.up_count)
        if (typeof data.down_count === "number") setDownCount(data.down_count)
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
    <div className="border-t border-rule pt-6">
      <div className="flex items-baseline justify-between">
        <p className="eyebrow">Verify the price</p>
        <span
          className={`price-num text-[15px] font-semibold ${
            score >= 0 ? "text-emerald-600" : "text-cinnabar-500"
          }`}
        >
          {score >= 0 ? `+${score}` : score}
        </span>
      </div>
      <p className="mt-1.5 text-[14px] text-ink-soft">
        Was the price accurate when you last visited?
      </p>

      <div className="mt-4">
        <VoteRatioBar upCount={upCount} downCount={downCount} />
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={() => handleVote("up")}
          disabled={loading}
          className={`flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-[13px] font-semibold transition-all active:scale-[0.98] ${
            currentVote === "up"
              ? "bg-emerald-500 text-paper"
              : "bg-paper-dim text-ink-soft hover:bg-rule"
          }`}
        >
          <ThumbsUp
            size={14}
            strokeWidth={2}
            fill={currentVote === "up" ? "currentColor" : "none"}
          />
          Still accurate
        </button>

        <button
          onClick={() => handleVote("down")}
          disabled={loading}
          className={`flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-[13px] font-semibold transition-all active:scale-[0.98] ${
            currentVote === "down"
              ? "bg-cinnabar-500 text-paper"
              : "bg-paper-dim text-ink-soft hover:bg-rule"
          }`}
        >
          <ThumbsDown
            size={14}
            strokeWidth={2}
            fill={currentVote === "down" ? "currentColor" : "none"}
          />
          Price changed
        </button>
      </div>
    </div>
  )
}
