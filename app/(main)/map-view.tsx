"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { MapContainer } from "@/components/map/MapContainer"
import { PriceFilter } from "@/components/filters/PriceFilter"
import {
  CuisineFilter,
  buildCuisineCounts,
} from "@/components/filters/CuisineFilter"
import { SearchBar } from "@/components/shared/SearchBar"
import { RestaurantPreview } from "@/components/map/RestaurantPreview"
import { FloatingSubmitButton } from "@/components/navigation/FloatingSubmitButton"
import { Trophy } from "lucide-react"
import Link from "next/link"
import type { Restaurant } from "@/lib/types/database"

type MapViewProps = {
  restaurants: Restaurant[]
}

export function MapView({ restaurants }: MapViewProps) {
  const [maxPrice, setMaxPrice] = useState(15)
  const [cuisine, setCuisine] = useState<string | null>(null)
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)

  useEffect(() => {
    if (!localStorage.getItem("onboarding_complete")) {
      window.location.href = "/onboarding"
    }
  }, [])

  const cuisineCounts = useMemo(
    () => buildCuisineCounts(restaurants.filter((r) => r.price <= maxPrice)),
    [restaurants, maxPrice]
  )

  const handlePinClick = useCallback((restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant)
  }, [])

  const handleSearchSelect = useCallback((center: [number, number]) => {
    window.dispatchEvent(
      new CustomEvent("map-fly-to", { detail: { center } })
    )
  }, [])

  const handleClosePreview = useCallback(() => {
    setSelectedRestaurant(null)
  }, [])

  return (
    <div className="relative h-dvh w-full overflow-hidden pb-14">
      <SearchBar onSelect={handleSearchSelect} />

      <Link
        href="/rankings"
        className="glass absolute left-3 top-[68px] z-10 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium tracking-[0.04em] text-ink shadow-sm transition-all hover:bg-white"
      >
        <Trophy size={12} strokeWidth={2} className="text-gold-500" />
        <span className="uppercase">Top suburbs</span>
      </Link>

      <FloatingSubmitButton />

      <MapContainer
        restaurants={restaurants}
        onPinClick={handlePinClick}
        maxPrice={maxPrice}
        cuisine={cuisine}
      />

      <CuisineFilter
        cuisines={cuisineCounts}
        value={cuisine}
        onChange={setCuisine}
      />

      <PriceFilter value={maxPrice} onChange={setMaxPrice} />

      {selectedRestaurant && (
        <RestaurantPreview
          restaurant={selectedRestaurant}
          onClose={handleClosePreview}
        />
      )}
    </div>
  )
}
