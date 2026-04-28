import { formatPrice } from "@/lib/utils/price"

export function createPricePinElement(price: number, isActive: boolean = false): HTMLElement {
  const wrapper = document.createElement("div")
  wrapper.className = "price-pin-wrapper"
  wrapper.style.cursor = "pointer"

  const pin = document.createElement("div")
  pin.style.cssText = `
    background: ${isActive ? "#f59e0b" : "#10b981"};
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

  const arrow = document.createElement("div")
  arrow.style.cssText = `
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid ${isActive ? "#f59e0b" : "#10b981"};
    margin: 0 auto;
    transition: border-top-color 0.2s;
  `

  wrapper.appendChild(pin)
  wrapper.appendChild(arrow)
  return wrapper
}
