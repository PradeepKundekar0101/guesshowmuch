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
    <div className="min-h-dvh bg-paper">
      <div className="paper-grain relative mx-auto flex min-h-dvh max-w-md flex-col px-7 pb-8 pt-14">
        <div className="animate-rise-in">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-ink-muted">
            Step 02 · Location
          </p>

          <div className="mt-10 flex h-20 w-20 items-center justify-center rounded-full border border-rule bg-brand-soft">
            <MapPin size={28} strokeWidth={1.75} className="text-brand" />
          </div>

          <h2 className="mt-7 font-display text-[42px] leading-[0.95] tracking-tight text-ink">
            Find food
            <br />
            <em>near you</em>
          </h2>
          <div className="mt-5 h-px w-12 rounded-full bg-brand" />
          <p className="mt-5 max-w-[300px] text-[14px] leading-relaxed text-ink-soft">
            Let us plonk you on the map so the nearest bargain feeds float to the
            top.
          </p>

          <ul className="mt-7 space-y-2.5">
            {reasons.map((text) => (
              <li
                key={text}
                className="flex items-start gap-2.5 text-[13px] text-ink-soft"
              >
                <Check
                  size={14}
                  strokeWidth={2}
                  className="mt-0.5 shrink-0 text-brand"
                />
                <span>{text}</span>
              </li>
            ))}
          </ul>

          <p className="mt-6 max-w-[280px] text-[11px] leading-relaxed text-ink-muted">
            Your location stays on your device. We never store or share it.
          </p>
        </div>

        <div className="flex-1" />

        <div
          className="mt-10 animate-rise-in"
          style={{ animationDelay: "150ms" }}
        >
          <button
            onClick={handleAllow}
            disabled={requesting}
            className="group flex w-full items-center justify-between rounded-full bg-brand px-6 py-4 text-white transition-all hover:bg-brand-hover disabled:opacity-50 active:scale-[0.99]"
          >
            <span className="text-[14px] font-semibold tracking-tight">
              {requesting ? "Requesting…" : "Allow location"}
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-brand transition-transform group-hover:translate-x-0.5">
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
    </div>
  )
}
