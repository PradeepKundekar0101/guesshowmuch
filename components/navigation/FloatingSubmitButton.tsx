import Link from "next/link"

export function FloatingSubmitButton() {
  return (
    <Link
      href="/submit"
      className="absolute bottom-32 right-3 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-2xl text-white shadow-lg transition-colors hover:bg-emerald-600"
      aria-label="Submit a restaurant"
    >
      +
    </Link>
  )
}
