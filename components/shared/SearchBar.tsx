"use client"

import { useState, useCallback, useRef } from "react"
import { Search, X, MapPin } from "lucide-react"

type SearchResult = {
  place_name: string
  center: [number, number]
}

type SearchBarProps = {
  onSelect: (center: [number, number]) => void
}

export function SearchBar({ onSelect }: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = useCallback(async (text: string) => {
    if (text.length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(text)}.json?access_token=${token}&country=au&bbox=152.6,-27.8,153.5,-27.0&types=locality,neighborhood,place&limit=5`

    try {
      const res = await fetch(url)
      const data = await res.json()
      const features = (data.features || []).map((f: { place_name: string; center: [number, number] }) => ({
        place_name: f.place_name,
        center: f.center,
      }))
      setResults(features)
      setIsOpen(features.length > 0)
    } catch {
      setResults([])
      setIsOpen(false)
    }
  }, [])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const text = e.target.value
      setQuery(text)

      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => search(text), 300)
    },
    [search]
  )

  const handleSelect = useCallback(
    (result: SearchResult) => {
      setQuery(result.place_name.split(",")[0])
      setIsOpen(false)
      setResults([])
      onSelect(result.center)
    },
    [onSelect]
  )

  const handleClear = useCallback(() => {
    setQuery("")
    setResults([])
    setIsOpen(false)
  }, [])

  return (
    <div className="absolute left-3 right-3 top-3 z-10">
      <div className="relative">
        <div
          className={`glass flex items-center gap-2.5 rounded-full px-4 py-2.5 shadow-[0_4px_20px_rgba(20,20,23,0.06)] transition-all ${
            focused ? "ring-1 ring-ink/15" : ""
          }`}
        >
          <Search size={15} className="shrink-0 text-ink-soft" strokeWidth={2} />
          <input
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={() => {
              setFocused(true)
              if (results.length > 0) setIsOpen(true)
            }}
            onBlur={() => setFocused(false)}
            placeholder="Search a suburb…"
            className="flex-1 bg-transparent text-[13px] tracking-tight text-ink outline-none placeholder:text-ink-muted"
          />
          {query && (
            <button
              onClick={handleClear}
              className="shrink-0 text-ink-muted transition-colors hover:text-ink"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {isOpen && (
          <div className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-2xl border border-rule bg-surface shadow-xl shadow-black/5 animate-fade-in">
            {results.map((result, i) => (
              <button
                key={i}
                onClick={() => handleSelect(result)}
                className="flex w-full items-start gap-3 border-b border-rule/60 px-4 py-3 text-left transition-colors last:border-0 hover:bg-paper-dim"
              >
                <MapPin
                  size={13}
                  className="mt-0.5 shrink-0 text-ink-muted"
                  strokeWidth={1.75}
                />
                <span className="text-[13px] leading-tight text-ink">
                  {result.place_name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
