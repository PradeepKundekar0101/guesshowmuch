import { UtensilsCrossed } from "lucide-react"

type PlaceholderImageProps = {
  className?: string
  size?: "sm" | "md" | "lg"
}

const iconSizes = {
  sm: 20,
  md: 32,
  lg: 48,
}

export function PlaceholderImage({ className = "", size = "md" }: PlaceholderImageProps) {
  return (
    <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
      <UtensilsCrossed size={iconSizes[size]} className="text-gray-300" />
    </div>
  )
}
