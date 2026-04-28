import Link from "next/link"

export default function RestaurantNotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-8 text-center">
      <span className="text-6xl">🍽️</span>
      <h1 className="mt-4 text-2xl font-bold text-gray-900">
        Restaurant not found
      </h1>
      <p className="mt-2 text-gray-500">
        This listing may have been removed or doesn't exist.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
      >
        Back to Map
      </Link>
    </div>
  )
}
