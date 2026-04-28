"use client"

import Image from "next/image"
import Link from "next/link"
import { PlaceholderImage } from "@/components/shared/PlaceholderImage"
import { formatPrice } from "@/lib/utils/price"
import { getVerificationStatus } from "@/lib/utils/price"
import type { Restaurant } from "@/lib/types/database"

type RestaurantPreviewProps = {
  restaurant: Restaurant
  onClose: () => void
}

export function RestaurantPreview({ restaurant, onClose }: RestaurantPreviewProps) {
  const verification = getVerificationStatus(restaurant.verified_at)

  return (
    <>
      {/* Backdrop */}
      <div
        className="absolute inset-0 z-10"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="absolute bottom-0 left-0 right-0 z-20 animate-slide-up rounded-t-[20px] bg-white p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.15)]">
        {/* Drag handle */}
        <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-gray-300" />

        <div className="flex gap-3">
          {/* Photo */}
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

          {/* Info */}
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-bold text-gray-900">
              {restaurant.name}
            </h3>
            <p className="mt-0.5 text-sm text-gray-500">
              {restaurant.cuisine_type} · {restaurant.suburb}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="rounded-xl bg-emerald-500 px-2.5 py-0.5 text-sm font-bold text-white">
                {formatPrice(restaurant.price)}
              </span>
              <span className="truncate text-sm text-gray-500">
                {restaurant.dish_name}
              </span>
            </div>
            <p className="mt-1.5 text-xs text-gray-400">
              {verification.label}
            </p>
          </div>
        </div>

        {/* CTA */}
        <Link
          href={`/restaurant/${restaurant.id}`}
          className="mt-3.5 block rounded-xl bg-gray-900 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-gray-800"
        >
          View Full Details →
        </Link>
      </div>
    </>
  )
}
