import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { PlaceholderImage } from "@/components/shared/PlaceholderImage"
import { PriceStamp } from "@/components/restaurant/PriceStamp"
import { VoteButtons } from "@/components/voting/VoteButtons"
import { BookmarkButton } from "@/components/bookmark/BookmarkButton"
import { FlagButton } from "@/components/flag/FlagButton"
import { FeaturedBadge } from "@/components/featured/FeaturedBadge"
import { CommentList } from "@/components/comments/CommentList"
import { CommentForm } from "@/components/comments/CommentForm"
import { formatPrice } from "@/lib/utils/price"
import type { Restaurant } from "@/lib/types/database"
import type { Comment } from "@/lib/queries/comments"

type RestaurantDetailProps = {
  restaurant: Restaurant
  comments: Comment[]
}

export function RestaurantDetail({ restaurant, comments }: RestaurantDetailProps) {
  return (
    <div className="min-h-dvh bg-white">
      <div className="relative h-52 w-full">
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
        <Link
          href="/"
          className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="absolute right-3 top-3">
          <BookmarkButton restaurantId={restaurant.id} />
        </div>
      </div>

      <div className="space-y-5 px-5 py-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-gray-900">
              {restaurant.name}
            </h1>
            <FeaturedBadge pinType={restaurant.pin_type} />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {restaurant.cuisine_type} · {restaurant.suburb}
          </p>
          <p className="mt-0.5 text-sm text-gray-400">
            {restaurant.address}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-green-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600/70">Cheapest Dish</p>
              <p className="mt-1 text-lg font-bold text-gray-900">
                {restaurant.dish_name}
              </p>
            </div>
            <span className="rounded-2xl bg-emerald-500 px-4 py-2 text-xl font-extrabold text-white shadow-sm">
              {formatPrice(restaurant.price)}
            </span>
          </div>
          <PriceStamp verifiedAt={restaurant.verified_at} />
        </div>

        <VoteButtons restaurantId={restaurant.id} initialScore={restaurant.vote_score} />

        <div className="border-t border-gray-100 pt-5">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">
            Comments ({comments.length})
          </h3>
          <CommentList comments={comments} />
          <div className="mt-3">
            <CommentForm restaurantId={restaurant.id} />
          </div>
        </div>

        <FlagButton restaurantId={restaurant.id} />
      </div>
    </div>
  )
}
