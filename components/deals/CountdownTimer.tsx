"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"
import { getCountdown } from "@/lib/utils/time"

type CountdownTimerProps = {
  expiresAt: string
}

export function CountdownTimer({ expiresAt }: CountdownTimerProps) {
  const [countdown, setCountdown] = useState(getCountdown(expiresAt))

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getCountdown(expiresAt))
    }, 60000)

    return () => clearInterval(interval)
  }, [expiresAt])

  if (countdown.expired) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-paper-dim px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
        Expired
      </span>
    )
  }

  return (
    <span className="price-num inline-flex shrink-0 items-center gap-1 rounded-full bg-paper-dim px-2 py-1 text-[11px] font-semibold text-ink">
      <Clock size={10} strokeWidth={2} className="text-cinnabar-500" />
      {countdown.hours}h {countdown.minutes}m
    </span>
  )
}
