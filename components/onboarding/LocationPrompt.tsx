"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { MapPin, Check, ArrowRight } from "lucide-react"
import { getUserLocation } from "@/lib/utils/geo"

const reasons = [
  "Centre the map on your area",
  "Show distances to restaurants",
  "Find the nearest cheap eats first",
]

export function LocationPrompt() {
  const router = useRouter()
  const [requesting, setRequesting] = useState(false)

  async function handleAllow() {
    setRequesting(true)
    try {
      const location = await getUserLocation()
      localStorage.setItem("user_location", JSON.stringify(location))
    } catch {
      // Permission denied or error
    }
    localStorage.setItem("onboarding_complete", "true")
    router.replace("/")
  }

  function handleSkip() {
    localStorage.setItem("onboarding_complete", "true")
    router.replace("/")
  }

  return (
    <div className="paper-grain relative flex min-h-dvh flex-col items-center justify-between bg-paper px-7 pb-10 pt-16">
      <div className="w-full animate-rise-in">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-ink-muted">
          Step 02 · Location
        </p>

        <div className="mt-12 flex h-20 w-20 items-center justify-center rounded-full border border-rule bg-surface">
          <MapPin size={28} strokeWidth={1.5} className="text-ink" />
        </div>

        <h2 className="mt-7 font-display text-[42px] leading-[0.95] tracking-tight text-ink">
          Find food
          <br />
          <em>near you</em>
        </h2>
        <div className="mt-5 h-px w-12 bg-ink" />
        <p className="mt-5 max-w-[300px] text-[14px] leading-relaxed text-ink-soft">
          Allow location access so we can centre the map on where you are right
          now and surface the cheapest food close by.
        </p>

        <ul className="mt-7 space-y-2.5">
          {reasons.map((text) => (
            <li key={text} className="flex items-start gap-2.5 text-[13px] text-ink-soft">
              <Check
                size={14}
                strokeWidth={2}
                className="mt-0.5 shrink-0 text-emerald-500"
              />
              <span>{text}</span>
            </li>
          ))}
        </ul>

        <p className="mt-6 max-w-[280px] text-[11px] leading-relaxed text-ink-muted">
          Your location stays on your device. We never store or share it.
        </p>
      </div>

      <div className="mt-10 w-full animate-rise-in" style={{ animationDelay: "150ms" }}>
        <button
          onClick={handleAllow}
          disabled={requesting}
          className="group flex w-full items-center justify-between rounded-full bg-ink px-6 py-4 text-paper transition-all hover:bg-ink/90 disabled:opacity-50 active:scale-[0.99]"
        >
          <span className="text-[14px] font-semibold tracking-tight">
            {requesting ? "Requesting…" : "Allow location"}
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-paper text-ink transition-transform group-hover:translate-x-0.5">
            <ArrowRight size={15} strokeWidth={2} />
          </span>
        </button>
        <button
          onClick={handleSkip}
          className="mt-3 w-full text-center text-[12px] font-medium uppercase tracking-[0.12em] text-ink-muted transition-colors hover:text-ink"
        >
          Skip — I&apos;ll search manually
        </button>
      </div>
    </div>
  )
}
