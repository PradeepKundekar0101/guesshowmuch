import Link from "next/link"
import { DealSubmitForm } from "@/components/deals/DealSubmitForm"

export default function DealSubmitPage() {
  return (
    <div className="min-h-dvh bg-white">
      <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
        <Link href="/deals" className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-lg transition-colors hover:bg-gray-200">←</Link>
        <h1 className="text-lg font-bold text-gray-900">Add a Hot Deal</h1>
      </div>
      <div className="px-5 py-6">
        <DealSubmitForm />
      </div>
    </div>
  )
}
