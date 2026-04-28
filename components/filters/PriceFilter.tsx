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
    <div className="absolute bottom-16 left-3 right-3 flex items-center gap-1.5 rounded-2xl border border-gray-100 bg-white px-3 py-2 shadow-lg">
      <span className="mr-1 text-xs font-medium text-gray-400">Under</span>
      {PRESETS.map((preset) => (
        <button
          key={preset}
          onClick={() => handlePresetClick(preset)}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
            activePreset === preset
              ? "bg-emerald-500 text-white shadow-sm"
              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
          }`}
        >
          ${preset}
        </button>
      ))}
      <div className="relative ml-2 flex-1">
        <input
          type="range"
          min={1}
          max={15}
          step={0.5}
          value={value}
          onChange={handleSliderChange}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-emerald-500"
          aria-label="Price filter slider"
        />
      </div>
    </div>
  )
}
