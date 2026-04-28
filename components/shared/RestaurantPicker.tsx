"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import Image from "next/image"
import { Search, X, ChevronDown, Check } from "lucide-react"
import { PlaceholderImage } from "@/components/shared/PlaceholderImage"
import { formatPrice } from "@/lib/utils/price"
import type { Restaurant } from "@/lib/types/database"

type RestaurantPickerProps = {
  restaurants: Restaurant[]
  value: string | null
  onChange: (id: string | null) => void
  placeholder?: string
}

export function RestaurantPicker({
  restaurants,
  value,
  onChange,
  placeholder = "Pick a restaurant…",
}: RestaurantPickerProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = useMemo(
    () => restaurants.find((r) => r.id === value) ?? null,
    [restaurants, value]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return restaurants
    return restaurants.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.suburb?.toLowerCase().includes(q) ||
        r.dish_name.toLowerCase().includes(q) ||
        r.cuisine_type?.toLowerCase().includes(q)
    )
  }, [restaurants, query])

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  function handleSelect(id: string) {
    onChange(id)
    setOpen(false)
    setQuery("")
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation()
    onChange(null)
    setQuery("")
  }

  return (
    <div ref={containerRef} className="relative">
      {selected ? (
        <div className="flex w-full items-center gap-3 rounded-xl border border-rule bg-surface p-2">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex min-w-0 flex-1 items-center gap-3 text-left"
          >
            {selected.photo_url ? (
              <Image
                src={selected.photo_url}
                alt={selected.name}
                width={48}
                height={48}
                className="h-12 w-12 shrink-0 rounded-lg object-cover ring-1 ring-rule"
              />
            ) : (
              <PlaceholderImage className="h-12 w-12 shrink-0 rounded-lg ring-1 ring-rule" size="sm" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold text-ink">
                {selected.name}
              </p>
              <p className="truncate text-[11px] uppercase tracking-[0.08em] text-ink-muted">
                {selected.cuisine_type} · {selected.suburb}
                <span className="ml-1.5 text-ink-faint">·</span>
                <span className="price-num ml-1.5 normal-case tracking-tight text-ink-soft">
                  {formatPrice(selected.price)}
                </span>
              </p>
            </div>
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-paper-dim hover:text-ink"
            aria-label="Clear selection"
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-2 rounded-xl border border-rule bg-surface px-4 py-3 text-left text-[13px] text-ink-muted transition-colors hover:border-ink"
        >
          <span className="flex items-center gap-2">
            <Search size={14} strokeWidth={1.75} />
            {placeholder}
          </span>
          <ChevronDown
            size={15}
            strokeWidth={1.75}
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      )}

      {open && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-rule bg-surface shadow-xl shadow-black/5 animate-fade-in">
          <div className="flex items-center gap-2 border-b border-rule px-3 py-2">
            <Search size={14} strokeWidth={1.75} className="text-ink-muted" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, dish, suburb…"
              className="w-full bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-muted"
            />
          </div>
          <div className="max-h-72 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-4 py-6 text-center text-[12px] italic text-ink-muted">
                No matches.
              </p>
            ) : (
              filtered.map((r) => {
                const isSelected = r.id === value
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleSelect(r.id)}
                    className={`flex w-full items-center gap-3 border-b border-rule/60 px-3 py-2.5 text-left transition-colors last:border-0 hover:bg-paper-dim ${
                      isSelected ? "bg-paper-dim" : ""
                    }`}
                  >
                    {r.photo_url ? (
                      <Image
                        src={r.photo_url}
                        alt={r.name}
                        width={40}
                        height={40}
                        className="h-10 w-10 shrink-0 rounded-lg object-cover ring-1 ring-rule"
                      />
                    ) : (
                      <PlaceholderImage className="h-10 w-10 shrink-0 rounded-lg ring-1 ring-rule" size="sm" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-ink">
                        {r.name}
                      </p>
                      <p className="truncate text-[11px] text-ink-muted">
                        {r.dish_name}
                        <span className="mx-1 text-ink-faint">·</span>
                        {r.suburb}
                      </p>
                    </div>
                    <span className="price-num shrink-0 text-[12px] font-semibold text-ink">
                      {formatPrice(r.price)}
                    </span>
                    {isSelected && (
                      <Check size={14} className="shrink-0 text-emerald-600" strokeWidth={2.25} />
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
