import Image from "next/image"
import Link from "next/link"
import { PlaceholderImage } from "@/components/shared/PlaceholderImage"
import { PriceStamp } from "@/components/restaurant/PriceStamp"
import { VoteButtons } from "@/components/voting/VoteButtons"
import { BookmarkButton } from "@/components/bookmark/BookmarkButton"
import { FlagButton } from "@/components/flag/FlagButton"
import { formatPrice } from "@/lib/utils/price"
import type { Restaurant } from "@/lib/types/database"

type RestaurantDetailProps = {
  restaurant: Restaurant
}

export function RestaurantDetail({ restaurant }: RestaurantDetailProps) {
  return (
    <div className="min-h-dvh bg-white">
      {/* Hero photo */}
      <div className="relative h-[200px] w-full">
        {restaurant.photo_url ? (
          <Image
            src={restaurant.photo_url}
            alt={restaurant.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <PlaceholderImage className="h-full w-full" size="lg" />
        )}
        <div className="absolute inset-x-0 bottom-0 h-[60px] bg-gradient-to-t from-black/30 to-transparent" />
        <Link
          href="/"
          className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-lg text-white transition-colors hover:bg-black/60"
        >
          ←
        </Link>
        <div className="absolute right-3 top-3">
          <BookmarkButton restaurantId={restaurant.id} />
        </div>
      </div>

      <div className="space-y-6 px-5 py-5">
        {/* Name + location */}
        <div>
          <h1 className="text-[22px] font-extrabold text-gray-900">
            {restaurant.name}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {restaurant.cuisine_type} · {restaurant.suburb}
          </p>
          <p className="mt-0.5 text-sm text-gray-400">
            {restaurant.address}
          </p>
        </div>

        {/* Price card */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">CHEAPEST DISH</p>
              <p className="mt-1 text-lg font-bold text-gray-900">
                {restaurant.dish_name}
              </p>
            </div>
            <span className="rounded-full bg-emerald-500 px-4 py-2 text-xl font-extrabold text-white">
              {formatPrice(restaurant.price)}
            </span>
          </div>
          <PriceStamp verifiedAt={restaurant.verified_at} />
        </div>

        {/* Voting */}
        <VoteButtons restaurantId={restaurant.id} initialScore={restaurant.vote_score} />

        {/* Comments placeholder (M3) */}
        <div className="border-t border-gray-100 pt-6 opacity-40">
          <h3 className="mb-2.5 text-sm font-semibold text-gray-900">Comments</h3>
          <div className="rounded-xl bg-gray-50 py-5 text-center text-sm text-gray-400">
            💬 Comments coming soon
          </div>
        </div>

        {/* Flag */}
        <FlagButton restaurantId={restaurant.id} />
      </div>
    </div>
  )
}
