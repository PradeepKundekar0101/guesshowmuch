import { formatPrice } from "@/lib/utils/price"

type Tier = "steal" | "good" | "ok" | "premium"

const TIER_COLORS: Record<Tier, { bg: string; fg: string; ring: string }> = {
  steal: {
    bg: "#1f7a4f",
    fg: "#ecf6f0",
    ring: "rgba(255,255,255,0.85)",
  },
  good: {
    bg: "#16151a",
    fg: "#faf7f0",
    ring: "rgba(255,255,255,0.85)",
  },
  ok: {
    bg: "#a13522",
    fg: "#fcecea",
    ring: "rgba(255,255,255,0.85)",
  },
  premium: {
    bg: "#7a5410",
    fg: "#fbf4e1",
    ring: "rgba(255,255,255,0.85)",
  },
}

function tierFor(price: number): Tier {
  if (price <= 5) return "steal"
  if (price <= 10) return "good"
  if (price <= 15) return "ok"
  return "premium"
}

// Cuisine → emoji for at-a-glance variety (replaces colored accent dot).
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

const STAR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5l2.94 6.32 6.96.73-5.21 4.7 1.49 6.84L12 17.78l-6.18 3.31 1.49-6.84L2.1 9.55l6.96-.73L12 2.5z"/></svg>`

const FLAME_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c.4 3 3.7 4 3.7 8 0 1.7-.7 3-1.6 3.8.5-1.6.1-3.2-1.1-4.6-1.4 2.6-3.5 3.4-3.5 6.3 0 1.4.6 2.7 1.7 3.5C8.6 18.5 7 16.4 7 13.6 7 8.7 11.6 7.7 12 2z"/></svg>`

export function createPricePinElement(
  price: number,
  isActive: boolean = false,
  pinType: string = "standard",
  cuisineType: string | null = null
): HTMLElement {
  // pin_type overrides (featured / hot_deal use icon strip; top_rated uses purple theme + cuisine emoji)
  let theme = TIER_COLORS[tierFor(price)]
  let accentBg = "#9ca3af"
  const cuisineEmoji = cuisineType ? CUISINE_EMOJI[cuisineType] ?? "🍽️" : "🍽️"
  let accentIcon: "star" | "flame" | null = null

  if (pinType === "featured") {
    theme = TIER_COLORS.premium
    accentBg = "#b8821a"
    accentIcon = "star"
  } else if (pinType === "hot_deal") {
    theme = { bg: "#7e291a", fg: "#fcecea", ring: "rgba(255,255,255,0.9)" }
    accentBg = "#ef4444"
    accentIcon = "flame"
  } else if (pinType === "top_rated") {
    theme = { bg: "#3a2360", fg: "#f0eafe", ring: "rgba(255,255,255,0.9)" }
  }

  const wrapper = document.createElement("div")
  wrapper.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    width: max-content;
    transform-origin: bottom center;
    transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    transform: ${isActive ? "scale(1.22) translateY(-2px)" : "scale(1)"};
    filter: drop-shadow(0 ${isActive ? "10px 18px" : "5px 12px"} rgba(20, 20, 23, ${isActive ? "0.32" : "0.22"}));
  `

  const pin = document.createElement("div")
  pin.style.cssText = `
    display: inline-flex;
    align-items: stretch;
    background: ${theme.bg};
    color: ${theme.fg};
    border-radius: 999px;
    font-family: 'JetBrains Mono', ui-monospace, SF Mono, Menlo, monospace;
    font-weight: 600;
    font-size: 11.5px;
    letter-spacing: -0.01em;
    line-height: 1;
    overflow: hidden;
    border: 1.5px solid ${isActive ? theme.ring : "rgba(250, 247, 240, 0.18)"};
  `

  // Accent: small icon for special types, otherwise a cuisine-coloured dot
  if (accentIcon) {
    const accent = document.createElement("div")
    accent.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
      background: ${accentBg};
      color: white;
      padding: 0 6px;
    `
    accent.innerHTML = accentIcon === "star" ? STAR_SVG : FLAME_SVG
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
    padding: 6px 11px 6px ${accentIcon ? "9px" : "7px"};
    display: flex;
    align-items: center;
  `
  label.textContent = formatPrice(price)
  pin.appendChild(label)

  const arrow = document.createElement("div")
  arrow.style.cssText = `
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 6px solid ${theme.bg};
    margin-top: -1px;
  `

  wrapper.appendChild(pin)
  wrapper.appendChild(arrow)
  return wrapper
}
