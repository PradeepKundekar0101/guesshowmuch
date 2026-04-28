import { getActiveRestaurants } from "@/lib/queries/restaurants"
import { SavedList } from "@/components/saved/SavedList"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function SavedPage() {
  const allRestaurants = await getActiveRestaurants()

  return (
    <div className="min-h-dvh bg-paper pb-20">
      <header className="border-b border-rule bg-paper/95 backdrop-blur-sm">
        <div className="mx-auto max-w-md px-5 pt-7 pb-5">
          <p className="eyebrow">Your library</p>
          <h1 className="mt-1 font-display text-[34px] leading-[0.95] tracking-tight text-ink">
            Your <em>kept</em> places
          </h1>
          <p className="mt-1.5 max-w-[280px] text-[13px] leading-snug text-ink-soft">
            Restaurants you bookmarked for later, in one quiet list.
          </p>
        </div>
      </header>
      <div className="mx-auto max-w-md px-4 py-5">
        <SavedList allRestaurants={allRestaurants} />
      </div>
    </div>
  )
}
