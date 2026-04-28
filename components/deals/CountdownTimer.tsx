"use client"

import { useState, useEffect } from "react"
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
    return <span className="text-xs font-medium text-red-500">Expired</span>
  }

  return (
    <span className="text-xs font-bold text-orange-600">
      {countdown.hours}h {countdown.minutes}m left
    </span>
  )
}
