import { CheckCircle2, AlertTriangle } from "lucide-react"
import { getVerificationStatus } from "@/lib/utils/price"

type PriceStampProps = {
  verifiedAt: string
}

export function PriceStamp({ verifiedAt }: PriceStampProps) {
  const { label, isStale } = getVerificationStatus(verifiedAt)

  if (isStale) {
    return (
      <div className="mt-3 flex items-start gap-2 rounded-xl border border-gold-300/40 bg-gold-50/60 px-3 py-2 text-[12px] text-gold-700">
        <AlertTriangle size={13} strokeWidth={2} className="mt-0.5 shrink-0" />
        <span className="leading-snug">{label}</span>
      </div>
    )
  }

  return (
    <div className="mt-3 flex items-center gap-1.5 text-[12px] font-medium text-emerald-600">
      <CheckCircle2 size={13} strokeWidth={2} />
      <span>{label}</span>
    </div>
  )
}
