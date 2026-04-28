import { DealCard } from "@/components/deals/DealCard"
import type { Deal } from "@/lib/queries/deals"

type DealsListProps = {
  deals: Deal[]
}

export function DealsList({ deals }: DealsListProps) {
  if (deals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="text-5xl">🔥</span>
        <p className="mt-4 text-gray-500">No active deals right now.</p>
        <p className="mt-1 text-sm text-gray-400">Check back later or add one yourself!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {deals.map((deal) => (
        <DealCard key={deal.id} deal={deal} />
      ))}
    </div>
  )
}
