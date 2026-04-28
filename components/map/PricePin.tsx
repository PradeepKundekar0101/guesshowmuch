import { formatPrice } from "@/lib/utils/price"

type PinTheme = {
  bg: string
  fg: string
  accentBg: string
  accentFg: string
  accentIcon: "star" | null
}

const THEMES: Record<string, PinTheme> = {
  standard: {
    bg: "#16151a",
    fg: "#faf7f0",
    accentBg: "#1f7a4f",
    accentFg: "#ecf6f0",
    accentIcon: null,
  },
  featured: {
    bg: "#16151a",
    fg: "#faf7f0",
    accentBg: "#b8821a",
    accentFg: "#fbf4e1",
    accentIcon: "star",
  },
  hot_deal: {
    bg: "#7e291a",
    fg: "#fcecea",
    accentBg: "#c2412a",
    accentFg: "#fcecea",
    accentIcon: null,
  },
  top_rated: {
    bg: "#3a2360",
    fg: "#f0eafe",
    accentBg: "#6b4dc7",
    accentFg: "#f0eafe",
    accentIcon: null,
  },
}

const STAR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5l2.94 6.32 6.96.73-5.21 4.7 1.49 6.84L12 17.78l-6.18 3.31 1.49-6.84L2.1 9.55l6.96-.73L12 2.5z"/></svg>`

export function createPricePinElement(
  price: number,
  isActive: boolean = false,
  pinType: string = "standard"
): HTMLElement {
  const theme = THEMES[pinType] || THEMES.standard

  const wrapper = document.createElement("div")
  wrapper.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    width: max-content;
    transform-origin: bottom center;
    transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    transform: ${isActive ? "scale(1.18)" : "scale(1)"};
    filter: drop-shadow(0 6px 14px rgba(20, 20, 23, 0.22));
  `

  const pin = document.createElement("div")
  pin.style.cssText = `
    display: inline-flex;
    align-items: stretch;
    background: ${theme.bg};
    color: ${theme.fg};
    border-radius: 999px;
    padding: 0;
    font-family: 'JetBrains Mono', ui-monospace, SF Mono, Menlo, monospace;
    font-weight: 600;
    font-size: 11.5px;
    letter-spacing: -0.01em;
    line-height: 1;
    overflow: hidden;
    border: 1.5px solid ${isActive ? "#faf7f0" : "rgba(250, 247, 240, 0.18)"};
  `

  if (theme.accentIcon === "star") {
    const accent = document.createElement("div")
    accent.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
      background: ${theme.accentBg};
      color: ${theme.accentFg};
      padding: 0 6px;
    `
    accent.innerHTML = STAR_SVG
    pin.appendChild(accent)
  } else {
    const dot = document.createElement("div")
    dot.style.cssText = `
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: ${theme.accentBg};
      align-self: center;
      margin-left: 9px;
    `
    pin.appendChild(dot)
  }

  const label = document.createElement("div")
  label.style.cssText = `
    padding: 6px 10px 6px ${theme.accentIcon ? "8px" : "6px"};
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
