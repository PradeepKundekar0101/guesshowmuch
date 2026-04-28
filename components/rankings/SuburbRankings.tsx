import Link from "next/link"
import { formatPrice } from "@/lib/utils/price"
import type { SuburbRanking } from "@/lib/queries/rankings"

type SuburbRankingsProps = {
  rankings: SuburbRanking[]
}

export function SuburbRankings({ rankings }: SuburbRankingsProps) {
  if (rankings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="text-5xl">🏆</span>
        <p className="mt-4 text-gray-500">No rankings yet. Be the first to vote!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {rankings.map((ranking, index) => (
        <div key={ranking.suburb} className="rounded-2xl border border-gray-100 bg-white p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
              {index + 1}
            </span>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">{ranking.suburb}</h3>
              <p className="text-xs text-gray-400">
                {ranking.restaurantCount} restaurant{ranking.restaurantCount !== 1 ? "s" : ""} · Score: {ranking.totalScore >= 0 ? `+${ranking.totalScore}` : ranking.totalScore}
              </p>
            </div>
          </div>
          <div className="mt-3 space-y-2">
            {ranking.topRestaurants.map((restaurant) => (
              <Link key={restaurant.id} href={`/restaurant/${restaurant.id}`} className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2 transition-colors hover:bg-gray-100">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-800">{restaurant.name}</p>
                  <p className="text-xs text-gray-400">{restaurant.dish_name}</p>
                </div>
                <span className="ml-2 shrink-0 rounded-lg bg-emerald-500 px-2 py-0.5 text-xs font-bold text-white">
                  {formatPrice(restaurant.price)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
