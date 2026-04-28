type FeaturedBadgeProps = {
  pinType: string
}

export function FeaturedBadge({ pinType }: FeaturedBadgeProps) {
  if (pinType !== "featured") return null

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
      ⭐ Featured
    </span>
  )
}
