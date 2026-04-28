import { Flame } from "lucide-react"
import { DealCard } from "@/components/deals/DealCard"
import type { Deal } from "@/lib/queries/deals"

type DealsListProps = {
  deals: Deal[]
}

export function DealsList({ deals }: DealsListProps) {
  if (deals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-rule bg-paper-dim">
          <Flame size={22} strokeWidth={1.5} className="text-cinnabar-500" />
        </div>
        <p className="mt-5 font-display text-2xl tracking-tight text-ink">
          No live deals
        </p>
        <p className="mt-2 max-w-[260px] text-[13px] leading-relaxed text-ink-soft">
          The grill is off for the moment. Check back later — or post the first
          one yourself.
        </p>
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
