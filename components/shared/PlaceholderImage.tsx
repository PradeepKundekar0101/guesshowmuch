type PlaceholderImageProps = {
  className?: string
  size?: "sm" | "md" | "lg"
}

const sizeMap = {
  sm: "text-2xl",
  md: "text-4xl",
  lg: "text-6xl",
}

export function PlaceholderImage({ className = "", size = "md" }: PlaceholderImageProps) {
  return (
    <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
      <span className={sizeMap[size]}>🍽️</span>
    </div>
  )
}
