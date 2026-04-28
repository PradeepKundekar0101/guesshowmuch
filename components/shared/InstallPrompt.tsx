"use client"

import { useEffect, useState } from "react"
import { Download, X } from "lucide-react"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

const DISMISS_KEY = "ghm_install_dismissed_at"
const DISMISS_TTL_MS = 1000 * 60 * 60 * 24 * 14 // 14 days

export function InstallPrompt() {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [hidden, setHidden] = useState(true)

  useEffect(() => {
    if (typeof window === "undefined") return

    // Already installed in standalone mode? Hide.
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS-only flag
      window.navigator.standalone === true
    if (isStandalone) return

    // Honour recent dismissals
    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0)
    if (dismissedAt && Date.now() - dismissedAt < DISMISS_TTL_MS) return

    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault()
      setEvent(e as BeforeInstallPromptEvent)
      setHidden(false)
    }

    function onInstalled() {
      setHidden(true)
      setEvent(null)
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt)
    window.addEventListener("appinstalled", onInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt)
      window.removeEventListener("appinstalled", onInstalled)
    }
  }, [])

  async function handleInstall() {
    if (!event) return
    try {
      await event.prompt()
      const { outcome } = await event.userChoice
      if (outcome === "dismissed") {
        localStorage.setItem(DISMISS_KEY, String(Date.now()))
      }
    } finally {
      setHidden(true)
      setEvent(null)
    }
  }

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
    setHidden(true)
  }

  if (hidden || !event) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-16 z-40 flex justify-center px-3 pb-[env(safe-area-inset-bottom)] sm:bottom-4">
      <div className="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-2xl border border-rule bg-ink px-4 py-3 text-paper shadow-[0_12px_40px_rgba(20,20,23,0.35)] animate-rise-in">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-paper/10">
          <Download size={16} strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="text-[13px] font-semibold tracking-tight">
            Install Guess How Much
          </p>
          <p className="mt-0.5 text-[11px] text-paper/60">
            Add to your home screen for one-tap access.
          </p>
        </div>
        <button
          onClick={handleInstall}
          className="shrink-0 rounded-full bg-paper px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink transition-all hover:bg-paper/90 active:scale-[0.97]"
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-paper/60 transition-colors hover:bg-paper/10 hover:text-paper"
          aria-label="Dismiss"
        >
          <X size={14} strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}
