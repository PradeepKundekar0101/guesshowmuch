import Link from "next/link"
import { Plus } from "lucide-react"
import { getActiveDeals } from "@/lib/queries/deals"
import { DealsList } from "@/components/deals/DealsList"

export default async function DealsPage() {
  const deals = await getActiveDeals()

  return (
    <div className="min-h-dvh bg-paper pb-20">
      <header className="border-b border-rule bg-paper/95 backdrop-blur-sm">
        <div className="mx-auto max-w-md px-5 pt-7 pb-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="eyebrow">Hot today · {deals.length} live</p>
              <h1 className="mt-1 font-display text-[34px] leading-[0.95] tracking-tight text-ink">
                Deals on <em className="text-cinnabar-500">now</em>
              </h1>
              <p className="mt-1.5 max-w-[280px] text-[13px] leading-snug text-ink-soft">
                Time-limited specials posted by the community.
              </p>
            </div>
            <Link
              href="/deals/submit"
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-ink px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-paper transition-all hover:bg-cinnabar-500 active:scale-95"
            >
              <Plus size={12} strokeWidth={2.5} />
              Add
            </Link>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-md px-4 py-5">
        <DealsList deals={deals} />
      </div>
    </div>
  )
}
