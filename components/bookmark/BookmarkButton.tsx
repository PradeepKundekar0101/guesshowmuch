"use client"

import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
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

  const iconSize = size === "sm" ? 16 : 20
  const buttonSize = size === "sm" ? "h-8 w-8" : "h-10 w-10"

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center justify-center rounded-full transition-all active:scale-90 ${buttonSize} ${
        saved
          ? "bg-red-50 text-red-500"
          : "bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
      }`}
      aria-label={saved ? "Remove bookmark" : "Save restaurant"}
    >
      <Heart size={iconSize} fill={saved ? "currentColor" : "none"} strokeWidth={2} />
    </button>
  )
}
