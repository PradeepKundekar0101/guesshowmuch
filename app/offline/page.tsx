import { WifiOff } from "lucide-react"

export default function OfflinePage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-paper px-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-rule bg-paper-dim">
        <WifiOff size={22} strokeWidth={1.5} className="text-ink-soft" />
      </div>
      <h1 className="mt-5 font-display text-[32px] leading-tight tracking-tight text-ink">
        You&apos;re offline
      </h1>
      <p className="mt-2 max-w-[260px] text-[14px] leading-relaxed text-ink-soft">
        Check the connection and we&apos;ll bring the map back as soon as
        you&apos;re online.
      </p>
    </div>
  )
}
