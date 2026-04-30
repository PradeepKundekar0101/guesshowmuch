import Link from "next/link"
import { Plus } from "lucide-react"

export function FloatingSubmitButton() {
  return (
    <Link
      href="/submit"
      className="group absolute bottom-32 right-3 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white shadow-[0_8px_24px_rgba(255,80,0,0.42)] transition-all hover:scale-105 hover:bg-brand-hover hover:shadow-[0_10px_30px_rgba(255,80,0,0.5)] active:scale-95"
      aria-label="Submit a restaurant"
    >
      <Plus
        size={20}
        strokeWidth={2.25}
        className="transition-transform group-hover:rotate-90"
      />
    </Link>
  )
}
