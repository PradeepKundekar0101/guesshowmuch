import { getSuburbRankings } from "@/lib/queries/rankings"
import { SuburbRankings } from "@/components/rankings/SuburbRankings"

export default async function RankingsPage() {
  const rankings = await getSuburbRankings()

  return (
    <div className="min-h-dvh bg-paper pb-20">
      <header className="border-b border-rule bg-paper/95 backdrop-blur-sm">
        <div className="mx-auto max-w-md px-5 pt-7 pb-5">
          <p className="eyebrow">Brisbane · ranked by votes</p>
          <h1 className="mt-1 font-display text-[34px] leading-[0.95] tracking-tight text-ink">
            The cheapest <em>suburbs</em>
          </h1>
          <p className="mt-1.5 max-w-[300px] text-[13px] leading-snug text-ink-soft">
            A weekly read on which neighbourhoods the community is rating highest.
          </p>
        </div>
      </header>
      <div className="mx-auto max-w-md px-4 py-5">
        <SuburbRankings rankings={rankings} />
      </div>
    </div>
  )
}
