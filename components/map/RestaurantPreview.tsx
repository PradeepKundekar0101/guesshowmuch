"use client"

import Image from "next/image"
import Link from "next/link"
import { PlaceholderImage } from "@/components/shared/PlaceholderImage"
import { BookmarkButton } from "@/components/bookmark/BookmarkButton"
import { formatPrice } from "@/lib/utils/price"
import { getVerificationStatus } from "@/lib/utils/price"
import { MapPin, ChevronRight, Clock } from "lucide-react"
import type { Restaurant } from "@/lib/types/database"

type RestaurantPreviewProps = {
  restaurant: Restaurant
  onClose: () => void
}

export function RestaurantPreview({ restaurant, onClose }: RestaurantPreviewProps) {
  const verification = getVerificationStatus(restaurant.verified_at)

  return (
    <>
      <div className="absolute inset-0 z-10" onClick={onClose} />

      <div className="absolute bottom-14 left-0 right-0 z-20 animate-slide-up rounded-t-2xl bg-white shadow-[0_-8px_30px_rgba(0,0,0,0.12)]">
        <div className="mx-auto mt-2.5 mb-3 h-1 w-10 rounded-full bg-gray-200" />

        <div className="px-4 pb-4">
          <div className="flex gap-3">
            {restaurant.photo_url ? (
              <Image
                src={restaurant.photo_url}
                alt={restaurant.name}
                width={80}
                height={80}
                className="h-20 w-20 shrink-0 rounded-xl object-cover"
              />
            ) : (
              <PlaceholderImage className="h-20 w-20 shrink-0 rounded-xl" size="sm" />
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate text-[15px] font-bold text-gray-900">
                    {restaurant.name}
                  </h3>
                  <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                    <MapPin size={11} />
                    <span>{restaurant.cuisine_type} · {restaurant.suburb}</span>
                  </div>
                </div>
                <BookmarkButton restaurantId={restaurant.id} size="sm" />
              </div>

              <div className="mt-2.5 flex items-center gap-2">
                <span className="rounded-lg bg-emerald-500 px-2.5 py-1 text-xs font-bold text-white">
                  {formatPrice(restaurant.price)}
                </span>
                <span className="truncate text-xs text-gray-500">
                  {restaurant.dish_name}
                </span>
              </div>

              <div className="mt-1.5 flex items-center gap-1 text-[11px] text-gray-400">
                <Clock size={10} />
                <span>{verification.label}</span>
              </div>
            </div>
          </div>

          <Link
            href={`/restaurant/${restaurant.id}`}
            className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
          >
            View Details
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </>
  )
}
