import Link from "next/link"
import { getActiveDeals } from "@/lib/queries/deals"
import { DealsList } from "@/components/deals/DealsList"

export default async function DealsPage() {
  const deals = await getActiveDeals()

  return (
    <div className="min-h-dvh bg-gray-50 pb-20">
      <div className="flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4">
        <div>
          <h1 className="text-lg font-bold text-gray-900">🔥 Hot Deals</h1>
          <p className="mt-0.5 text-xs text-gray-400">Time-limited specials</p>
        </div>
        <Link
          href="/deals/submit"
          className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-orange-600"
        >
          + Add Deal
        </Link>
      </div>
      <div className="px-4 py-4">
        <DealsList deals={deals} />
      </div>
    </div>
  )
}
