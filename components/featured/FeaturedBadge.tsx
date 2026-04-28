import { Star } from "lucide-react"

type FeaturedBadgeProps = {
  pinType: string
}

export function FeaturedBadge({ pinType }: FeaturedBadgeProps) {
  if (pinType !== "featured") return null

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-gold-300/60 bg-gold-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-gold-700">
      <Star size={9} fill="currentColor" strokeWidth={0} />
      Featured
    </span>
  )
}
