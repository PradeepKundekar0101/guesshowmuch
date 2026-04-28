import { Flame } from "lucide-react"
import { CountdownTimer } from "@/components/deals/CountdownTimer"
import { formatPrice } from "@/lib/utils/price"
import type { Deal } from "@/lib/queries/deals"

type RestaurantDealsProps = {
  deals: Deal[]
}

export function RestaurantDeals({ deals }: RestaurantDealsProps) {
  if (deals.length === 0) return null

  return (
    <section className="border-t border-rule pt-6">
      <div className="flex items-baseline justify-between">
        <h3 className="eyebrow inline-flex items-center gap-1.5 text-cinnabar-500">
          <Flame size={11} strokeWidth={2.25} />
          Live deals
        </h3>
        <span className="price-num text-[12px] text-ink-muted">
          {String(deals.length).padStart(2, "0")}
        </span>
      </div>

      <div className="mt-3 space-y-2.5">
        {deals.map((deal) => {
          const original = deal.original_price ?? null
          const discount =
            original && original > deal.deal_price
              ? Math.round(((original - deal.deal_price) / original) * 100)
              : null
          return (
            <div
              key={deal.id}
              className="relative overflow-hidden rounded-xl border border-cinnabar-200/60 bg-cinnabar-50/30 p-3.5"
            >
              <div className="absolute left-0 top-0 h-full w-1 bg-cinnabar-500" />
              <div className="flex items-start justify-between gap-3 pl-1">
                <div className="min-w-0 flex-1">
                  <h4 className="font-display text-[18px] leading-tight tracking-tight text-ink">
                    {deal.title}
                  </h4>
                  {deal.description && (
                    <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-ink-soft">
                      {deal.description}
                    </p>
                  )}
                </div>
                <CountdownTimer expiresAt={deal.expires_at} />
              </div>
              <div className="mt-3 flex items-end justify-between gap-2 pl-1">
                <div className="flex items-baseline gap-2">
                  <span className="price-num text-[20px] font-semibold leading-none text-ink">
                    {formatPrice(deal.deal_price)}
                  </span>
                  {original && original > deal.deal_price && (
                    <span className="price-num text-[12px] text-ink-muted line-through">
                      {formatPrice(original)}
                    </span>
                  )}
                </div>
                {discount && (
                  <span className="rounded-full bg-cinnabar-500 px-2 py-0.5 text-[10px] font-bold tracking-tight text-paper">
                    −{discount}%
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
