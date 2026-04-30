"use client"

import { useState } from "react"
import { ThumbsDown, ThumbsUp } from "lucide-react"
import { getDealVote, setDealVote } from "@/lib/utils/local-storage"

type DealVoteBarProps = {
  dealId: string
  initialScore: number
  initialUpCount: number
  initialDownCount: number
}

export function DealVoteBar({
  dealId,
  initialScore,
  initialUpCount,
  initialDownCount,
}: DealVoteBarProps) {
  const [score, setScore] = useState(initialScore)
  const [up, setUp] = useState(initialUpCount)
  const [down, setDown] = useState(initialDownCount)
  const [voting, setVoting] = useState(false)
  const [currentVote, setCurrentVote] = useState<"up" | "down" | null>(() =>
    typeof window === "undefined" ? null : getDealVote(dealId)
  )

  const total = up + down
  const upPct = total === 0 ? 0 : Math.round((up / total) * 100)
  const downPct = total === 0 ? 0 : 100 - upPct

  // Always render both halves with a sensible minimum so the bar reads as community.
  const safeUp = total === 0 ? 50 : up === 0 ? 0 : Math.max(upPct, down === 0 ? 100 : 8)
  const safeDown = total === 0 ? 50 : 100 - safeUp

  async function vote(direction: "up" | "down", e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (voting || currentVote === direction) return
    setVoting(true)
    try {
      const res = await fetch(`/api/deals/${dealId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction, previousDirection: currentVote }),
      })
      if (res.ok) {
        const data = await res.json()
        setScore(data.vote_score)
        if (typeof data.up_count === "number") setUp(data.up_count)
        if (typeof data.down_count === "number") setDown(data.down_count)
        setDealVote(dealId, direction)
        setCurrentVote(direction)
      }
    } catch {
      // silently fail
    } finally {
      setVoting(false)
    }
  }

  return (
    <div className="flex h-7 w-full overflow-hidden rounded-full bg-paper-dim ring-1 ring-rule">
      <button
        type="button"
        onClick={(e) => vote("up", e)}
        disabled={voting}
        aria-label={`Vote good deal — ${upPct}% of ${total} approve`}
        className={`group relative flex items-center justify-start gap-1 overflow-hidden pl-3 text-[11px] font-bold tracking-tight text-white transition-[width] duration-500 ${
          currentVote === "up" ? "ring-2 ring-emerald-300/60 ring-inset" : ""
        }`}
        style={{
          width: `${safeUp}%`,
          background:
            total === 0 ? "var(--color-emerald-300)" : "var(--color-emerald-500)",
        }}
      >
        <ThumbsUp
          size={11}
          strokeWidth={2.5}
          fill={currentVote === "up" ? "currentColor" : "none"}
        />
        {(safeUp >= 22 || total === 0) && (
          <span>
            {total === 0 ? "Hot?" : `${upPct}%`}
            {total > 0 ? ` (${up})` : ""}
          </span>
        )}
      </button>

      <button
        type="button"
        onClick={(e) => vote("down", e)}
        disabled={voting}
        aria-label={`Vote not a deal — ${downPct}% of ${total} disagree`}
        className={`group relative flex items-center justify-end gap-1 overflow-hidden pr-3 text-[11px] font-bold tracking-tight text-white transition-[width] duration-500 ${
          currentVote === "down" ? "ring-2 ring-cinnabar-300/60 ring-inset" : ""
        }`}
        style={{
          width: `${safeDown}%`,
          background:
            total === 0 ? "var(--color-cinnabar-300)" : "var(--color-cinnabar-400)",
        }}
      >
        {(safeDown >= 22 || total === 0) && (
          <span>
            {total === 0 ? "Meh?" : `${downPct}%`}
            {total > 0 ? ` (${down})` : ""}
          </span>
        )}
        <ThumbsDown
          size={11}
          strokeWidth={2.5}
          fill={currentVote === "down" ? "currentColor" : "none"}
        />
      </button>
      <span className="sr-only">Net score {score}</span>
    </div>
  )
}
