"use client"

import { useState, useCallback } from "react"

const PRESETS = [5, 10, 15, 20, 30] as const
const MAX_PRICE = 30
const MIN_PRICE = 1

type PriceFilterProps = {
  value: number
  onChange: (price: number) => void
}

export function PriceFilter({ value, onChange }: PriceFilterProps) {
  const [activePreset, setActivePreset] = useState<number | null>(15)

  const handlePresetClick = useCallback(
    (preset: number) => {
      setActivePreset(preset)
      onChange(preset)
    },
    [onChange]
  )

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(e.target.value)
      setActivePreset(null)
      onChange(newValue)
    },
    [onChange]
  )

  return (
    <div className="glass absolute bottom-16 left-3 right-3 rounded-2xl px-3.5 py-2.5 shadow-[0_8px_30px_rgba(20,20,23,0.08)]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          {PRESETS.map((preset) => (
            <button
              key={preset}
              onClick={() => handlePresetClick(preset)}
              className={`price-num rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-tight transition-all ${
                activePreset === preset
                  ? "bg-brand text-white"
                  : "bg-paper-dim text-ink-soft hover:bg-rule"
              }`}
            >
              ${preset}
            </button>
          ))}
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-[10px] uppercase tracking-[0.1em] text-ink-muted">
            Under
          </span>
          <span className="price-num text-[15px] font-semibold leading-none text-ink">
            ${value.toFixed(value % 1 === 0 ? 0 : 2)}
          </span>
        </div>
      </div>

      <input
        type="range"
        min={MIN_PRICE}
        max={MAX_PRICE}
        step={0.5}
        value={value}
        onChange={handleSliderChange}
        className="editorial mt-1.5 w-full"
        aria-label="Price filter slider"
      />

      <div className="mt-1 flex items-center justify-between text-[9px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
        <span className="inline-flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-pin-steal" />
          Steal ≤$5
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-pin-good" />
          $5–10
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-pin-ok" />
          $10–15
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-pin-premium" />
          $15+
        </span>
      </div>
    </div>
  )
}
