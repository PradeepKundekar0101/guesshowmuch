import { formatPrice } from "@/lib/utils/price"
import {
  MAP_STANDARD_TIER,
  MAP_VARIANT_LOOK,
  type MapPinType,
  type MapPriceTier,
} from "@/lib/constants/mapPins"

function tierFor(price: number): MapPriceTier {
  if (price <= 5) return "steal"
  if (price <= 10) return "good"
  if (price <= 15) return "ok"
  return "premium"
}

// Cuisine → emoji for at-a-glance variety (community-sourced vibes).
const CUISINE_EMOJI: Record<string, string> = {
  Vietnamese: "🍜",
  Thai: "🌶️",
  Japanese: "🍣",
  Chinese: "🥟",
  Korean: "🍚",
  Malaysian: "🍛",
  Taiwanese: "🧋",
  "Asian Fusion": "🥢",
  Indian: "🍛",
  "Middle Eastern": "🥙",
  Mexican: "🌮",
  Italian: "🍕",
  Greek: "🫒",
  Australian: "🥧",
  Vegetarian: "🥬",
  Other: "🍽️",
}

const ICONS = {
  star: `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5l2.94 6.32 6.96.73-5.21 4.7 1.49 6.84L12 17.78l-6.18 3.31 1.49-6.84L2.1 9.55l6.96-.73L12 2.5z"/></svg>`,
  flame: `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2c.4 3 3.7 4 3.7 8 0 1.7-.7 3-1.6 3.8.5-1.6.1-3.2-1.1-4.6-1.4 2.6-3.5 3.4-3.5 6.3 0 1.4.6 2.7 1.7 3.5C8.6 18.5 7 16.4 7 13.6 7 8.7 11.6 7.7 12 2z"/></svg>`,
  heart: `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
} as const

export function createPricePinElement(
  price: number,
  isActive: boolean = false,
  pinType: MapPinType = "standard",
  cuisineType: string | null = null
): HTMLElement {
  const tierTheme = MAP_STANDARD_TIER[tierFor(price)]
  let theme = tierTheme
  let accentHtml: string | null = null
  let accentStripBg = "#f59e0b"

  if (pinType !== "standard") {
    const v = MAP_VARIANT_LOOK[pinType]
    theme = {
      bg: v.bg,
      fg: v.fg,
      ring: v.ring,
    }
    accentStripBg = v.accentBg
    accentHtml = ICONS[v.icon]
  }

  const cuisineEmoji = cuisineType ? (CUISINE_EMOJI[cuisineType] ?? "🍽️") : "🍽️"

  const wrapper = document.createElement("div")
  wrapper.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    width: max-content;
    transform-origin: bottom center;
    transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
    transform: ${isActive ? "scale(1.2) translateY(-3px)" : "scale(1)"};
    filter: drop-shadow(0 ${isActive ? "10px 20px" : "5px 14px"} rgba(80, 30, 8, ${isActive ? "0.28" : "0.18"}));
  `

  const pin = document.createElement("div")
  pin.style.cssText = `
    display: inline-flex;
    align-items: stretch;
    background: ${theme.bg};
    color: ${theme.fg};
    border-radius: 999px;
    font-family: 'Roboto', ui-sans-serif, system-ui, sans-serif;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    font-size: 11.5px;
    letter-spacing: -0.01em;
    line-height: 1;
    overflow: hidden;
    border: 2px solid ${isActive ? theme.ring : "rgba(255, 255, 255, 0.35)"};
  `

  if (accentHtml) {
    const accent = document.createElement("div")
    accent.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
      background: ${accentStripBg};
      color: ${pinType === "featured" ? "#fffaf5" : "#1a0a06"};
      padding: 0 6px;
    `
    accent.innerHTML = accentHtml
    pin.appendChild(accent)
  } else {
    const emojiCell = document.createElement("div")
    emojiCell.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
      align-self: center;
      margin-left: 6px;
      font-size: 13px;
      line-height: 1;
      filter: drop-shadow(0 0 1px ${theme.bg});
    `
    emojiCell.textContent = cuisineEmoji
    emojiCell.setAttribute("aria-hidden", "true")
    pin.appendChild(emojiCell)
  }

  const label = document.createElement("div")
  label.style.cssText = `
    padding: 7px 12px 7px ${accentHtml ? "8px" : "6px"};
    display: flex;
    align-items: center;
  `
  label.textContent = formatPrice(price)
  pin.appendChild(label)

  const arrow = document.createElement("div")
  arrow.style.cssText = `
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 7px solid ${theme.bg};
    margin-top: -1px;
  `

  wrapper.appendChild(pin)
  wrapper.appendChild(arrow)

  wrapper.setAttribute("role", "button")
  const pinKind =
    pinType === "standard"
      ? "Restaurant"
      : pinType === "hot_deal"
        ? "Hot deal"
        : pinType === "top_rated"
          ? "Top rated"
          : "Featured"
  wrapper.setAttribute("aria-label", `${pinKind}, ${formatPrice(price)}`)

  return wrapper
}
