"use client"

import { Map as MapIcon, Tags, Users, ArrowRight } from "lucide-react"

type WelcomeScreenProps = {
  onContinue: () => void
}

const features = [
  { icon: MapIcon, text: "A live map of cheap eats near you — tap a pin and go." },
  { icon: Tags, text: "Filter by price till your wallet sings." },
  { icon: Users, text: "Real locals, rough receipts, zero corporate fluff." },
]

export function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  return (
    <div className="min-h-dvh bg-paper">
      <div className="paper-grain relative mx-auto flex min-h-dvh max-w-md flex-col px-7 pb-8 pt-14">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-ink-muted">
          Brisbane · Vol. 01
        </p>

        <div className="mt-10 animate-rise-in">
          <h1 className="font-display text-[64px] leading-[0.9] tracking-tight text-ink">
            Guess
            <br />
            how <em className="text-brand italic">much</em>
            <span className="text-ink">?</span>
          </h1>
          <div className="mt-6 h-px w-16 rounded-full bg-brand" />
          <p className="mt-6 max-w-[300px] text-[15px] leading-relaxed text-ink-soft">
            A cheerfully obsessive guide to the cheapest takeaway in town.
            <span className="font-medium text-ink"> Everything under $15</span> —
            crowdfunded appetite, not sponsored lists.
          </p>
        </div>

        <ul
          className="mt-10 space-y-4 animate-rise-in"
          style={{ animationDelay: "120ms" }}
        >
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <li key={feature.text} className="flex items-start gap-4">
                <span className="price-num mt-1 w-6 shrink-0 text-[11px] font-semibold text-ink-muted">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-rule bg-surface">
                  <Icon size={15} strokeWidth={1.75} className="text-ink" />
                </span>
                <span className="pt-1 text-[14px] leading-snug text-ink">
                  {feature.text}
                </span>
              </li>
            )
          })}
        </ul>

        <div className="flex-1" />

        <div
          className="mt-10 animate-rise-in"
          style={{ animationDelay: "240ms" }}
        >
          <button
            onClick={onContinue}
            className="group flex w-full items-center justify-between rounded-full bg-brand px-6 py-4 text-white transition-all hover:bg-brand-hover active:scale-[0.99]"
          >
            <span className="text-[14px] font-semibold tracking-tight">
              Show me cheap food
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-brand transition-transform group-hover:translate-x-0.5">
              <ArrowRight size={15} strokeWidth={2} />
            </span>
          </button>
          <p className="mt-3 text-center text-[11px] uppercase tracking-[0.12em] text-ink-muted">
            Free · No account required to browse
          </p>
        </div>
      </div>
    </div>
  )
}
