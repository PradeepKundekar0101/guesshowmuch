import { Flame, Heart, Star } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { Restaurant } from "@/lib/types/database"

type PinType = Restaurant["pin_type"]

type FeaturedBadgeProps = {
  pinType: PinType
}

const styles: Record<
  Exclude<PinType, "standard">,
  { label: string; className: string; Icon: LucideIcon }
> = {
  featured: {
    label: "Featured",
    Icon: Star,
    className:
      "border-amber-300/70 bg-[#ffe8cf] text-amber-950 ring-1 ring-amber-200/80",
  },
  hot_deal: {
    label: "Hot deal",
    Icon: Flame,
    className:
      "border-red-600/35 bg-[#fde8e8] text-red-800 ring-1 ring-red-500/25",
  },
  top_rated: {
    label: "Top rated",
    Icon: Heart,
    className:
      "border-rose-300/70 bg-[#fce8ee] text-rose-900 ring-1 ring-rose-200/80",
  },
}

export function FeaturedBadge({ pinType }: FeaturedBadgeProps) {
  if (pinType === "standard") return null

  const { Icon, label, className } = styles[pinType]

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] ${className}`}
    >
      <Icon size={9} strokeWidth={2.5} aria-hidden />
      {label}
    </span>
  )
}
