import { CountdownTimer } from "@/components/deals/CountdownTimer"
import { formatPrice } from "@/lib/utils/price"
import type { Deal } from "@/lib/queries/deals"

type DealCardProps = {
  deal: Deal
}

export function DealCard({ deal }: DealCardProps) {
  return (
    <div className="rounded-2xl border border-orange-100 bg-white p-4">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-gray-900">{deal.title}</h3>
          {deal.description && (
            <p className="mt-1 text-sm text-gray-500">{deal.description}</p>
          )}
        </div>
        <CountdownTimer expiresAt={deal.expires_at} />
      </div>

      <div className="mt-3 flex items-center gap-2">
        {deal.original_price && (
          <span className="text-sm text-gray-400 line-through">
            {formatPrice(deal.original_price)}
          </span>
        )}
        <span className="rounded-lg bg-orange-500 px-3 py-1 text-sm font-bold text-white">
          {formatPrice(deal.deal_price)}
        </span>
      </div>
    </div>
  )
}
