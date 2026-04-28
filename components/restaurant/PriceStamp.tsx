import { CheckCircle, AlertTriangle } from "lucide-react"
import { getVerificationStatus } from "@/lib/utils/price"

type PriceStampProps = {
  verifiedAt: string
}

export function PriceStamp({ verifiedAt }: PriceStampProps) {
  const { label, isStale } = getVerificationStatus(verifiedAt)

  if (isStale) {
    return (
      <div className="mt-2.5 flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
        <AlertTriangle size={13} />
        <span>{label}</span>
      </div>
    )
  }

  return (
    <div className="mt-2.5 flex items-center gap-1.5">
      <CheckCircle size={14} className="text-emerald-500" />
      <span className="text-sm font-medium text-emerald-600">{label}</span>
    </div>
  )
}
