export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`
}

export function getDaysSinceVerified(verifiedAt: string): number {
  const now = new Date()
  const verified = new Date(verifiedAt)
  return Math.floor((now.getTime() - verified.getTime()) / (1000 * 60 * 60 * 24))
}

export function getVerificationStatus(verifiedAt: string): {
  label: string
  isStale: boolean
} {
  const days = getDaysSinceVerified(verifiedAt)

  if (days === 0) {
    return { label: "Verified today", isStale: false }
  }

  if (days < 90) {
    return { label: `Verified ${days} day${days === 1 ? "" : "s"} ago`, isStale: false }
  }

  return {
    label: "Price not verified in 90+ days — may be outdated",
    isStale: true,
  }
}
