"use client"

import { useState, useCallback, useRef } from "react"
import { Search, X } from "lucide-react"

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
        <div className="flex items-center gap-2.5 rounded-xl border border-gray-100 bg-white px-3.5 py-2.5 shadow-lg">
          <Search size={16} className="shrink-0 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={() => results.length > 0 && setIsOpen(true)}
            placeholder="Search suburb or area..."
            className="flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
          />
          {query && (
            <button onClick={handleClear} className="shrink-0 text-gray-300 hover:text-gray-500">
              <X size={16} />
            </button>
          )}
        </div>

        {isOpen && (
          <div className="absolute left-0 right-0 top-full mt-1.5 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl">
            {results.map((result, i) => (
              <button
                key={i}
                onClick={() => handleSelect(result)}
                className="block w-full border-b border-gray-50 px-4 py-3 text-left text-sm text-gray-700 transition-colors last:border-0 hover:bg-gray-50"
              >
                {result.place_name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
