import type { Restaurant } from "@/lib/types/database"

export type MapPinType = Restaurant["pin_type"]

export type MapPriceTier = "steal" | "good" | "ok" | "premium"

const RING = "rgba(255,250,246,0.95)"

/** Standard pins: bargain warmth anchored to brand orange (#FF6900). */
export const MAP_STANDARD_TIER: Record<
  MapPriceTier,
  { bg: string; fg: string; ring: string }
> = {
  steal: { bg: "#ffb088", fg: "#2f1608", ring: RING },
  good: { bg: "#ff9a52", fg: "#291207", ring: RING },
  ok: { bg: "#FF6900", fg: "#fffaf8", ring: RING },
  premium: { bg: "#d94e00", fg: "#fffaf8", ring: RING },
}

type VariantKey = Exclude<MapPinType, "standard">

export const MAP_VARIANT_LOOK: Record<
  VariantKey,
  {
    bg: string
    fg: string
    ring: string
    accentBg: string
    icon: "star" | "flame" | "heart"
  }
> = {
  featured: {
    bg: "#ffe8cf",
    fg: "#3d2914",
    ring: RING,
    accentBg: "#ea8c06",
    icon: "star",
  },
  hot_deal: {
    bg: "#dc2626",
    fg: "#fff5f5",
    ring: RING,
    accentBg: "#f59e0b",
    icon: "flame",
  },
  top_rated: {
    bg: "#c45d73",
    fg: "#fff8f9",
    ring: RING,
    accentBg: "#fbbf24",
    icon: "heart",
  },
}
