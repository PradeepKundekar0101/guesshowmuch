import Link from "next/link"
import { Plus } from "lucide-react"

export function FloatingSubmitButton() {
  return (
    <Link
      href="/submit"
      className="group absolute bottom-32 right-3 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-ink text-paper shadow-[0_6px_20px_rgba(20,20,23,0.25)] transition-all hover:scale-105 hover:shadow-[0_8px_28px_rgba(20,20,23,0.35)] active:scale-95"
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
