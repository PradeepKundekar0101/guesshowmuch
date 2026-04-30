import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-paper px-8 text-center">
      <p className="price-num text-[88px] font-semibold leading-none text-ink-faint">
        404
      </p>
      <h1 className="mt-3 font-display text-[36px] leading-tight tracking-tight text-ink">
        Off the map
      </h1>
      <p className="mt-2 max-w-[300px] text-[14px] leading-relaxed text-ink-soft">
        This page doesn&apos;t exist — or maybe it moved on to cheaper pastures.
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
