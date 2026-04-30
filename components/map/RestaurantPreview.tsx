"use client"

import Image from "next/image"
import Link from "next/link"
import { PlaceholderImage } from "@/components/shared/PlaceholderImage"
import { BookmarkButton } from "@/components/bookmark/BookmarkButton"
import { formatPrice } from "@/lib/utils/price"
import { getVerificationStatus } from "@/lib/utils/price"
import { ChevronRight, Clock, MapPin } from "lucide-react"
import type { Restaurant } from "@/lib/types/database"

type RestaurantPreviewProps = {
  restaurant: Restaurant
  onClose: () => void
}

export function RestaurantPreview({ restaurant, onClose }: RestaurantPreviewProps) {
  const verification = getVerificationStatus(restaurant.verified_at)

  return (
    <>
      <div
        className="absolute inset-0 z-10 bg-ink/0 transition-colors"
        onClick={onClose}
      />

      <div className="absolute bottom-14 left-0 right-0 z-20 animate-slide-up overflow-hidden rounded-t-[28px] border-t border-x border-rule bg-paper shadow-[0_-12px_40px_rgba(20,20,23,0.14)]">
        <div className="mx-auto mt-2.5 mb-1 h-1 w-10 rounded-full bg-ink-faint" />

        <div className="px-5 pb-5 pt-3">
          <div className="flex gap-4">
            <div className="relative shrink-0">
              {restaurant.photo_url ? (
                <Image
                  src={restaurant.photo_url}
                  alt={restaurant.name}
                  width={84}
                  height={84}
                  className="h-[84px] w-[84px] rounded-2xl object-cover ring-1 ring-rule"
                />
              ) : (
                <PlaceholderImage className="h-[84px] w-[84px] rounded-2xl ring-1 ring-rule" size="sm" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-display text-[22px] leading-[1.05] tracking-tight text-ink">
                    {restaurant.name}
                  </h3>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                    {restaurant.cuisine_type}
                  </p>
                </div>
                <BookmarkButton restaurantId={restaurant.id} size="sm" />
              </div>

              <div className="mt-1.5 flex items-center gap-1 text-[11.5px] text-ink-soft">
                <MapPin size={11} strokeWidth={1.75} className="text-ink-muted" />
                <span>{restaurant.suburb}</span>
                <span className="text-ink-faint">·</span>
                <Clock size={10} strokeWidth={1.75} className="text-ink-muted" />
                <span>{verification.label.replace("Verified ", "")}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-end justify-between border-t border-rule pt-4">
            <div className="min-w-0">
              <p className="eyebrow">Cheapest dish</p>
              <p className="mt-0.5 truncate text-sm font-medium text-ink">
                {restaurant.dish_name}
              </p>
            </div>
            <span className="price-num shrink-0 text-2xl font-semibold leading-none text-ink">
              {formatPrice(restaurant.price)}
            </span>
          </div>

          <Link
            href={`/restaurant/${restaurant.id}`}
            className="mt-4 flex items-center justify-center gap-1.5 rounded-full bg-brand py-3 text-[13px] font-semibold tracking-tight text-white transition-all hover:bg-brand-hover active:scale-[0.99]"
          >
            View full listing
            <ChevronRight size={15} strokeWidth={2} />
          </Link>
        </div>
      </div>
    </>
  )
}
