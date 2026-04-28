"use client"

import { useState, useCallback, useEffect } from "react"
import { MapContainer } from "@/components/map/MapContainer"
import { PriceFilter } from "@/components/filters/PriceFilter"
import { SearchBar } from "@/components/shared/SearchBar"
import { RestaurantPreview } from "@/components/map/RestaurantPreview"
import { FloatingSubmitButton } from "@/components/navigation/FloatingSubmitButton"
import Link from "next/link"
import type { Restaurant } from "@/lib/types/database"

type MapViewProps = {
  restaurants: Restaurant[]
}

export function MapView({ restaurants }: MapViewProps) {
  const [maxPrice, setMaxPrice] = useState(15)
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)

  // Redirect to onboarding if first visit
  useEffect(() => {
    if (!localStorage.getItem("onboarding_complete")) {
      window.location.href = "/onboarding"
    }
  }, [])

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

      {/* Rankings link */}
      <Link
        href="/rankings"
        className="absolute left-3 top-16 z-10 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-md transition-colors hover:bg-gray-50"
      >
        🏆 Rankings
      </Link>

      <FloatingSubmitButton />

      <MapContainer
        restaurants={restaurants}
        onPinClick={handlePinClick}
        maxPrice={maxPrice}
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
