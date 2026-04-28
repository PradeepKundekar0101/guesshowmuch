"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
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
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="text-5xl">❤️</span>
        <p className="mt-4 text-gray-500">No saved restaurants yet.</p>
        <p className="mt-1 text-sm text-gray-400">Browse the map and tap the heart icon to save.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {savedRestaurants.map((restaurant) => (
        <div key={restaurant.id} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3">
          <Link href={`/restaurant/${restaurant.id}`} className="shrink-0">
            {restaurant.photo_url ? (
              <Image src={restaurant.photo_url} alt={restaurant.name} width={64} height={64} className="h-16 w-16 rounded-xl object-cover" />
            ) : (
              <PlaceholderImage className="h-16 w-16 rounded-xl" size="sm" />
            )}
          </Link>
          <Link href={`/restaurant/${restaurant.id}`} className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-bold text-gray-900">{restaurant.name}</h3>
            <p className="text-xs text-gray-400">{restaurant.cuisine_type} · {restaurant.suburb}</p>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="rounded-lg bg-emerald-500 px-2 py-0.5 text-xs font-bold text-white">{formatPrice(restaurant.price)}</span>
              <span className="truncate text-xs text-gray-400">{restaurant.dish_name}</span>
            </div>
          </Link>
          <BookmarkButton restaurantId={restaurant.id} size="sm" />
        </div>
      ))}
    </div>
  )
}
