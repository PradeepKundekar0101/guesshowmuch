import Link from "next/link"
import { Plus } from "lucide-react"

export function FloatingSubmitButton() {
  return (
    <Link
      href="/submit"
      className="absolute bottom-32 right-3 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg transition-all hover:bg-emerald-600 hover:shadow-xl active:scale-95"
      aria-label="Submit a restaurant"
    >
      <Plus size={24} strokeWidth={2.5} />
    </Link>
  )
}
