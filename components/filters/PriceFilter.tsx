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
    <div className="absolute bottom-16 left-3 right-3 flex items-center gap-2 rounded-2xl bg-white/95 px-3 py-2.5 shadow-lg backdrop-blur-sm">
      {PRESETS.map((preset) => (
        <button
          key={preset}
          onClick={() => handlePresetClick(preset)}
          className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
            activePreset === preset
              ? "bg-emerald-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          ${preset}
        </button>
      ))}
      <input
        type="range"
        min={1}
        max={15}
        step={0.5}
        value={value}
        onChange={handleSliderChange}
        className="ml-1 h-1 flex-1 cursor-pointer appearance-none rounded-full bg-gray-200 accent-emerald-500"
        aria-label="Price filter slider"
      />
    </div>
  )
}
