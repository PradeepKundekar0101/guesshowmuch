"use client"

import { useState, useEffect } from "react"
import { Bookmark } from "lucide-react"
import { isBookmarked, toggleBookmark } from "@/lib/utils/local-storage"

type BookmarkButtonProps = {
  restaurantId: string
  size?: "sm" | "md"
}

export function BookmarkButton({ restaurantId, size = "md" }: BookmarkButtonProps) {
  const [saved, setSaved] = useState(false)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    setSaved(isBookmarked(restaurantId))
  }, [restaurantId])

  function handleToggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const nowSaved = toggleBookmark(restaurantId)
    setSaved(nowSaved)
    setAnimating(true)
    setTimeout(() => setAnimating(false), 200)
  }

  const iconSize = size === "sm" ? 14 : 18
  const buttonSize = size === "sm" ? "h-8 w-8" : "h-10 w-10"

  return (
    <button
      onClick={handleToggle}
      className={`flex shrink-0 items-center justify-center rounded-full border transition-all ${buttonSize} ${
        animating ? "scale-90" : "scale-100"
      } ${
        saved
          ? "border-brand bg-brand text-white"
          : "border-rule bg-surface text-ink-soft hover:border-ink hover:text-ink"
      }`}
      aria-label={saved ? "Remove bookmark" : "Save restaurant"}
    >
      <Bookmark
        size={iconSize}
        fill={saved ? "currentColor" : "none"}
        strokeWidth={1.75}
      />
    </button>
  )
}
