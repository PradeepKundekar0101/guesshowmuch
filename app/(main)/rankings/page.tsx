import { getSuburbRankings } from "@/lib/queries/rankings"
import { SuburbRankings } from "@/components/rankings/SuburbRankings"

export default async function RankingsPage() {
  const rankings = await getSuburbRankings()

  return (
    <div className="min-h-dvh bg-gray-50 pb-20">
      <div className="border-b border-gray-100 bg-white px-5 py-4">
        <h1 className="text-lg font-bold text-gray-900">🏆 Popular Suburbs</h1>
        <p className="mt-0.5 text-xs text-gray-400">Ranked by community votes</p>
      </div>
      <div className="px-4 py-4">
        <SuburbRankings rankings={rankings} />
      </div>
    </div>
  )
}
