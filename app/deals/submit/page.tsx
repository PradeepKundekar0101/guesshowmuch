import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { DealSubmitForm } from "@/components/deals/DealSubmitForm"
import { getActiveRestaurants } from "@/lib/queries/restaurants"

export default async function DealSubmitPage() {
  const restaurants = await getActiveRestaurants()

  return (
    <div className="min-h-dvh bg-paper">
      <header className="sticky top-0 z-10 border-b border-rule bg-paper/95 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link
            href="/deals"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-paper-dim"
            aria-label="Back to deals"
          >
            <ArrowLeft size={18} strokeWidth={1.75} />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="eyebrow">Post a deal</p>
            <h1 className="font-display text-[20px] leading-tight tracking-tight text-ink">
              A new hot deal
            </h1>
          </div>
        </div>
      </header>
      <div className="px-5 pb-10 pt-6">
        <DealSubmitForm restaurants={restaurants} />
      </div>
    </div>
  )
}
