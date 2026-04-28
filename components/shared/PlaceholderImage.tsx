import { UtensilsCrossed } from "lucide-react"

type PlaceholderImageProps = {
  className?: string
  size?: "sm" | "md" | "lg"
}

const iconSizes = {
  sm: 18,
  md: 28,
  lg: 40,
}

export function PlaceholderImage({ className = "", size = "md" }: PlaceholderImageProps) {
  return (
    <div
      className={`flex items-center justify-center bg-paper-dim ${className}`}
    >
      <UtensilsCrossed
        size={iconSizes[size]}
        strokeWidth={1.25}
        className="text-ink-faint"
      />
    </div>
  )
}
