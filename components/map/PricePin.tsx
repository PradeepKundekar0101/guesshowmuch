import { formatPrice } from "@/lib/utils/price"

const PIN_COLORS: Record<string, string> = {
  standard: "#10b981",
  featured: "#f59e0b",
  hot_deal: "#ef4444",
  top_rated: "#8b5cf6",
}

export function createPricePinElement(
  price: number,
  isActive: boolean = false,
  pinType: string = "standard"
): HTMLElement {
  const baseColor = PIN_COLORS[pinType] || PIN_COLORS.standard
  const color = isActive ? "#0d9488" : baseColor

  const wrapper = document.createElement("div")
  wrapper.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    width: max-content;
  `

  const pin = document.createElement("div")
  pin.style.cssText = `
    background: ${color};
    color: white;
    padding: 5px 10px;
    border-radius: 20px;
    font-weight: 700;
    font-size: 12px;
    font-family: system-ui, -apple-system, sans-serif;
    box-shadow: 0 2px 8px rgba(0,0,0,0.25);
    white-space: nowrap;
    display: inline-block;
    transition: transform 0.15s ease;
    transform: ${isActive ? "scale(1.15)" : "scale(1)"};
    border: 2px solid ${isActive ? "white" : "transparent"};
    line-height: 1;
  `

  const label = pinType === "featured" && !isActive ? `★ ${formatPrice(price)}` : formatPrice(price)
  pin.textContent = label

  const arrow = document.createElement("div")
  arrow.style.cssText = `
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid ${color};
    margin-top: -1px;
  `

  wrapper.appendChild(pin)
  wrapper.appendChild(arrow)
  return wrapper
}
