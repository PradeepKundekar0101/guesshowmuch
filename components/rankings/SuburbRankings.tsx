import Link from "next/link"
import { Trophy } from "lucide-react"
import { formatPrice } from "@/lib/utils/price"
import type { SuburbRanking } from "@/lib/queries/rankings"

type SuburbRankingsProps = {
  rankings: SuburbRanking[]
}

export function SuburbRankings({ rankings }: SuburbRankingsProps) {
  if (rankings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-rule bg-paper-dim">
          <Trophy size={20} strokeWidth={1.5} className="text-gold-500" />
        </div>
        <p className="mt-5 font-display text-2xl tracking-tight text-ink">
          The tally is empty
        </p>
        <p className="mt-2 max-w-[260px] text-[13px] leading-relaxed text-ink-soft">
          Vote on a few price stamps and the suburbs will start ranking
          themselves here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {rankings.map((ranking, index) => (
        <article
          key={ranking.suburb}
          className="overflow-hidden rounded-2xl border border-rule bg-surface"
        >
          <header className="flex items-center gap-4 border-b border-rule bg-paper-dim/60 px-4 py-3.5">
            <span className="price-num flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-[13px] font-semibold text-white">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-[20px] leading-tight tracking-tight text-ink">
                {ranking.suburb}
              </h3>
              <p className="mt-0.5 text-[11px] uppercase tracking-[0.1em] text-ink-muted">
                {ranking.restaurantCount} {ranking.restaurantCount === 1 ? "spot" : "spots"}
                <span className="mx-1.5 text-ink-faint">·</span>
                <span className="price-num normal-case tracking-tight text-ink-soft">
                  {ranking.totalScore >= 0 ? `+${ranking.totalScore}` : ranking.totalScore}
                </span>
              </p>
            </div>
          </header>
          <div className="divide-y divide-rule">
            {ranking.topRestaurants.map((restaurant) => (
              <Link
                key={restaurant.id}
                href={`/restaurant/${restaurant.id}`}
                className="group flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-paper-dim/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium text-ink">
                    {restaurant.name}
                  </p>
                  <p className="mt-0.5 truncate text-[12px] text-ink-soft">
                    {restaurant.dish_name}
                  </p>
                </div>
                <span className="price-num shrink-0 text-[15px] font-semibold text-ink">
                  {formatPrice(restaurant.price)}
                </span>
              </Link>
            ))}
          </div>
        </article>
      ))}
    </div>
  )
}
