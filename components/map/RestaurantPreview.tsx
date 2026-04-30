"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowUpRight,
  ChevronRight,
  Clock,
  MapPin,
  MessageCircle,
  Navigation,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react"
import { PlaceholderImage } from "@/components/shared/PlaceholderImage"
import { BookmarkButton } from "@/components/bookmark/BookmarkButton"
import { FeaturedBadge } from "@/components/featured/FeaturedBadge"
import { VoteRatioBar } from "@/components/voting/VoteRatioBar"
import { formatPrice, getVerificationStatus } from "@/lib/utils/price"
import { getVote, setVote } from "@/lib/utils/local-storage"
import type { Restaurant } from "@/lib/types/database"

type RestaurantPreviewProps = {
  restaurant: Restaurant
  onClose: () => void
}

function tierLabel(price: number): { label: string; tone: string } {
  if (price <= 5) return { label: "Steal", tone: "bg-pin-steal/30 text-amber-900" }
  if (price <= 10) return { label: "Cheap", tone: "bg-pin-good/35 text-orange-900" }
  if (price <= 15) return { label: "Fair", tone: "bg-pin-ok/25 text-orange-900" }
  return { label: "Treat", tone: "bg-pin-premium/25 text-rose-900" }
}

function googleMapsUrl(r: Restaurant) {
  const query = encodeURIComponent(
    [r.name, r.address, r.suburb, r.city].filter(Boolean).join(", ")
  )
  return `https://www.google.com/maps/search/?api=1&query=${query}&query_place_id=`
}

export function RestaurantPreview({
  restaurant,
  onClose,
}: RestaurantPreviewProps) {
  const verification = getVerificationStatus(restaurant.verified_at)
  const tier = tierLabel(restaurant.price)

  const [score, setScore] = useState(restaurant.vote_score)
  const [up, setUp] = useState(restaurant.up_count ?? 0)
  const [down, setDown] = useState(restaurant.down_count ?? 0)
  const [currentVote, setCurrentVote] = useState<"up" | "down" | null>(() =>
    typeof window === "undefined" ? null : getVote(restaurant.id)
  )
  const [voting, setVoting] = useState(false)

  async function castVote(direction: "up" | "down") {
    if (voting || currentVote === direction) return
    setVoting(true)
    try {
      const res = await fetch(`/api/restaurants/${restaurant.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction, previousDirection: currentVote }),
      })
      if (res.ok) {
        const data = await res.json()
        setScore(data.vote_score)
        if (typeof data.up_count === "number") setUp(data.up_count)
        if (typeof data.down_count === "number") setDown(data.down_count)
        setVote(restaurant.id, direction)
        setCurrentVote(direction)
      }
    } catch {
      // silently fail — drawer stays usable
    } finally {
      setVoting(false)
    }
  }

  return (
    <>
      <div
        className="absolute inset-0 z-10 bg-ink/0 transition-colors"
        onClick={onClose}
        aria-hidden
      />

      <div
        className="absolute bottom-14 left-0 right-0 z-20 max-h-[78dvh] animate-slide-up overflow-y-auto rounded-t-[28px] border-x border-t border-rule bg-paper shadow-[0_-12px_40px_rgba(40,16,8,0.16)]"
        role="dialog"
        aria-label={`${restaurant.name} details`}
      >
        <div className="sticky top-0 z-10 bg-paper/95 px-5 pb-2 pt-2 backdrop-blur-sm">
          <div className="mx-auto h-1 w-10 rounded-full bg-ink-faint" />
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-2 flex h-8 w-8 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-paper-dim hover:text-ink"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <div className="px-5 pb-5 pt-1">
          <div className="flex gap-4">
            <div className="relative shrink-0">
              {restaurant.photo_url ? (
                <Image
                  src={restaurant.photo_url}
                  alt={restaurant.name}
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-2xl object-cover ring-1 ring-rule"
                />
              ) : (
                <PlaceholderImage
                  className="h-24 w-24 rounded-2xl ring-1 ring-rule"
                  size="sm"
                />
              )}
              {/* <span
                className={`price-num absolute -bottom-2 -right-2 rounded-full px-2 py-0.5 text-[11px] font-bold shadow-sm ring-2 ring-paper ${tier.tone} my-4`}
              >
                {tier.label}
              </span> */}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex  justify-between items-center gap-2 pr-10">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-brand">
                      {restaurant.cuisine_type ?? "Eats"}
                    </span>
                    <FeaturedBadge pinType={restaurant.pin_type} />
                  </div>
                  <h3 className="mt-1.5 truncate font-display text-[24px] font-extrabold leading-[1.05] tracking-tight text-ink">
                    {restaurant.name}
                  </h3>
                </div>
                <BookmarkButton restaurantId={restaurant.id} size="sm" />
              </div>

              <div className="mt-2 space-y-1 text-[12px] leading-snug text-ink-soft">
                <div className="flex items-start gap-1.5">
                  <MapPin
                    size={12}
                    strokeWidth={1.75}
                    className="mt-0.5 shrink-0 text-ink-muted"
                  />
                  <span className="line-clamp-2">
                    {restaurant.address ?? restaurant.suburb}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock
                    size={12}
                    strokeWidth={1.75}
                    className={
                      verification.isStale
                        ? "shrink-0 text-cinnabar-500"
                        : "shrink-0 text-ink-muted"
                    }
                  />
                  <span
                    className={
                      verification.isStale ? "text-cinnabar-700" : undefined
                    }
                  >
                    {verification.label.replace("Verified ", "Last verified ")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-2.5">
            <Field label="Cheapest dish" value={restaurant.dish_name} />
            <Field
              label="Price"
              value={
                <span className="price-num text-[18px] font-bold text-brand">
                  {formatPrice(restaurant.price)}
                </span>
              }
            />
            <Field
              label="Suburb"
              value={restaurant.suburb ?? restaurant.city}
            />
            <Field
              label="Net score"
              value={
                <span
                  className={`price-num text-[18px] font-bold ${score >= 0 ? "text-emerald-600" : "text-cinnabar-500"
                    }`}
                >
                  {score >= 0 ? `+${score}` : score}
                </span>
              }
            />
          </dl>

          <section className="mt-4 rounded-2xl border border-rule bg-surface p-4">
            <div className="flex items-baseline justify-between">
              <p className="eyebrow">Is this price still right?</p>
              <span className="text-[11px] text-ink-muted">
                {up + down} {up + down === 1 ? "vote" : "votes"}
              </span>
            </div>
            <div className="mt-3">
              <VoteRatioBar upCount={up} downCount={down} />
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => castVote("up")}
                disabled={voting}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-[12px] font-semibold transition-all active:scale-[0.98] ${currentVote === "up"
                  ? "bg-emerald-500 text-white"
                  : "bg-paper-dim text-ink-soft hover:bg-rule"
                  }`}
              >
                <ThumbsUp
                  size={13}
                  strokeWidth={2}
                  fill={currentVote === "up" ? "currentColor" : "none"}
                />
                Spot on
              </button>
              <button
                onClick={() => castVote("down")}
                disabled={voting}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-[12px] font-semibold transition-all active:scale-[0.98] ${currentVote === "down"
                  ? "bg-cinnabar-500 text-white"
                  : "bg-paper-dim text-ink-soft hover:bg-rule"
                  }`}
              >
                <ThumbsDown
                  size={13}
                  strokeWidth={2}
                  fill={currentVote === "down" ? "currentColor" : "none"}
                />
                Bumped up
              </button>
            </div>
          </section>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <a
              href={googleMapsUrl(restaurant)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-full border border-rule bg-surface py-2.5 text-[12px] font-semibold text-ink transition-all hover:border-brand hover:text-brand active:scale-[0.99]"
            >
              <Navigation size={13} strokeWidth={2} />
              Directions
              <ArrowUpRight size={12} strokeWidth={2} className="opacity-60" />
            </a>
            <Link
              href={`/restaurant/${restaurant.id}#comments`}
              className="flex items-center justify-center gap-1.5 rounded-full border border-rule bg-surface py-2.5 text-[12px] font-semibold text-ink transition-all hover:border-brand hover:text-brand active:scale-[0.99]"
            >
              <MessageCircle size={13} strokeWidth={2} />
              Comments
            </Link>
          </div>

          <Link
            href={`/restaurant/${restaurant.id}`}
            className="mt-3 flex items-center justify-center gap-1.5 rounded-full bg-brand py-3 text-[13px] font-semibold tracking-tight text-white shadow-[0_8px_24px_rgba(255,80,0,0.32)] transition-all hover:bg-brand-hover active:scale-[0.99]"
          >
            See full listing
            <ChevronRight size={15} strokeWidth={2.25} />
          </Link>
        </div>
      </div>
    </>
  )
}

function Field({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-rule bg-surface px-3 py-2.5">
      <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
        {label}
      </dt>
      <dd className="mt-1 truncate text-[14px] font-medium text-ink">
        {value}
      </dd>
    </div>
  )
}
