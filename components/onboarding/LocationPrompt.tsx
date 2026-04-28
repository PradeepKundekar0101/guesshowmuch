"use client"

import { useRouter } from "next/navigation"
import { getUserLocation } from "@/lib/utils/geo"
import { useState } from "react"

export function LocationPrompt() {
  const router = useRouter()
  const [requesting, setRequesting] = useState(false)

  async function handleAllow() {
    setRequesting(true)
    try {
      const location = await getUserLocation()
      localStorage.setItem("user_location", JSON.stringify(location))
    } catch {
      // Permission denied or error — fall through to default Brisbane
    }
    localStorage.setItem("onboarding_complete", "true")
    router.replace("/")
  }

  function handleSkip() {
    localStorage.setItem("onboarding_complete", "true")
    router.replace("/")
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-8 py-12 text-center">
      <div className="flex h-[120px] w-[120px] items-center justify-center rounded-full bg-emerald-50 text-6xl">
        📍
      </div>

      <h2 className="mt-6 text-2xl font-extrabold text-gray-900">
        Find food near you
      </h2>
      <p className="mt-3 max-w-[280px] text-base leading-relaxed text-gray-500">
        Allow location access so we can show cheap eats close to where you are
        right now.
      </p>

      <div className="mt-6 w-full max-w-[280px] rounded-xl bg-gray-50 p-4 text-left">
        <p className="mb-2 text-xs font-semibold uppercase text-gray-400">
          We use your location to:
        </p>
        <p className="text-sm leading-7 text-gray-600">
          ✓ Centre the map on your area
          <br />
          ✓ Show distances to restaurants
          <br />
          ✓ Find the closest cheap eats
        </p>
      </div>

      <p className="mt-4 max-w-[260px] text-xs leading-relaxed text-gray-400">
        Your location stays on your device. We never store or share it.
      </p>

      <div className="mt-8 flex w-full max-w-[280px] flex-col gap-2.5">
        <button
          onClick={handleAllow}
          disabled={requesting}
          className="w-full rounded-2xl bg-emerald-500 px-6 py-4 text-base font-bold text-white transition-colors hover:bg-emerald-600 disabled:opacity-50"
        >
          {requesting ? "Requesting..." : "Allow Location Access"}
        </button>
        <button
          onClick={handleSkip}
          className="w-full px-6 py-3 text-sm font-medium text-gray-500 transition-colors hover:text-gray-700"
        >
          Skip — I'll search manually
        </button>
      </div>
    </div>
  )
}
