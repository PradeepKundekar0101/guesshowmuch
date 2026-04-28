# M2: Community Interactions — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add restaurant submissions, voting, bookmarks, flagging, suburb rankings, CSV import, and bottom navigation to the "Guess How Much?" app.

**Architecture:** Extends M1's server-first Next.js 16. New API routes (Route Handlers) for mutations. localStorage for per-device state (votes, bookmarks, flags). Route group `(main)` for pages with bottom nav. Cloudinary for photo uploads. No auth required.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, Supabase, Mapbox Geocoding API, Cloudinary (unsigned upload)

**Critical Next.js 16 Notes:**
- Route Handlers use `export async function POST(request: Request, { params }: { params: Promise<{ id: string }> })` — params is a Promise
- `revalidatePath` from `next/cache` for cache invalidation after mutations

---

### Task 1: Route Group Restructure + Bottom Navigation

**Files:**
- Create: `app/(main)/layout.tsx`
- Move: `app/page.tsx` → `app/(main)/page.tsx`
- Move: `app/map-view.tsx` → `app/(main)/map-view.tsx`
- Create: `components/navigation/BottomNav.tsx`

- [ ] **Step 1: Create BottomNav component**

Create `components/navigation/BottomNav.tsx`:
```tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const tabs = [
  { href: "/", icon: "🗺️", label: "Map" },
  { href: "/rankings", icon: "🏆", label: "Rankings" },
  { href: "/saved", icon: "❤️", label: "Saved" },
] as const

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-gray-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm">
      {tabs.map((tab) => {
        const isActive = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs transition-colors ${
              isActive ? "text-emerald-600" : "text-gray-400"
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className={`font-medium ${isActive ? "text-emerald-600" : "text-gray-400"}`}>
              {tab.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
```

- [ ] **Step 2: Create (main) route group layout**

Create `app/(main)/layout.tsx`:
```tsx
import { BottomNav } from "@/components/navigation/BottomNav"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  )
}
```

- [ ] **Step 3: Move page.tsx and map-view.tsx into (main) group**

Move `app/page.tsx` → `app/(main)/page.tsx` (no content changes).
Move `app/map-view.tsx` → `app/(main)/map-view.tsx` (no content changes).

Delete the old files from `app/`.

- [ ] **Step 4: Update map-view to account for bottom nav spacing**

In `app/(main)/map-view.tsx`, update the PriceFilter positioning — change `bottom-3` to `bottom-16` to make room for the nav bar. Also add a FloatingSubmitButton import (will be created in a later task — for now just adjust the spacing):

Replace the return JSX in `app/(main)/map-view.tsx`:
```tsx
  return (
    <div className="relative h-dvh w-full overflow-hidden pb-14">
      <SearchBar onSelect={handleSearchSelect} />

      <MapContainer
        restaurants={restaurants}
        onPinClick={handlePinClick}
        maxPrice={maxPrice}
      />

      <PriceFilter value={maxPrice} onChange={setMaxPrice} />

      {selectedRestaurant && (
        <RestaurantPreview
          restaurant={selectedRestaurant}
          onClose={handleClosePreview}
        />
      )}
    </div>
  )
```

Update PriceFilter to use `bottom-16` instead of `bottom-3` in `components/filters/PriceFilter.tsx`:
```tsx
    <div className="absolute bottom-16 left-3 right-3 flex items-center gap-2 rounded-2xl bg-white/95 px-3 py-2.5 shadow-lg backdrop-blur-sm">
```

Update the recenter button in `components/map/MapContainer.tsx` from `bottom-28` to `bottom-40`:
```tsx
        className="absolute bottom-40 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition-colors hover:bg-gray-50"
```

- [ ] **Step 5: Commit**

```bash
git add app/(main)/ components/navigation/ components/filters/PriceFilter.tsx components/map/MapContainer.tsx
git rm app/page.tsx app/map-view.tsx
git commit -m "feat: add route group (main) with bottom navigation bar"
```

---

### Task 2: API Route — Create Restaurant

**Files:**
- Create: `app/api/restaurants/route.ts`

- [ ] **Step 1: Create the POST route handler**

Create `app/api/restaurants/route.ts`:
```typescript
import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  const body = await request.json()

  const { name, dish_name, price, cuisine_type, address, suburb, latitude, longitude, photo_url } = body

  if (!name || !dish_name || !price || !cuisine_type || !address || !suburb || !latitude || !longitude) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const numPrice = parseFloat(price)
  if (isNaN(numPrice) || numPrice <= 0 || numPrice > 15) {
    return NextResponse.json({ error: "Price must be between $0.01 and $15.00" }, { status: 400 })
  }

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("restaurants")
    .insert({
      name,
      dish_name,
      price: numPrice,
      cuisine_type,
      address,
      suburb,
      city: "Brisbane",
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      photo_url: photo_url || null,
      pin_type: "standard",
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/restaurants/route.ts
git commit -m "feat: add POST /api/restaurants route for creating restaurants"
```

---

### Task 3: API Routes — Vote and Flag

**Files:**
- Create: `app/api/restaurants/[id]/vote/route.ts`
- Create: `app/api/restaurants/[id]/flag/route.ts`

- [ ] **Step 1: Create vote route handler**

Create `app/api/restaurants/[id]/vote/route.ts`:
```typescript
import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { direction, previousDirection } = body

  if (direction !== "up" && direction !== "down") {
    return NextResponse.json({ error: "Direction must be 'up' or 'down'" }, { status: 400 })
  }

  let delta = direction === "up" ? 1 : -1

  // If changing vote, undo the previous vote too
  if (previousDirection === "up") {
    delta -= 1
  } else if (previousDirection === "down") {
    delta += 1
  }

  const supabase = createServerClient()

  // Get current score
  const { data: restaurant, error: fetchError } = await supabase
    .from("restaurants")
    .select("vote_score")
    .eq("id", id)
    .single()

  if (fetchError || !restaurant) {
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
  }

  const newScore = restaurant.vote_score + delta

  const { error: updateError } = await supabase
    .from("restaurants")
    .update({ vote_score: newScore })
    .eq("id", id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ vote_score: newScore })
}
```

- [ ] **Step 2: Create flag route handler**

Create `app/api/restaurants/[id]/flag/route.ts`:
```typescript
import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = createServerClient()

  const { data: restaurant, error: fetchError } = await supabase
    .from("restaurants")
    .select("flag_count")
    .eq("id", id)
    .single()

  if (fetchError || !restaurant) {
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
  }

  const newCount = restaurant.flag_count + 1

  const { error: updateError } = await supabase
    .from("restaurants")
    .update({ flag_count: newCount })
    .eq("id", id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ flag_count: newCount })
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/restaurants/[id]/
git commit -m "feat: add vote and flag API routes"
```

---

### Task 4: API Route — CSV Import

**Files:**
- Create: `app/api/import/route.ts`

- [ ] **Step 1: Create import route handler**

Create `app/api/import/route.ts`:
```typescript
import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  const body = await request.json()
  const { passphrase, restaurants } = body

  if (!passphrase || passphrase !== process.env.ADMIN_PASSPHRASE) {
    return NextResponse.json({ error: "Invalid passphrase" }, { status: 401 })
  }

  if (!Array.isArray(restaurants) || restaurants.length === 0) {
    return NextResponse.json({ error: "No restaurants provided" }, { status: 400 })
  }

  const supabase = createServerClient()
  const errors: string[] = []
  let imported = 0

  // Validate and insert each row
  const validRows = restaurants.filter((row: Record<string, unknown>, i: number) => {
    if (!row.name || !row.dish_name || !row.price || !row.latitude || !row.longitude) {
      errors.push(`Row ${i + 1}: missing required fields (name, dish_name, price, latitude, longitude)`)
      return false
    }
    const price = parseFloat(String(row.price))
    if (isNaN(price) || price <= 0 || price > 15) {
      errors.push(`Row ${i + 1}: price must be between $0.01 and $15.00`)
      return false
    }
    return true
  })

  if (validRows.length > 0) {
    const insertRows = validRows.map((row: Record<string, unknown>) => ({
      name: String(row.name),
      dish_name: String(row.dish_name),
      price: parseFloat(String(row.price)),
      cuisine_type: row.cuisine_type ? String(row.cuisine_type) : null,
      address: row.address ? String(row.address) : null,
      suburb: row.suburb ? String(row.suburb) : null,
      city: row.city ? String(row.city) : "Brisbane",
      latitude: parseFloat(String(row.latitude)),
      longitude: parseFloat(String(row.longitude)),
      photo_url: row.photo_url ? String(row.photo_url) : null,
      pin_type: "standard" as const,
    }))

    const { error } = await supabase.from("restaurants").insert(insertRows)

    if (error) {
      errors.push(`Database error: ${error.message}`)
    } else {
      imported = insertRows.length
    }
  }

  return NextResponse.json({ imported, errors })
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/import/route.ts
git commit -m "feat: add CSV import API route with passphrase auth"
```

---

### Task 5: localStorage Helpers

**Files:**
- Create: `lib/utils/local-storage.ts`

- [ ] **Step 1: Create localStorage utility functions**

Create `lib/utils/local-storage.ts`:
```typescript
// Votes: { [restaurantId]: "up" | "down" }
export function getVotes(): Record<string, "up" | "down"> {
  if (typeof window === "undefined") return {}
  try {
    return JSON.parse(localStorage.getItem("votes") || "{}")
  } catch {
    return {}
  }
}

export function setVote(restaurantId: string, direction: "up" | "down") {
  const votes = getVotes()
  votes[restaurantId] = direction
  localStorage.setItem("votes", JSON.stringify(votes))
}

export function getVote(restaurantId: string): "up" | "down" | null {
  return getVotes()[restaurantId] || null
}

// Bookmarks: string[]
export function getBookmarks(): string[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem("bookmarks") || "[]")
  } catch {
    return []
  }
}

export function toggleBookmark(restaurantId: string): boolean {
  const bookmarks = getBookmarks()
  const index = bookmarks.indexOf(restaurantId)
  if (index === -1) {
    bookmarks.push(restaurantId)
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks))
    return true // now bookmarked
  } else {
    bookmarks.splice(index, 1)
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks))
    return false // now unbookmarked
  }
}

export function isBookmarked(restaurantId: string): boolean {
  return getBookmarks().includes(restaurantId)
}

// Flags: string[]
export function getFlags(): string[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem("flags") || "[]")
  } catch {
    return []
  }
}

export function addFlag(restaurantId: string) {
  const flags = getFlags()
  if (!flags.includes(restaurantId)) {
    flags.push(restaurantId)
    localStorage.setItem("flags", JSON.stringify(flags))
  }
}

export function isFlagged(restaurantId: string): boolean {
  return getFlags().includes(restaurantId)
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/utils/local-storage.ts
git commit -m "feat: add localStorage helpers for votes, bookmarks, and flags"
```

---

### Task 6: VoteButtons Component

**Files:**
- Create: `components/voting/VoteButtons.tsx`

- [ ] **Step 1: Create VoteButtons component**

Create `components/voting/VoteButtons.tsx`:
```tsx
"use client"

import { useState, useEffect } from "react"
import { getVote, setVote } from "@/lib/utils/local-storage"

type VoteButtonsProps = {
  restaurantId: string
  initialScore: number
}

export function VoteButtons({ restaurantId, initialScore }: VoteButtonsProps) {
  const [score, setScore] = useState(initialScore)
  const [currentVote, setCurrentVote] = useState<"up" | "down" | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setCurrentVote(getVote(restaurantId))
  }, [restaurantId])

  async function handleVote(direction: "up" | "down") {
    if (loading) return
    if (currentVote === direction) return // already voted this way

    setLoading(true)

    try {
      const res = await fetch(`/api/restaurants/${restaurantId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction, previousDirection: currentVote }),
      })

      if (res.ok) {
        const data = await res.json()
        setScore(data.vote_score)
        setVote(restaurantId, direction)
        setCurrentVote(direction)
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border-t border-gray-100 pt-6">
      <h3 className="mb-2.5 text-sm font-semibold text-gray-900">
        Is this price still accurate?
      </h3>
      <div className="flex items-center gap-3">
        <button
          onClick={() => handleVote("up")}
          disabled={loading}
          className={`flex flex-1 flex-col items-center rounded-xl py-3 transition-colors ${
            currentVote === "up"
              ? "bg-emerald-100 ring-2 ring-emerald-500"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          <span className="text-2xl">👍</span>
          <span className="mt-1 text-xs text-gray-500">Still accurate</span>
        </button>

        <div className="flex flex-col items-center">
          <span className={`text-lg font-bold ${score >= 0 ? "text-emerald-600" : "text-red-500"}`}>
            {score >= 0 ? `+${score}` : score}
          </span>
          <span className="text-[10px] text-gray-400">votes</span>
        </div>

        <button
          onClick={() => handleVote("down")}
          disabled={loading}
          className={`flex flex-1 flex-col items-center rounded-xl py-3 transition-colors ${
            currentVote === "down"
              ? "bg-red-100 ring-2 ring-red-400"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          <span className="text-2xl">👎</span>
          <span className="mt-1 text-xs text-gray-500">Price changed</span>
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/voting/
git commit -m "feat: add VoteButtons component with localStorage tracking"
```

---

### Task 7: BookmarkButton Component

**Files:**
- Create: `components/bookmark/BookmarkButton.tsx`

- [ ] **Step 1: Create BookmarkButton component**

Create `components/bookmark/BookmarkButton.tsx`:
```tsx
"use client"

import { useState, useEffect } from "react"
import { isBookmarked, toggleBookmark } from "@/lib/utils/local-storage"

type BookmarkButtonProps = {
  restaurantId: string
  size?: "sm" | "md"
}

export function BookmarkButton({ restaurantId, size = "md" }: BookmarkButtonProps) {
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setSaved(isBookmarked(restaurantId))
  }, [restaurantId])

  function handleToggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const nowSaved = toggleBookmark(restaurantId)
    setSaved(nowSaved)
  }

  const sizeClasses = size === "sm" ? "h-8 w-8 text-lg" : "h-10 w-10 text-xl"

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center justify-center rounded-full transition-colors ${sizeClasses} ${
        saved ? "bg-red-50 text-red-500" : "bg-gray-100 text-gray-400 hover:bg-gray-200"
      }`}
      aria-label={saved ? "Remove bookmark" : "Save restaurant"}
    >
      {saved ? "❤️" : "🤍"}
    </button>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/bookmark/
git commit -m "feat: add BookmarkButton component with localStorage toggle"
```

---

### Task 8: FlagButton Component

**Files:**
- Create: `components/flag/FlagButton.tsx`

- [ ] **Step 1: Create FlagButton component**

Create `components/flag/FlagButton.tsx`:
```tsx
"use client"

import { useState, useEffect } from "react"
import { isFlagged, addFlag } from "@/lib/utils/local-storage"

type FlagButtonProps = {
  restaurantId: string
}

export function FlagButton({ restaurantId }: FlagButtonProps) {
  const [flagged, setFlagged] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setFlagged(isFlagged(restaurantId))
  }, [restaurantId])

  async function handleFlag() {
    if (flagged || loading) return

    setLoading(true)

    try {
      const res = await fetch(`/api/restaurants/${restaurantId}/flag`, {
        method: "POST",
      })

      if (res.ok) {
        addFlag(restaurantId)
        setFlagged(true)
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border-t border-gray-100 pt-6 text-center">
      <button
        onClick={handleFlag}
        disabled={flagged || loading}
        className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm transition-colors ${
          flagged
            ? "border-gray-200 bg-gray-50 text-gray-400"
            : "border-gray-200 text-gray-500 hover:border-red-200 hover:bg-red-50 hover:text-red-500"
        }`}
      >
        {flagged ? "✅ Flagged" : "🚩 Report outdated info"}
      </button>
      {flagged && (
        <p className="mt-1.5 text-[11px] text-gray-400">Thanks for reporting</p>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/flag/
git commit -m "feat: add FlagButton component with localStorage tracking"
```

---

### Task 9: Wire Vote, Bookmark, Flag into Restaurant Detail

**Files:**
- Modify: `components/restaurant/RestaurantDetail.tsx`
- Delete: `components/restaurant/PlaceholderActions.tsx`

- [ ] **Step 1: Update RestaurantDetail to use real components**

Replace `components/restaurant/RestaurantDetail.tsx`:
```tsx
import Image from "next/image"
import Link from "next/link"
import { PlaceholderImage } from "@/components/shared/PlaceholderImage"
import { PriceStamp } from "@/components/restaurant/PriceStamp"
import { VoteButtons } from "@/components/voting/VoteButtons"
import { BookmarkButton } from "@/components/bookmark/BookmarkButton"
import { FlagButton } from "@/components/flag/FlagButton"
import { formatPrice } from "@/lib/utils/price"
import type { Restaurant } from "@/lib/types/database"

type RestaurantDetailProps = {
  restaurant: Restaurant
}

export function RestaurantDetail({ restaurant }: RestaurantDetailProps) {
  return (
    <div className="min-h-dvh bg-white">
      {/* Hero photo */}
      <div className="relative h-[200px] w-full">
        {restaurant.photo_url ? (
          <Image
            src={restaurant.photo_url}
            alt={restaurant.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <PlaceholderImage className="h-full w-full" size="lg" />
        )}
        <div className="absolute inset-x-0 bottom-0 h-[60px] bg-gradient-to-t from-black/30 to-transparent" />
        <Link
          href="/"
          className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-lg text-white transition-colors hover:bg-black/60"
        >
          ←
        </Link>
        <div className="absolute right-3 top-3">
          <BookmarkButton restaurantId={restaurant.id} />
        </div>
      </div>

      <div className="space-y-6 px-5 py-5">
        {/* Name + location */}
        <div>
          <h1 className="text-[22px] font-extrabold text-gray-900">
            {restaurant.name}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {restaurant.cuisine_type} · {restaurant.suburb}
          </p>
          <p className="mt-0.5 text-sm text-gray-400">
            {restaurant.address}
          </p>
        </div>

        {/* Price card */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">CHEAPEST DISH</p>
              <p className="mt-1 text-lg font-bold text-gray-900">
                {restaurant.dish_name}
              </p>
            </div>
            <span className="rounded-full bg-emerald-500 px-4 py-2 text-xl font-extrabold text-white">
              {formatPrice(restaurant.price)}
            </span>
          </div>
          <PriceStamp verifiedAt={restaurant.verified_at} />
        </div>

        {/* Voting */}
        <VoteButtons restaurantId={restaurant.id} initialScore={restaurant.vote_score} />

        {/* Comments placeholder (M3) */}
        <div className="border-t border-gray-100 pt-6 opacity-40">
          <h3 className="mb-2.5 text-sm font-semibold text-gray-900">Comments</h3>
          <div className="rounded-xl bg-gray-50 py-5 text-center text-sm text-gray-400">
            💬 Comments coming soon
          </div>
        </div>

        {/* Flag */}
        <FlagButton restaurantId={restaurant.id} />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Delete PlaceholderActions**

```bash
rm components/restaurant/PlaceholderActions.tsx
```

- [ ] **Step 3: Commit**

```bash
git add components/restaurant/RestaurantDetail.tsx
git rm components/restaurant/PlaceholderActions.tsx
git commit -m "feat: replace placeholder actions with real vote, bookmark, and flag components"
```

---

### Task 10: Add BookmarkButton to RestaurantPreview

**Files:**
- Modify: `components/map/RestaurantPreview.tsx`

- [ ] **Step 1: Add bookmark button to the bottom sheet preview**

In `components/map/RestaurantPreview.tsx`, add import and the button.

Add import at top:
```tsx
import { BookmarkButton } from "@/components/bookmark/BookmarkButton"
```

Add the bookmark button next to the restaurant info, inside the `<div className="flex gap-3">` block. Replace the info div with:
```tsx
        <div className="flex gap-3">
          {/* Photo */}
          {restaurant.photo_url ? (
            <Image
              src={restaurant.photo_url}
              alt={restaurant.name}
              width={80}
              height={80}
              className="h-20 w-20 shrink-0 rounded-xl object-cover"
            />
          ) : (
            <PlaceholderImage className="h-20 w-20 shrink-0 rounded-xl" size="sm" />
          )}

          {/* Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between">
              <h3 className="truncate text-base font-bold text-gray-900">
                {restaurant.name}
              </h3>
              <BookmarkButton restaurantId={restaurant.id} size="sm" />
            </div>
            <p className="mt-0.5 text-sm text-gray-500">
              {restaurant.cuisine_type} · {restaurant.suburb}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="rounded-xl bg-emerald-500 px-2.5 py-0.5 text-sm font-bold text-white">
                {formatPrice(restaurant.price)}
              </span>
              <span className="truncate text-sm text-gray-500">
                {restaurant.dish_name}
              </span>
            </div>
            <p className="mt-1.5 text-xs text-gray-400">
              {verification.label}
            </p>
          </div>
        </div>
```

- [ ] **Step 2: Commit**

```bash
git add components/map/RestaurantPreview.tsx
git commit -m "feat: add bookmark button to restaurant preview bottom sheet"
```

---

### Task 11: Photo Upload Component

**Files:**
- Create: `components/submit/PhotoUpload.tsx`
- Create: `lib/utils/image.ts`

- [ ] **Step 1: Create image compression utility**

Create `lib/utils/image.ts`:
```typescript
export function compressImage(file: File, maxWidth = 1200, quality = 0.7): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      let { width, height } = img
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext("2d")
      if (!ctx) {
        reject(new Error("Could not get canvas context"))
        return
      }

      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error("Failed to compress image"))
          }
        },
        "image/jpeg",
        quality
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Failed to load image"))
    }

    img.src = url
  })
}
```

- [ ] **Step 2: Create PhotoUpload component**

Create `components/submit/PhotoUpload.tsx`:
```tsx
"use client"

import { useState, useRef } from "react"
import { compressImage } from "@/lib/utils/image"

type PhotoUploadProps = {
  onUpload: (url: string) => void
}

export function PhotoUpload({ onUpload }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (JPEG or PNG)")
      return
    }

    setError(null)
    setUploading(true)

    try {
      const compressed = await compressImage(file)
      const previewUrl = URL.createObjectURL(compressed)
      setPreview(previewUrl)

      // Upload to Cloudinary
      const formData = new FormData()
      formData.append("file", compressed, "photo.jpg")
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!)

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      )

      if (!res.ok) throw new Error("Upload failed")

      const data = await res.json()
      onUpload(data.secure_url)
    } catch {
      setError("Failed to upload photo. Please try again.")
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        Photo <span className="text-gray-400 font-normal">(optional)</span>
      </label>

      {preview ? (
        <div className="relative">
          <img src={preview} alt="Preview" className="h-32 w-full rounded-xl object-cover" />
          <button
            onClick={() => {
              setPreview(null)
              onUpload("")
              if (inputRef.current) inputRef.current.value = ""
            }}
            className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-xs text-white"
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-32 w-full items-center justify-center rounded-xl border-2 border-dashed border-gray-200 text-gray-400 transition-colors hover:border-emerald-300 hover:text-emerald-500"
        >
          {uploading ? "Uploading..." : "📷 Tap to add photo"}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleFile}
        className="hidden"
      />

      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/submit/PhotoUpload.tsx lib/utils/image.ts
git commit -m "feat: add photo upload with client-side compression and Cloudinary upload"
```

---

### Task 12: Submit Restaurant Form

**Files:**
- Create: `components/submit/SubmitForm.tsx`
- Create: `app/submit/page.tsx`

- [ ] **Step 1: Create SubmitForm component**

Create `components/submit/SubmitForm.tsx`:
```tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PhotoUpload } from "@/components/submit/PhotoUpload"

const CUISINE_TYPES = [
  "Vietnamese", "Thai", "Japanese", "Chinese", "Korean", "Indian",
  "Mexican", "Italian", "Greek", "Middle Eastern", "Malaysian",
  "Taiwanese", "Australian", "Vegetarian", "Asian Fusion", "Other",
] as const

export function SubmitForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [photoUrl, setPhotoUrl] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const form = new FormData(e.currentTarget)
    const address = form.get("address") as string
    const suburb = form.get("suburb") as string

    // Geocode the address
    const query = `${address}, ${suburb}, Brisbane, Australia`
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    const geoUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&country=au&limit=1`

    try {
      const geoRes = await fetch(geoUrl)
      const geoData = await geoRes.json()

      if (!geoData.features || geoData.features.length === 0) {
        setError("Could not find that address. Please check and try again.")
        setLoading(false)
        return
      }

      const [lng, lat] = geoData.features[0].center

      const res = await fetch("/api/restaurants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          dish_name: form.get("dish_name"),
          price: form.get("price"),
          cuisine_type: form.get("cuisine_type"),
          address,
          suburb,
          latitude: lat,
          longitude: lng,
          photo_url: photoUrl || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Failed to submit. Please try again.")
        setLoading(false)
        return
      }

      router.push("/")
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Restaurant name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
          Restaurant name *
        </label>
        <input
          id="name"
          name="name"
          required
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          placeholder="e.g. Pho Viet Express"
        />
      </div>

      {/* Dish name */}
      <div>
        <label htmlFor="dish_name" className="block text-sm font-medium text-gray-700 mb-1.5">
          Dish name *
        </label>
        <input
          id="dish_name"
          name="dish_name"
          required
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          placeholder="e.g. Beef Pho"
        />
      </div>

      {/* Price */}
      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1.5">
          Price (AUD) *
        </label>
        <input
          id="price"
          name="price"
          type="number"
          step="0.01"
          min="0.01"
          max="15"
          required
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          placeholder="e.g. 4.90"
        />
      </div>

      {/* Cuisine type */}
      <div>
        <label htmlFor="cuisine_type" className="block text-sm font-medium text-gray-700 mb-1.5">
          Cuisine type *
        </label>
        <select
          id="cuisine_type"
          name="cuisine_type"
          required
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
        >
          <option value="">Select cuisine...</option>
          {CUISINE_TYPES.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Address */}
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1.5">
          Street address *
        </label>
        <input
          id="address"
          name="address"
          required
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          placeholder="e.g. 123 Mains Road"
        />
      </div>

      {/* Suburb */}
      <div>
        <label htmlFor="suburb" className="block text-sm font-medium text-gray-700 mb-1.5">
          Suburb *
        </label>
        <input
          id="suburb"
          name="suburb"
          required
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          placeholder="e.g. Sunnybank"
        />
      </div>

      {/* Photo */}
      <PhotoUpload onUpload={setPhotoUrl} />

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-emerald-500 py-4 text-base font-bold text-white transition-colors hover:bg-emerald-600 disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit Restaurant"}
      </button>
    </form>
  )
}
```

- [ ] **Step 2: Create submit page**

Create `app/submit/page.tsx`:
```tsx
import Link from "next/link"
import { SubmitForm } from "@/components/submit/SubmitForm"

export default function SubmitPage() {
  return (
    <div className="min-h-dvh bg-white">
      <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
        <Link
          href="/"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-lg transition-colors hover:bg-gray-200"
        >
          ←
        </Link>
        <h1 className="text-lg font-bold text-gray-900">Add a Cheap Eat</h1>
      </div>

      <div className="px-5 py-6">
        <SubmitForm />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/submit/SubmitForm.tsx app/submit/
git commit -m "feat: add restaurant submission form with geocoding and photo upload"
```

---

### Task 13: Floating Submit Button on Map

**Files:**
- Create: `components/navigation/FloatingSubmitButton.tsx`
- Modify: `app/(main)/map-view.tsx`

- [ ] **Step 1: Create FloatingSubmitButton component**

Create `components/navigation/FloatingSubmitButton.tsx`:
```tsx
import Link from "next/link"

export function FloatingSubmitButton() {
  return (
    <Link
      href="/submit"
      className="absolute bottom-32 right-3 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-2xl text-white shadow-lg transition-colors hover:bg-emerald-600"
      aria-label="Submit a restaurant"
    >
      +
    </Link>
  )
}
```

- [ ] **Step 2: Add to map view**

In `app/(main)/map-view.tsx`, add import:
```tsx
import { FloatingSubmitButton } from "@/components/navigation/FloatingSubmitButton"
```

Add `<FloatingSubmitButton />` inside the return JSX, after `<SearchBar>`:
```tsx
      <SearchBar onSelect={handleSearchSelect} />
      <FloatingSubmitButton />
```

- [ ] **Step 3: Commit**

```bash
git add components/navigation/FloatingSubmitButton.tsx app/(main)/map-view.tsx
git commit -m "feat: add floating submit button on map view"
```

---

### Task 14: Rankings Page

**Files:**
- Create: `lib/queries/rankings.ts`
- Create: `components/rankings/SuburbRankings.tsx`
- Create: `app/(main)/rankings/page.tsx`

- [ ] **Step 1: Create rankings query**

Create `lib/queries/rankings.ts`:
```typescript
import { createServerClient } from "@/lib/supabase/server"
import type { Restaurant } from "@/lib/types/database"

export type SuburbRanking = {
  suburb: string
  totalScore: number
  restaurantCount: number
  topRestaurants: Restaurant[]
}

export async function getSuburbRankings(): Promise<SuburbRanking[]> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("is_active", true)
    .lt("flag_count", 3)
    .order("vote_score", { ascending: false })

  if (error || !data) {
    console.error("Failed to fetch rankings:", error?.message)
    return []
  }

  // Group by suburb
  const suburbMap = new Map<string, Restaurant[]>()
  for (const restaurant of data) {
    const suburb = restaurant.suburb || "Unknown"
    if (!suburbMap.has(suburb)) {
      suburbMap.set(suburb, [])
    }
    suburbMap.get(suburb)!.push(restaurant)
  }

  // Build rankings
  const rankings: SuburbRanking[] = Array.from(suburbMap.entries()).map(
    ([suburb, restaurants]) => ({
      suburb,
      totalScore: restaurants.reduce((sum, r) => sum + r.vote_score, 0),
      restaurantCount: restaurants.length,
      topRestaurants: restaurants.slice(0, 3),
    })
  )

  // Sort by total score descending
  rankings.sort((a, b) => b.totalScore - a.totalScore)

  return rankings
}
```

- [ ] **Step 2: Create SuburbRankings component**

Create `components/rankings/SuburbRankings.tsx`:
```tsx
import Link from "next/link"
import { formatPrice } from "@/lib/utils/price"
import type { SuburbRanking } from "@/lib/queries/rankings"

type SuburbRankingsProps = {
  rankings: SuburbRanking[]
}

export function SuburbRankings({ rankings }: SuburbRankingsProps) {
  if (rankings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="text-5xl">🏆</span>
        <p className="mt-4 text-gray-500">No rankings yet. Be the first to vote!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {rankings.map((ranking, index) => (
        <div
          key={ranking.suburb}
          className="rounded-2xl border border-gray-100 bg-white p-4"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
              {index + 1}
            </span>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">{ranking.suburb}</h3>
              <p className="text-xs text-gray-400">
                {ranking.restaurantCount} restaurant{ranking.restaurantCount !== 1 ? "s" : ""} · Score: {ranking.totalScore >= 0 ? `+${ranking.totalScore}` : ranking.totalScore}
              </p>
            </div>
          </div>

          {/* Top restaurants */}
          <div className="mt-3 space-y-2">
            {ranking.topRestaurants.map((restaurant) => (
              <Link
                key={restaurant.id}
                href={`/restaurant/${restaurant.id}`}
                className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2 transition-colors hover:bg-gray-100"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-800">
                    {restaurant.name}
                  </p>
                  <p className="text-xs text-gray-400">{restaurant.dish_name}</p>
                </div>
                <span className="ml-2 shrink-0 rounded-lg bg-emerald-500 px-2 py-0.5 text-xs font-bold text-white">
                  {formatPrice(restaurant.price)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Create rankings page**

Create `app/(main)/rankings/page.tsx`:
```tsx
import { getSuburbRankings } from "@/lib/queries/rankings"
import { SuburbRankings } from "@/components/rankings/SuburbRankings"

export default async function RankingsPage() {
  const rankings = await getSuburbRankings()

  return (
    <div className="min-h-dvh bg-gray-50 pb-20">
      <div className="border-b border-gray-100 bg-white px-5 py-4">
        <h1 className="text-lg font-bold text-gray-900">🏆 Popular Suburbs</h1>
        <p className="mt-0.5 text-xs text-gray-400">Ranked by community votes</p>
      </div>

      <div className="px-4 py-4">
        <SuburbRankings rankings={rankings} />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add lib/queries/rankings.ts components/rankings/ app/(main)/rankings/
git commit -m "feat: add suburb popularity rankings page"
```

---

### Task 15: Saved/Bookmarks Page

**Files:**
- Create: `components/saved/SavedList.tsx`
- Create: `app/(main)/saved/page.tsx`

- [ ] **Step 1: Create SavedList component**

Create `components/saved/SavedList.tsx`:
```tsx
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { PlaceholderImage } from "@/components/shared/PlaceholderImage"
import { BookmarkButton } from "@/components/bookmark/BookmarkButton"
import { formatPrice } from "@/lib/utils/price"
import { getBookmarks } from "@/lib/utils/local-storage"
import type { Restaurant } from "@/lib/types/database"

type SavedListProps = {
  allRestaurants: Restaurant[]
}

export function SavedList({ allRestaurants }: SavedListProps) {
  const [bookmarkIds, setBookmarkIds] = useState<string[]>([])

  useEffect(() => {
    setBookmarkIds(getBookmarks())

    // Listen for storage changes (bookmark toggles)
    const handleStorage = () => setBookmarkIds(getBookmarks())
    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  // Re-check bookmarks periodically to catch same-tab changes
  useEffect(() => {
    const interval = setInterval(() => {
      setBookmarkIds(getBookmarks())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const savedRestaurants = allRestaurants.filter((r) => bookmarkIds.includes(r.id))

  if (savedRestaurants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="text-5xl">❤️</span>
        <p className="mt-4 text-gray-500">No saved restaurants yet.</p>
        <p className="mt-1 text-sm text-gray-400">
          Browse the map and tap the heart icon to save.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {savedRestaurants.map((restaurant) => (
        <div
          key={restaurant.id}
          className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3"
        >
          <Link href={`/restaurant/${restaurant.id}`} className="shrink-0">
            {restaurant.photo_url ? (
              <Image
                src={restaurant.photo_url}
                alt={restaurant.name}
                width={64}
                height={64}
                className="h-16 w-16 rounded-xl object-cover"
              />
            ) : (
              <PlaceholderImage className="h-16 w-16 rounded-xl" size="sm" />
            )}
          </Link>

          <Link href={`/restaurant/${restaurant.id}`} className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-bold text-gray-900">
              {restaurant.name}
            </h3>
            <p className="text-xs text-gray-400">
              {restaurant.cuisine_type} · {restaurant.suburb}
            </p>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="rounded-lg bg-emerald-500 px-2 py-0.5 text-xs font-bold text-white">
                {formatPrice(restaurant.price)}
              </span>
              <span className="truncate text-xs text-gray-400">{restaurant.dish_name}</span>
            </div>
          </Link>

          <BookmarkButton restaurantId={restaurant.id} size="sm" />
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Create saved page**

Create `app/(main)/saved/page.tsx`:
```tsx
import { getActiveRestaurants } from "@/lib/queries/restaurants"
import { SavedList } from "@/components/saved/SavedList"

export default async function SavedPage() {
  const allRestaurants = await getActiveRestaurants()

  return (
    <div className="min-h-dvh bg-gray-50 pb-20">
      <div className="border-b border-gray-100 bg-white px-5 py-4">
        <h1 className="text-lg font-bold text-gray-900">❤️ Saved</h1>
        <p className="mt-0.5 text-xs text-gray-400">Your bookmarked restaurants</p>
      </div>

      <div className="px-4 py-4">
        <SavedList allRestaurants={allRestaurants} />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/saved/ app/(main)/saved/
git commit -m "feat: add saved/bookmarks page with localStorage-backed list"
```

---

### Task 16: CSV Import Page

**Files:**
- Create: `components/import/CsvImportForm.tsx`
- Create: `app/import/page.tsx`

- [ ] **Step 1: Create CsvImportForm component**

Create `components/import/CsvImportForm.tsx`:
```tsx
"use client"

import { useState } from "react"

type ImportResult = {
  imported: number
  errors: string[]
}

export function CsvImportForm() {
  const [passphrase, setPassphrase] = useState("")
  const [unlocked, setUnlocked] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleUnlock(e: React.FormEvent) {
    e.preventDefault()
    if (passphrase.trim()) {
      setUnlocked(true)
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return

    setFile(f)
    setResult(null)
    setError(null)

    const reader = new FileReader()
    reader.onload = (event) => {
      const csv = event.target?.result as string
      const lines = csv.trim().split("\n")
      const headers = lines[0].split(",").map((h) => h.trim())

      const rows = lines.slice(1).map((line) => {
        const values = line.split(",")
        const row: Record<string, unknown> = {}
        headers.forEach((header, i) => {
          const val = values[i]?.trim()
          if (header === "price" || header === "latitude" || header === "longitude") {
            row[header] = parseFloat(val) || 0
          } else {
            row[header] = val || null
          }
        })
        return row
      })

      setPreview(rows)
    }
    reader.readAsText(f)
  }

  async function handleImport() {
    if (preview.length === 0) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passphrase, restaurants: preview }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Import failed")
        return
      }

      setResult(data)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!unlocked) {
    return (
      <form onSubmit={handleUnlock} className="space-y-4">
        <div>
          <label htmlFor="passphrase" className="block text-sm font-medium text-gray-700 mb-1.5">
            Admin Passphrase
          </label>
          <input
            id="passphrase"
            type="password"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            placeholder="Enter passphrase..."
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-2xl bg-emerald-500 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-600"
        >
          Unlock
        </button>
      </form>
    )
  }

  return (
    <div className="space-y-5">
      {/* File upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          CSV File
        </label>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100"
        />
        <p className="mt-1 text-xs text-gray-400">
          Format: name, cuisine_type, address, suburb, city, latitude, longitude, dish_name, price, photo_url
        </p>
      </div>

      {/* Preview */}
      {preview.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700">
            Preview: {preview.length} row{preview.length !== 1 ? "s" : ""}
          </p>
          <div className="mt-2 max-h-60 overflow-auto rounded-xl border border-gray-200">
            <table className="w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-500">Name</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500">Dish</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500">Price</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500">Suburb</th>
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 10).map((row, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="px-3 py-2 text-gray-700">{String(row.name || "")}</td>
                    <td className="px-3 py-2 text-gray-700">{String(row.dish_name || "")}</td>
                    <td className="px-3 py-2 text-gray-700">${String(row.price || "")}</td>
                    <td className="px-3 py-2 text-gray-700">{String(row.suburb || "")}</td>
                  </tr>
                ))}
                {preview.length > 10 && (
                  <tr className="border-t border-gray-100">
                    <td colSpan={4} className="px-3 py-2 text-center text-gray-400">
                      ...and {preview.length - 10} more rows
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Import button */}
      {preview.length > 0 && (
        <button
          onClick={handleImport}
          disabled={loading}
          className="w-full rounded-2xl bg-emerald-500 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-600 disabled:opacity-50"
        >
          {loading ? "Importing..." : `Import ${preview.length} Restaurants`}
        </button>
      )}

      {/* Result */}
      {result && (
        <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm">
          <p className="font-medium text-emerald-700">
            ✅ Imported {result.imported} restaurant{result.imported !== 1 ? "s" : ""}
          </p>
          {result.errors.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs text-red-600">
              {result.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create import page**

Create `app/import/page.tsx`:
```tsx
import Link from "next/link"
import { CsvImportForm } from "@/components/import/CsvImportForm"

export default function ImportPage() {
  return (
    <div className="min-h-dvh bg-white">
      <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
        <Link
          href="/"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-lg transition-colors hover:bg-gray-200"
        >
          ←
        </Link>
        <h1 className="text-lg font-bold text-gray-900">CSV Import</h1>
      </div>

      <div className="px-5 py-6">
        <CsvImportForm />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Update .env.local.example with new vars**

Add to `.env.local.example`:
```
ADMIN_PASSPHRASE=your-admin-passphrase
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-unsigned-upload-preset
```

- [ ] **Step 4: Commit**

```bash
git add components/import/ app/import/ .env.local.example
git commit -m "feat: add CSV import page with passphrase protection"
```

---

### Task 17: Build Verification

**Files:** None (verification only)

- [ ] **Step 1: Verify the project builds**

```bash
npm run build
```

Expected: Build succeeds. Pages registered:
- `/(main)` — Map, Rankings, Saved (with bottom nav)
- `/submit` — Submit form
- `/import` — CSV import
- `/restaurant/[id]` — Detail page
- `/onboarding` — Onboarding
- API routes: `/api/restaurants`, `/api/restaurants/[id]/vote`, `/api/restaurants/[id]/flag`, `/api/import`

- [ ] **Step 2: Final commit**

```bash
git add -A
git commit -m "feat: complete M2 — community interactions"
```
