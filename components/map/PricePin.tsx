import { formatPrice } from "@/lib/utils/price"

const PIN_COLORS = {
  standard: "#10b981",
  featured: "#f59e0b",
  hot_deal: "#ef4444",
  top_rated: "#8b5cf6",
} as const

export function createPricePinElement(
  price: number,
  isActive: boolean = false,
  pinType: string = "standard"
): HTMLElement {
  const baseColor = PIN_COLORS[pinType as keyof typeof PIN_COLORS] || PIN_COLORS.standard
  const activeColor = "#f59e0b"
  const color = isActive ? activeColor : baseColor

  const wrapper = document.createElement("div")
  wrapper.className = "price-pin-wrapper"
  wrapper.style.cursor = "pointer"

  const pin = document.createElement("div")
  pin.style.cssText = `
    background: ${color};
    color: white;
    padding: 4px 10px;
    border-radius: 16px;
    font-weight: 700;
    font-size: 13px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    white-space: nowrap;
    transition: background 0.2s, transform 0.2s;
    transform: ${isActive ? "scale(1.15)" : "scale(1)"};
  `
  pin.textContent = formatPrice(price)

  // Add star for featured pins
  if (pinType === "featured" && !isActive) {
    pin.textContent = `⭐ ${formatPrice(price)}`
  }

  const arrow = document.createElement("div")
  arrow.style.cssText = `
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid ${color};
    margin: 0 auto;
    transition: border-top-color 0.2s;
  `

  wrapper.appendChild(pin)
  wrapper.appendChild(arrow)
  return wrapper
}
