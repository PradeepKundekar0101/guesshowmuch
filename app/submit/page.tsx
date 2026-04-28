import Link from "next/link"
import { SubmitForm } from "@/components/submit/SubmitForm"

export default function SubmitPage() {
  return (
    <div className="min-h-dvh bg-white">
      <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
        <Link href="/" className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-lg transition-colors hover:bg-gray-200">←</Link>
        <h1 className="text-lg font-bold text-gray-900">Add a Cheap Eat</h1>
      </div>
      <div className="px-5 py-6">
        <SubmitForm />
      </div>
    </div>
  )
}
