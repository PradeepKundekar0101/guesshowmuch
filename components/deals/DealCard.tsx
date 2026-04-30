import Image from "next/image"
import Link from "next/link"
import { ChevronRight, MessageCircle } from "lucide-react"
import { CountdownTimer } from "@/components/deals/CountdownTimer"
import { DealVoteBar } from "@/components/deals/DealVoteBar"
import { PlaceholderImage } from "@/components/shared/PlaceholderImage"
import { formatPrice } from "@/lib/utils/price"
import type { Deal } from "@/lib/queries/deals"

type DealCardProps = {
  deal: Deal
}

export function DealCard({ deal }: DealCardProps) {
  const restaurant = deal.restaurant
  const original = deal.original_price ?? restaurant?.price ?? null
  const discount =
    original && original > deal.deal_price
      ? Math.round(((original - deal.deal_price) / original) * 100)
      : null

  const heroPhoto = deal.photo_url || restaurant?.photo_url || null
  const href = restaurant ? `/restaurant/${restaurant.id}` : null
  const totalVotes = (deal.up_count ?? 0) + (deal.down_count ?? 0)

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-rule bg-surface transition-all hover:border-brand/35 hover:shadow-[0_10px_32px_rgba(255,80,0,0.10)]">
      <div className="flex">
        {/* Photo */}
        <div className="relative h-auto w-28 shrink-0 overflow-hidden bg-paper-dim">
          {heroPhoto ? (
            <Image
              src={heroPhoto}
              alt={restaurant?.name ?? deal.title}
              fill
              sizes="112px"
              className="object-cover"
            />
          ) : (
            <PlaceholderImage className="h-full w-full" size="md" />
          )}
          {discount && (
            <span className="price-num absolute left-2 top-2 rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold tracking-tight text-white shadow-sm">
              −{discount}%
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col p-3.5 pl-4 pb-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-brand">
                  {restaurant?.cuisine_type ?? "Live deal"}
                </span>
                {restaurant?.suburb && (
                  <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                    {restaurant.suburb}
                  </span>
                )}
              </div>

              {href ? (
                <Link
                  href={href}
                  className="mt-1 block truncate font-display text-[19px] leading-tight tracking-tight text-ink hover:text-brand"
                >
                  {restaurant?.name ?? deal.title}
                </Link>
              ) : (
                <h3 className="mt-1 truncate font-display text-[19px] leading-tight tracking-tight text-ink">
                  {deal.title}
                </h3>
              )}

              {restaurant && (
                <p className="mt-0.5 truncate text-[12px] text-ink-soft">
                  {deal.title}
                </p>
              )}
            </div>
            <CountdownTimer expiresAt={deal.expires_at} />
          </div>

          {deal.description && (
            <p className="mt-1.5 line-clamp-2 text-[12px] leading-snug text-ink-muted">
              {deal.description}
            </p>
          )}

          <div className="mt-2 flex items-end justify-between gap-3">
            <div className="flex items-baseline gap-2">
              <span className="price-num text-[22px] font-bold leading-none text-brand">
                {formatPrice(deal.deal_price)}
              </span>
              {original && original > deal.deal_price && (
                <span className="price-num text-[12px] text-ink-muted line-through">
                  {formatPrice(original)}
                </span>
              )}
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-muted">
              <MessageCircle size={11} strokeWidth={2} />
              {totalVotes}
              {href && (
                <ChevronRight
                  size={12}
                  strokeWidth={2}
                  className="ml-0.5 text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:text-brand"
                />
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Community vote ratio bar — full width along the bottom */}
      <div className="border-t border-rule px-3.5 py-2.5">
        <DealVoteBar
          dealId={deal.id}
          initialScore={deal.vote_score ?? 0}
          initialUpCount={deal.up_count ?? 0}
          initialDownCount={deal.down_count ?? 0}
        />
      </div>
    </article>
  )
}
