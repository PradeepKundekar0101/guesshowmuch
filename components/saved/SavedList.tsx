"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Bookmark } from "lucide-react"
import { PlaceholderImage } from "@/components/shared/PlaceholderImage"
import { BookmarkButton } from "@/components/bookmark/BookmarkButton"
import { formatPrice } from "@/lib/utils/price"
import { getBookmarks } from "@/lib/utils/local-storage"
import type { Restaurant } from "@/lib/types/database"

type SavedListProps = {
  allRestaurants: Restaurant[]
}

export function SavedList({ allRestaurants }: SavedListProps) {
  const [bookmarkIds, setBookmarkIds] = useState<string[]>([])

  useEffect(() => {
    setBookmarkIds(getBookmarks())
    const handleStorage = () => setBookmarkIds(getBookmarks())
    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => setBookmarkIds(getBookmarks()), 1000)
    return () => clearInterval(interval)
  }, [])

  const savedRestaurants = allRestaurants.filter((r) => bookmarkIds.includes(r.id))

  if (savedRestaurants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-rule bg-paper-dim">
          <Bookmark size={20} strokeWidth={1.5} className="text-ink-soft" />
        </div>
        <p className="mt-5 font-display text-2xl tracking-tight text-ink">
          Nothing kept yet
        </p>
        <p className="mt-2 max-w-[260px] text-[13px] leading-relaxed text-ink-soft">
          Tap the bookmark on any restaurant card and it&apos;ll keep here for
          later.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2.5">
      {savedRestaurants.map((restaurant, idx) => (
        <div
          key={restaurant.id}
          className="group flex items-center gap-3 rounded-2xl border border-rule bg-surface p-2.5 pr-3 transition-all hover:border-rule-strong hover:shadow-[0_4px_20px_rgba(20,20,23,0.05)]"
        >
          <Link href={`/restaurant/${restaurant.id}`} className="shrink-0">
            {restaurant.photo_url ? (
              <Image
                src={restaurant.photo_url}
                alt={restaurant.name}
                width={64}
                height={64}
                className="h-16 w-16 rounded-xl object-cover ring-1 ring-rule"
              />
            ) : (
              <PlaceholderImage className="h-16 w-16 rounded-xl ring-1 ring-rule" size="sm" />
            )}
          </Link>
          <Link href={`/restaurant/${restaurant.id}`} className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="price-num text-[10px] font-semibold text-ink-muted">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <h3 className="truncate font-display text-[18px] leading-tight tracking-tight text-ink">
                {restaurant.name}
              </h3>
            </div>
            <p className="mt-0.5 text-[11px] uppercase tracking-[0.1em] text-ink-muted">
              {restaurant.cuisine_type} · {restaurant.suburb}
            </p>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="price-num text-sm font-semibold text-ink">
                {formatPrice(restaurant.price)}
              </span>
              <span className="truncate text-[12px] text-ink-soft">
                {restaurant.dish_name}
              </span>
            </div>
          </Link>
          <BookmarkButton restaurantId={restaurant.id} size="sm" />
        </div>
      ))}
    </div>
  )
}
