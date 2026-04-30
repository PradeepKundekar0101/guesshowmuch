"use client"

import { useMemo } from "react"

type CuisineFilterProps = {
  /** Full restaurant list (we derive cuisines + counts from this) */
  cuisines: { name: string; count: number }[]
  value: string | null
  onChange: (cuisine: string | null) => void
}

/** Compact accent dot per cuisine family — mirrors the pin accent. */
const CUISINE_DOT: Record<string, string> = {
  Vietnamese: "#0ea5e9",
  Thai: "#0ea5e9",
  Japanese: "#06b6d4",
  Chinese: "#ef4444",
  Korean: "#dc2626",
  Malaysian: "#f59e0b",
  Taiwanese: "#0ea5e9",
  "Asian Fusion": "#0ea5e9",
  Indian: "#f97316",
  "Middle Eastern": "#f59e0b",
  Mexican: "#ef4444",
  Italian: "#16a34a",
  Greek: "#3b82f6",
  Australian: "#a78bfa",
  Vegetarian: "#22c55e",
  Other: "#a78bfa",
}

export function buildCuisineCounts(
  restaurants: { cuisine_type: string | null }[]
) {
  const counts = new Map<string, number>()
  for (const r of restaurants) {
    if (!r.cuisine_type) continue
    counts.set(r.cuisine_type, (counts.get(r.cuisine_type) ?? 0) + 1)
  }
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}

export function CuisineFilter({
  cuisines,
  value,
  onChange,
}: CuisineFilterProps) {
  const total = useMemo(
    () => cuisines.reduce((sum, c) => sum + c.count, 0),
    [cuisines]
  )

  return (
    <div className="absolute bottom-[152px] left-0 right-0 z-10 px-3">
      <div
        className="flex gap-1.5 overflow-x-auto pb-1"
        style={{ scrollbarWidth: "none" }}
      >
        <style>{`
          .cuisine-scroll::-webkit-scrollbar { display: none; }
        `}</style>
        <button
          onClick={() => onChange(null)}
          className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-semibold tracking-tight transition-all ${
            value === null
              ? "border-brand bg-brand text-white"
              : "glass border-transparent text-ink-soft hover:text-ink"
          }`}
        >
          All
          <span
            className={`price-num ml-1.5 ${
              value === null ? "text-white/80" : "text-ink-muted"
            }`}
          >
            {total}
          </span>
        </button>
        {cuisines.map((c) => {
          const isActive = value === c.name
          const dot = CUISINE_DOT[c.name] ?? "#9ca3af"
          return (
            <button
              key={c.name}
              onClick={() => onChange(isActive ? null : c.name)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold tracking-tight transition-all ${
                isActive
                  ? "border-brand bg-brand text-white"
                  : "glass border-transparent text-ink-soft hover:text-ink"
              }`}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: dot }}
              />
              {c.name}
              <span
                className={`price-num ${
                  isActive ? "text-white/80" : "text-ink-muted"
                }`}
              >
                {c.count}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
