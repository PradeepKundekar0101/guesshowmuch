import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { CsvImportForm } from "@/components/import/CsvImportForm"

export default function ImportPage() {
  return (
    <div className="min-h-dvh bg-paper">
      <header className="sticky top-0 z-10 border-b border-rule bg-paper/95 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-paper-dim"
            aria-label="Back to map"
          >
            <ArrowLeft size={18} strokeWidth={1.75} />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="eyebrow">Admin</p>
            <h1 className="font-display text-[20px] leading-tight tracking-tight text-ink">
              CSV import
            </h1>
          </div>
        </div>
      </header>
      <div className="px-5 pb-10 pt-6">
        <CsvImportForm />
      </div>
    </div>
  )
}
