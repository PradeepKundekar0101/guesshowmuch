"use client"

type WelcomeScreenProps = {
  onContinue: () => void
}

const features = [
  { icon: "🗺️", text: "Browse cheap eats on a live map" },
  { icon: "🏷️", text: "Filter by price — $5, $8, $12, $15" },
  { icon: "👥", text: "Community-verified prices" },
]

export function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-8 py-12 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500 text-4xl">
        💰
      </div>

      <h1 className="mt-6 text-3xl font-extrabold text-gray-900">
        Guess How Much?
      </h1>
      <p className="mt-3 max-w-[280px] text-base leading-relaxed text-gray-500">
        Find genuinely cheap takeaway food near you. Everything under $15,
        verified by the community.
      </p>

      <div className="mt-8 w-full max-w-[280px] text-left">
        {features.map((feature) => (
          <div
            key={feature.text}
            className="flex items-center gap-3 py-2.5"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-lg">
              {feature.icon}
            </div>
            <span className="text-sm text-gray-600">{feature.text}</span>
          </div>
        ))}
      </div>

      <div className="mt-10 w-full max-w-[280px]">
        <button
          onClick={onContinue}
          className="w-full rounded-2xl bg-emerald-500 px-6 py-4 text-base font-bold text-white transition-colors hover:bg-emerald-600"
        >
          Get Started
        </button>
        <p className="mt-2.5 text-xs text-gray-400">
          No account needed to browse
        </p>
      </div>
    </div>
  )
}
