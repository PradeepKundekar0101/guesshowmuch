import { getActiveRestaurants } from "@/lib/queries/restaurants"
import { SavedList } from "@/components/saved/SavedList"

export default async function SavedPage() {
  const allRestaurants = await getActiveRestaurants()

  return (
    <div className="min-h-dvh bg-gray-50 pb-20">
      <div className="border-b border-gray-100 bg-white px-5 py-4">
        <h1 className="text-lg font-bold text-gray-900">❤️ Saved</h1>
        <p className="mt-0.5 text-xs text-gray-400">Your bookmarked restaurants</p>
      </div>
      <div className="px-4 py-4">
        <SavedList allRestaurants={allRestaurants} />
      </div>
    </div>
  )
}
