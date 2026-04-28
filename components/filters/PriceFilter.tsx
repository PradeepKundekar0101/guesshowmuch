"use client"

import { useState, useCallback } from "react"

const PRESETS = [5, 8, 12, 15] as const

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
    <div className="glass absolute bottom-16 left-3 right-3 rounded-2xl px-4 py-3 shadow-[0_8px_30px_rgba(20,20,23,0.08)]">
      <div className="flex items-baseline justify-between">
        <span className="eyebrow">Show me under</span>
        <span className="font-display text-lg leading-none text-ink">
          ${value.toFixed(value % 1 === 0 ? 0 : 2)}
        </span>
      </div>

      <div className="mt-2.5 flex items-center gap-1.5">
        {PRESETS.map((preset) => (
          <button
            key={preset}
            onClick={() => handlePresetClick(preset)}
            className={`flex-1 rounded-full py-1.5 text-[11px] font-semibold tracking-tight transition-all ${
              activePreset === preset
                ? "bg-ink text-paper"
                : "bg-paper-dim text-ink-soft hover:bg-rule"
            }`}
          >
            ${preset}
          </button>
        ))}
      </div>

      <input
        type="range"
        min={1}
        max={15}
        step={0.5}
        value={value}
        onChange={handleSliderChange}
        className="editorial mt-2 w-full"
        aria-label="Price filter slider"
      />
    </div>
  )
}
