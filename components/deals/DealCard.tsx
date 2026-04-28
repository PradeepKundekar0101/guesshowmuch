import Image from "next/image"
import Link from "next/link"
import { MapPin, ChevronRight } from "lucide-react"
import { CountdownTimer } from "@/components/deals/CountdownTimer"
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

  // Prefer the deal's own photo, fall back to the restaurant's
  const heroPhoto = deal.photo_url || restaurant?.photo_url || null

  // The whole card links to the restaurant when one exists
  const Wrapper = restaurant
    ? ({ children }: { children: React.ReactNode }) => (
        <Link
          href={`/restaurant/${restaurant.id}`}
          className="group block"
        >
          {children}
        </Link>
      )
    : ({ children }: { children: React.ReactNode }) => <div>{children}</div>

  return (
    <Wrapper>
      <article className="relative flex overflow-hidden rounded-2xl border border-rule bg-surface transition-all group-hover:border-cinnabar-200 group-hover:shadow-[0_8px_30px_rgba(194,65,42,0.08)]">
        {/* Left photo column */}
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
            <span className="price-num absolute left-2 top-2 rounded-full bg-cinnabar-500 px-2 py-0.5 text-[10px] font-bold tracking-tight text-paper shadow-sm">
              −{discount}%
            </span>
          )}
        </div>

        {/* Right content column */}
        <div className="flex min-w-0 flex-1 flex-col p-3.5 pl-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              {restaurant ? (
                <p className="truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-cinnabar-500">
                  {restaurant.cuisine_type}
                  {restaurant.suburb && (
                    <>
                      <span className="mx-1 text-cinnabar-300">·</span>
                      {restaurant.suburb}
                    </>
                  )}
                </p>
              ) : (
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-cinnabar-500">
                  Live deal
                </p>
              )}

              <h3 className="mt-1 truncate font-display text-[20px] leading-tight tracking-tight text-ink">
                {restaurant?.name ?? deal.title}
              </h3>

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

          <div className="mt-auto flex items-end justify-between gap-3 pt-3">
            <div className="flex items-baseline gap-2">
              <span className="price-num text-[24px] font-semibold leading-none text-ink">
                {formatPrice(deal.deal_price)}
              </span>
              {original && original > deal.deal_price && (
                <span className="price-num text-[12px] text-ink-muted line-through">
                  {formatPrice(original)}
                </span>
              )}
            </div>
            {restaurant && (
              <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-muted transition-colors group-hover:text-ink">
                <MapPin size={11} strokeWidth={2} />
                View
                <ChevronRight
                  size={12}
                  strokeWidth={2}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </span>
            )}
          </div>
        </div>
      </article>
    </Wrapper>
  )
}
