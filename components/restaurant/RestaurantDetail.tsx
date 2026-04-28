import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, MapPin } from "lucide-react"
import { PlaceholderImage } from "@/components/shared/PlaceholderImage"
import { PriceStamp } from "@/components/restaurant/PriceStamp"
import { VoteButtons } from "@/components/voting/VoteButtons"
import { BookmarkButton } from "@/components/bookmark/BookmarkButton"
import { FlagButton } from "@/components/flag/FlagButton"
import { FeaturedBadge } from "@/components/featured/FeaturedBadge"
import { CommentList } from "@/components/comments/CommentList"
import { CommentForm } from "@/components/comments/CommentForm"
import { RestaurantDeals } from "@/components/restaurant/RestaurantDeals"
import { RestaurantPosts } from "@/components/restaurant/RestaurantPosts"
import { formatPrice } from "@/lib/utils/price"
import type { Restaurant } from "@/lib/types/database"
import type { Comment } from "@/lib/queries/comments"
import type { Deal } from "@/lib/queries/deals"
import type { Post } from "@/lib/queries/posts"

type RestaurantDetailProps = {
  restaurant: Restaurant
  comments: Comment[]
  deals: Deal[]
  posts: Post[]
}

export function RestaurantDetail({
  restaurant,
  comments,
  deals,
  posts,
}: RestaurantDetailProps) {
  return (
    <div className="min-h-dvh bg-paper">
      <div className="relative h-64 w-full overflow-hidden bg-paper-dim">
        {restaurant.photo_url ? (
          <Image
            src={restaurant.photo_url}
            alt={restaurant.name}
            fill
            sizes="(max-width: 768px) 100vw, 36rem"
            className="object-cover"
            priority
          />
        ) : (
          <PlaceholderImage className="h-full w-full" size="lg" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-black/30" />
        <Link
          href="/"
          className="absolute left-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/85 text-ink shadow-sm backdrop-blur-md transition-all hover:bg-white"
          aria-label="Back to map"
        >
          <ArrowLeft size={17} strokeWidth={1.75} />
        </Link>
        <div className="absolute right-3 top-3">
          <BookmarkButton restaurantId={restaurant.id} />
        </div>

        <div className="absolute bottom-4 left-5 right-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/85">
            {restaurant.cuisine_type}
          </p>
        </div>
      </div>

      <article className="mx-auto max-w-xl space-y-6 px-5 pb-12 pt-6">
        <header className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <FeaturedBadge pinType={restaurant.pin_type} />
          </div>
          <h1 className="font-display text-[40px] leading-[0.95] tracking-tight text-ink">
            {restaurant.name}
          </h1>
          <div className="flex items-start gap-1.5 text-[13px] text-ink-soft">
            <MapPin size={13} strokeWidth={1.75} className="mt-0.5 shrink-0 text-ink-muted" />
            <p className="leading-relaxed">
              {restaurant.address}
              <span className="text-ink-muted"> · {restaurant.suburb}</span>
            </p>
          </div>
        </header>

        <section className="overflow-hidden rounded-2xl border border-rule bg-surface">
          <div className="flex items-end justify-between gap-4 border-b border-dashed border-rule px-5 pb-4 pt-5">
            <div className="min-w-0">
              <p className="eyebrow">The cheapest dish</p>
              <p className="mt-1 font-display text-[26px] leading-tight tracking-tight text-ink">
                {restaurant.dish_name}
              </p>
            </div>
            <div className="text-right">
              <p className="price-num text-[44px] font-semibold leading-none text-ink">
                {formatPrice(restaurant.price)}
              </p>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                AUD
              </p>
            </div>
          </div>
          <div className="px-5 pb-4">
            <PriceStamp verifiedAt={restaurant.verified_at} />
          </div>
        </section>

        <VoteButtons
          restaurantId={restaurant.id}
          initialScore={restaurant.vote_score}
          initialUpCount={restaurant.up_count ?? 0}
          initialDownCount={restaurant.down_count ?? 0}
        />

        <RestaurantDeals deals={deals} />

        <RestaurantPosts posts={posts} />

        <section className="border-t border-rule pt-6">
          <div className="flex items-baseline justify-between">
            <h3 className="eyebrow">Comments</h3>
            <span className="price-num text-[12px] text-ink-muted">
              {String(comments.length).padStart(2, "0")}
            </span>
          </div>
          <div className="mt-3">
            <CommentList comments={comments} />
          </div>
          <div className="mt-4">
            <CommentForm restaurantId={restaurant.id} />
          </div>
        </section>

        <FlagButton restaurantId={restaurant.id} />
      </article>
    </div>
  )
}
