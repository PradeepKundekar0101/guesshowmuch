import { ThumbsUp, ThumbsDown } from "lucide-react"

type VoteRatioBarProps = {
  upCount: number
  downCount: number
}

export function VoteRatioBar({ upCount, downCount }: VoteRatioBarProps) {
  const total = upCount + downCount

  if (total === 0) {
    return (
      <div className="rounded-full border border-dashed border-rule px-3.5 py-2 text-center text-[12px] italic text-ink-muted">
        No votes yet — be the first.
      </div>
    )
  }

  const upPct = Math.round((upCount / total) * 100)
  const downPct = 100 - upPct

  // Edge case: only ever show 0/100 if a side is genuinely zero
  const safeUpPct = upCount === 0 ? 0 : Math.max(upPct, downCount === 0 ? 100 : 6)
  const safeDownPct = 100 - safeUpPct

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.08em]">
        <span className="inline-flex items-center gap-1.5 text-emerald-600">
          <ThumbsUp size={11} strokeWidth={2.25} fill="currentColor" />
          Accurate · {upPct}%
        </span>
        <span className="price-num text-ink-muted">{total} votes</span>
        <span className="inline-flex items-center gap-1.5 text-cinnabar-500">
          Off · {downPct}%
          <ThumbsDown size={11} strokeWidth={2.25} fill="currentColor" />
        </span>
      </div>

      <div
        className="relative flex h-7 w-full overflow-hidden rounded-full bg-paper-dim ring-1 ring-rule"
        role="img"
        aria-label={`${upPct}% accurate, ${downPct}% off`}
      >
        {safeUpPct > 0 && (
          <div
            className="flex items-center justify-start bg-emerald-500 pl-3 text-[11px] font-semibold tracking-tight text-paper transition-[width] duration-500"
            style={{ width: `${safeUpPct}%` }}
          >
            {safeUpPct >= 18 && <span>{upPct}%</span>}
          </div>
        )}
        {safeDownPct > 0 && (
          <div
            className="flex items-center justify-end bg-cinnabar-400 pr-3 text-[11px] font-semibold tracking-tight text-paper transition-[width] duration-500"
            style={{ width: `${safeDownPct}%` }}
          >
            {safeDownPct >= 18 && <span>{downPct}%</span>}
          </div>
        )}
      </div>
    </div>
  )
}
