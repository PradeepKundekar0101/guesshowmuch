import Link from "next/link"
import { ArrowLeft, UtensilsCrossed } from "lucide-react"

export default function RestaurantNotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-paper px-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-rule bg-paper-dim">
        <UtensilsCrossed size={22} strokeWidth={1.5} className="text-ink-soft" />
      </div>
      <h1 className="mt-5 font-display text-[32px] leading-tight tracking-tight text-ink">
        Listing not found
      </h1>
      <p className="mt-2 max-w-[280px] text-[14px] leading-relaxed text-ink-soft">
        This spot may have been removed, or the link has gone cold.
      </p>
      <Link
        href="/"
        className="mt-7 inline-flex items-center gap-1.5 rounded-full bg-brand px-5 py-2.5 text-[13px] font-semibold tracking-tight text-white transition-all hover:bg-brand-hover active:scale-[0.98]"
      >
        <ArrowLeft size={14} strokeWidth={2} />
        Back to the map
      </Link>
    </div>
  )
}
