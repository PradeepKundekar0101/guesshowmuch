"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import mapboxgl from "mapbox-gl"
import { BRISBANE_CENTER, DEFAULT_ZOOM } from "@/lib/utils/geo"
import { createPricePinElement } from "@/components/map/PricePin"
import type { Restaurant } from "@/lib/types/database"

type MapContainerProps = {
  restaurants: Restaurant[]
  onPinClick: (restaurant: Restaurant) => void
  maxPrice: number
}

export function MapContainer({ restaurants, onPinClick, maxPrice }: MapContainerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map())
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    if (!mapContainerRef.current) return

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

    let center: [number, number] = [BRISBANE_CENTER.lng, BRISBANE_CENTER.lat]
    const stored = localStorage.getItem("user_location")
    if (stored) {
      try {
        const loc = JSON.parse(stored)
        center = [loc.lng, loc.lat]
      } catch {
        // use default
      }
    }

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center,
      zoom: DEFAULT_ZOOM,
    })

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right")
    mapRef.current = map

    const handleFlyTo = (e: Event) => {
      const { center } = (e as CustomEvent).detail
      map.flyTo({ center, zoom: DEFAULT_ZOOM })
    }

    window.addEventListener("map-fly-to", handleFlyTo)

    return () => {
      window.removeEventListener("map-fly-to", handleFlyTo)
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const currentMarkers = markersRef.current
    const visibleIds = new Set<string>()

    // Determine visible restaurants
    restaurants
      .filter((r) => r.price <= maxPrice)
      .forEach((restaurant) => {
        visibleIds.add(restaurant.id)
      })

    // Remove markers no longer visible
    currentMarkers.forEach((marker, id) => {
      if (!visibleIds.has(id)) {
        marker.remove()
        currentMarkers.delete(id)
      }
    })

    // Add or recreate markers
    restaurants
      .filter((r) => r.price <= maxPrice)
      .forEach((restaurant) => {
        const isActive = restaurant.id === activeId

        // If marker exists and active state hasn't changed, skip
        const existing = currentMarkers.get(restaurant.id)
        if (existing) {
          // Remove and recreate to update active state
          existing.remove()
          currentMarkers.delete(restaurant.id)
        }

        const el = createPricePinElement(restaurant.price, isActive, restaurant.pin_type)
        el.addEventListener("click", (e) => {
          e.stopPropagation()
          setActiveId(restaurant.id)
          onPinClick(restaurant)
        })

        const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
          .setLngLat([restaurant.longitude, restaurant.latitude])
          .addTo(map)

        currentMarkers.set(restaurant.id, marker)
      })
  }, [restaurants, maxPrice, activeId, onPinClick])

  const handleRecenter = useCallback(() => {
    if (!mapRef.current) return

    const stored = localStorage.getItem("user_location")
    if (stored) {
      try {
        const loc = JSON.parse(stored)
        mapRef.current.flyTo({ center: [loc.lng, loc.lat], zoom: DEFAULT_ZOOM })
        return
      } catch {
        // fall through
      }
    }

    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        localStorage.setItem("user_location", JSON.stringify(loc))
        mapRef.current?.flyTo({ center: [loc.lng, loc.lat], zoom: DEFAULT_ZOOM })
      },
      () => {
        mapRef.current?.flyTo({
          center: [BRISBANE_CENTER.lng, BRISBANE_CENTER.lat],
          zoom: DEFAULT_ZOOM,
        })
      }
    )
  }, [])

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainerRef} className="h-full w-full" />

      <button
        onClick={handleRecenter}
        className="glass absolute bottom-48 right-3 flex h-11 w-11 items-center justify-center rounded-full text-ink shadow-[0_4px_18px_rgba(20,20,23,0.1)] transition-all hover:scale-105 active:scale-95"
        aria-label="Re-center on my location"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="2.5" fill="currentColor" />
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3" />
        </svg>
      </button>
    </div>
  )
}
