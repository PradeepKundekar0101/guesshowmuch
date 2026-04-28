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

  // Initialize map
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
      style: "mapbox://styles/mapbox/streets-v12",
      center,
      zoom: DEFAULT_ZOOM,
    })

    map.addControl(new mapboxgl.NavigationControl(), "top-right")

    mapRef.current = map

    // Listen for fly-to events from search bar
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

  // Manage markers based on restaurants and price filter
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const currentMarkers = markersRef.current

    // Remove markers that are filtered out
    currentMarkers.forEach((marker, id) => {
      const restaurant = restaurants.find((r) => r.id === id)
      if (!restaurant || restaurant.price > maxPrice) {
        marker.remove()
        currentMarkers.delete(id)
      }
    })

    // Add or update markers for visible restaurants
    restaurants
      .filter((r) => r.price <= maxPrice)
      .forEach((restaurant) => {
        if (currentMarkers.has(restaurant.id)) {
          const marker = currentMarkers.get(restaurant.id)!
          const el = createPricePinElement(restaurant.price, restaurant.id === activeId)
          el.addEventListener("click", () => {
            setActiveId(restaurant.id)
            onPinClick(restaurant)
          })
          marker.getElement().replaceWith(el)
          return
        }

        const el = createPricePinElement(restaurant.price, restaurant.id === activeId)
        el.addEventListener("click", () => {
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
        className="absolute bottom-28 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition-colors hover:bg-gray-50"
        aria-label="Re-center on my location"
      >
        <span className="text-lg">📍</span>
      </button>
    </div>
  )
}
