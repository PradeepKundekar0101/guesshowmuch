"use client"

import { useState, useEffect } from "react"
import { isBookmarked, toggleBookmark } from "@/lib/utils/local-storage"

type BookmarkButtonProps = {
  restaurantId: string
  size?: "sm" | "md"
}

export function BookmarkButton({ restaurantId, size = "md" }: BookmarkButtonProps) {
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setSaved(isBookmarked(restaurantId))
  }, [restaurantId])

  function handleToggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const nowSaved = toggleBookmark(restaurantId)
    setSaved(nowSaved)
  }

  const sizeClasses = size === "sm" ? "h-8 w-8 text-lg" : "h-10 w-10 text-xl"

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center justify-center rounded-full transition-colors ${sizeClasses} ${
        saved ? "bg-red-50 text-red-500" : "bg-gray-100 text-gray-400 hover:bg-gray-200"
      }`}
      aria-label={saved ? "Remove bookmark" : "Save restaurant"}
    >
      {saved ? "❤️" : "🤍"}
    </button>
  )
}
