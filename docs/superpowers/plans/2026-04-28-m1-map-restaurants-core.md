# M1: Map + Restaurants Core — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the core map experience for "Guess How Much?" — interactive Mapbox map with price pins, price filtering, location detection, restaurant detail pages, and onboarding flow.

**Architecture:** Server-first Next.js 16 App Router. Restaurant data fetched server-side via Supabase for SEO and fast loads. Map + filters rendered as client component islands. No auth required for any M1 feature.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, Supabase (PostgreSQL), Mapbox GL JS, TypeScript

**Critical Next.js 16 Notes:**
- `params` is a Promise — must use `await params` in server components, `use(params)` in client components
- Type helpers: `PageProps<'/restaurant/[id]'>` for typed page props
- Turbopack is default bundler
- `middleware.ts` is now `proxy.ts` (not needed in M1)

---

### Task 1: Install Dependencies and Configure Environment

**Files:**
- Modify: `package.json`
- Modify: `next.config.ts`
- Create: `.env.local.example`
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/client.ts`
- Create: `lib/types/database.ts`

- [ ] **Step 1: Install Supabase and Mapbox packages**

```bash
npm install @supabase/supabase-js @supabase/ssr mapbox-gl
npm install -D @types/mapbox-gl
```

- [ ] **Step 2: Create environment variable example file**

Create `.env.local.example`:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token
```

- [ ] **Step 3: Create database types**

Create `lib/types/database.ts`:
```typescript
export type Restaurant = {
  id: string
  name: string
  cuisine_type: string | null
  address: string | null
  suburb: string | null
  city: string
  latitude: number
  longitude: number
  dish_name: string
  price: number
  photo_url: string | null
  pin_type: "standard" | "featured" | "hot_deal" | "top_rated"
  verified_at: string
  flag_count: number
  vote_score: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type RestaurantInsert = Omit<Restaurant, "id" | "created_at" | "updated_at" | "flag_count" | "vote_score" | "is_active"> & {
  id?: string
  flag_count?: number
  vote_score?: number
  is_active?: boolean
}
```

- [ ] **Step 4: Create Supabase server client**

Create `lib/supabase/server.ts`:
```typescript
import { createClient } from "@supabase/supabase-js"

export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
```

- [ ] **Step 5: Create Supabase browser client**

Create `lib/supabase/client.ts`:
```typescript
import { createClient } from "@supabase/supabase-js"

let client: ReturnType<typeof createClient> | null = null

export function createBrowserClient() {
  if (client) return client
  client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  return client
}
```

- [ ] **Step 6: Update next.config.ts**

```typescript
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
}

export default nextConfig
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add Supabase, Mapbox deps and environment config"
```

---

### Task 2: Database Schema and Seed Script

**Files:**
- Create: `supabase/schema.sql`
- Create: `supabase/seed.sql`
- Create: `scripts/seed.ts`
- Create: `scripts/sample-data.csv`

- [ ] **Step 1: Create SQL schema**

Create `supabase/schema.sql`:
```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cuisine_type TEXT,
  address TEXT,
  suburb TEXT,
  city TEXT NOT NULL DEFAULT 'Brisbane',
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  dish_name TEXT NOT NULL,
  price NUMERIC(5,2) NOT NULL CHECK (price > 0 AND price <= 15),
  photo_url TEXT,
  pin_type TEXT NOT NULL DEFAULT 'standard' CHECK (pin_type IN ('standard', 'featured', 'hot_deal', 'top_rated')),
  verified_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  flag_count INTEGER NOT NULL DEFAULT 0,
  vote_score INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_restaurants_location ON restaurants (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_restaurants_price ON restaurants (price);
CREATE INDEX IF NOT EXISTS idx_restaurants_city ON restaurants (city);
CREATE INDEX IF NOT EXISTS idx_restaurants_active ON restaurants (is_active) WHERE is_active = true;

-- Row Level Security
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- Public read access for active, non-flagged restaurants
CREATE POLICY "Public can read active restaurants"
  ON restaurants
  FOR SELECT
  USING (is_active = true AND flag_count < 3);

-- Service role can do everything (for API routes / admin)
CREATE POLICY "Service role full access"
  ON restaurants
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER restaurants_updated_at
  BEFORE UPDATE ON restaurants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

- [ ] **Step 2: Create sample CSV data**

Create `scripts/sample-data.csv`:
```csv
name,cuisine_type,address,suburb,city,latitude,longitude,dish_name,price,photo_url
Pho Viet Express,Vietnamese,123 Mains Road,Sunnybank,Brisbane,-27.5789,153.0589,Pho Bo (Beef Pho),4.90,
Thai Hot Pot,Thai,45 Logan Road,Woolloongabba,Brisbane,-27.4928,153.0350,Pad Thai,7.50,
Sushi Train,Japanese,200 Adelaide Street,CBD,Brisbane,-27.4679,153.0281,Salmon Sushi Set,9.90,
King of Kebabs,Middle Eastern,88 Boundary Street,West End,Brisbane,-27.4810,153.0110,Lamb Kebab Wrap,8.00,
Dumpling King,Chinese,15 Duncan Street,Fortitude Valley,Brisbane,-27.4567,153.0368,Pork Dumplings (12pc),6.50,
Banh Mi Factory,Vietnamese,322 Wickham Street,Fortitude Valley,Brisbane,-27.4530,153.0380,Classic Banh Mi,5.00,
Noodle Box,Asian Fusion,171 George Street,CBD,Brisbane,-27.4712,153.0236,Teriyaki Chicken Noodles,11.90,
Curry House,Indian,67 Vulture Street,South Brisbane,Brisbane,-27.4820,153.0230,Butter Chicken with Rice,10.50,
El Burrito,Mexican,99 Albert Street,CBD,Brisbane,-27.4695,153.0252,Chicken Burrito,9.00,
Pizza Slice,Italian,42 Edward Street,CBD,Brisbane,-27.4680,153.0270,Margherita Slice (2pc),5.50,
Rice Bowl Express,Korean,55 Mary Street,CBD,Brisbane,-27.4710,153.0290,Bibimbap,8.50,
Fish & Chips Spot,Australian,12 Montague Road,South Brisbane,Brisbane,-27.4790,153.0180,Fish and Chips,7.00,
Falafel House,Middle Eastern,28 Caxton Street,Petrie Terrace,Brisbane,-27.4620,153.0140,Falafel Plate,6.00,
Laksa King,Malaysian,77 Market Street,Sunnybank,Brisbane,-27.5795,153.0620,Chicken Laksa,8.90,
Ramen Ya,Japanese,33 McLachlan Street,Fortitude Valley,Brisbane,-27.4550,153.0360,Tonkotsu Ramen,12.50,
Taco Bell Express,Mexican,110 Queen Street,CBD,Brisbane,-27.4685,153.0265,Crunchy Taco Combo,4.50,
Gyros on Wheels,Greek,5 Fish Lane,South Brisbane,Brisbane,-27.4815,153.0215,Lamb Gyros,7.50,
Bao Now,Taiwanese,21 James Street,Fortitude Valley,Brisbane,-27.4545,153.0395,Pork Belly Bao (3pc),9.50,
Sunny Bakery,Chinese,8 Coonan Street,Sunnybank,Brisbane,-27.5780,153.0600,BBQ Pork Bun (3pc),4.00,
Green Bowl,Vegetarian,130 Mary Street,CBD,Brisbane,-27.4720,153.0285,Vegan Buddha Bowl,12.00,
```

- [ ] **Step 3: Create seed script**

Create `scripts/seed.ts`:
```typescript
import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
import { resolve } from "path"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function seed() {
  const csvPath = resolve(__dirname, "sample-data.csv")
  const csv = readFileSync(csvPath, "utf-8")
  const lines = csv.trim().split("\n")
  const headers = lines[0].split(",")

  const restaurants = lines.slice(1).map((line) => {
    const values = line.split(",")
    const row: Record<string, string | number | null> = {}
    headers.forEach((header, i) => {
      const val = values[i]?.trim()
      if (header === "price" || header === "latitude" || header === "longitude") {
        row[header] = parseFloat(val)
      } else {
        row[header] = val || null
      }
    })
    return row
  })

  const { data, error } = await supabase.from("restaurants").insert(restaurants)

  if (error) {
    console.error("Seed failed:", error.message)
    process.exit(1)
  }

  console.log(`Seeded ${restaurants.length} restaurants successfully.`)
}

seed()
```

- [ ] **Step 4: Add seed script to package.json**

Add to `scripts` in `package.json`:
```json
"seed": "npx tsx scripts/seed.ts"
```

- [ ] **Step 5: Commit**

```bash
git add supabase/ scripts/ package.json
git commit -m "feat: add database schema, sample data, and seed script"
```

---

### Task 3: Restaurant Data Queries

**Files:**
- Create: `lib/queries/restaurants.ts`
- Create: `lib/utils/price.ts`
- Create: `lib/utils/geo.ts`

- [ ] **Step 1: Create restaurant query functions**

Create `lib/queries/restaurants.ts`:
```typescript
import { createServerClient } from "@/lib/supabase/server"
import type { Restaurant } from "@/lib/types/database"

export async function getActiveRestaurants(city: string = "Brisbane"): Promise<Restaurant[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("city", city)
    .eq("is_active", true)
    .lt("flag_count", 3)
    .order("price", { ascending: true })

  if (error) {
    console.error("Failed to fetch restaurants:", error.message)
    return []
  }

  return data as Restaurant[]
}

export async function getRestaurantById(id: string): Promise<Restaurant | null> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    console.error("Failed to fetch restaurant:", error.message)
    return null
  }

  return data as Restaurant
}
```

- [ ] **Step 2: Create price utility functions**

Create `lib/utils/price.ts`:
```typescript
export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`
}

export function getDaysSinceVerified(verifiedAt: string): number {
  const now = new Date()
  const verified = new Date(verifiedAt)
  return Math.floor((now.getTime() - verified.getTime()) / (1000 * 60 * 60 * 24))
}

export function getVerificationStatus(verifiedAt: string): {
  label: string
  isStale: boolean
} {
  const days = getDaysSinceVerified(verifiedAt)

  if (days === 0) {
    return { label: "Verified today", isStale: false }
  }

  if (days < 90) {
    return { label: `Verified ${days} day${days === 1 ? "" : "s"} ago`, isStale: false }
  }

  return {
    label: "Price not verified in 90+ days — may be outdated",
    isStale: true,
  }
}
```

- [ ] **Step 3: Create geo utility functions**

Create `lib/utils/geo.ts`:
```typescript
export const BRISBANE_CENTER = {
  lat: -27.4698,
  lng: 153.0251,
} as const

export const DEFAULT_ZOOM = 13

export function getUserLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
      (error) => {
        reject(error)
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    )
  })
}
```

- [ ] **Step 4: Commit**

```bash
git add lib/
git commit -m "feat: add restaurant queries and utility functions"
```

---

### Task 4: Onboarding Flow

**Files:**
- Create: `app/onboarding/page.tsx`
- Create: `components/onboarding/WelcomeScreen.tsx`
- Create: `components/onboarding/LocationPrompt.tsx`

- [ ] **Step 1: Create WelcomeScreen component**

Create `components/onboarding/WelcomeScreen.tsx`:
```tsx
"use client"

type WelcomeScreenProps = {
  onContinue: () => void
}

const features = [
  { icon: "🗺️", text: "Browse cheap eats on a live map" },
  { icon: "🏷️", text: "Filter by price — $5, $8, $12, $15" },
  { icon: "👥", text: "Community-verified prices" },
]

export function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-8 py-12 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500 text-4xl">
        💰
      </div>

      <h1 className="mt-6 text-3xl font-extrabold text-gray-900">
        Guess How Much?
      </h1>
      <p className="mt-3 max-w-[280px] text-base leading-relaxed text-gray-500">
        Find genuinely cheap takeaway food near you. Everything under $15,
        verified by the community.
      </p>

      <div className="mt-8 w-full max-w-[280px] text-left">
        {features.map((feature) => (
          <div
            key={feature.text}
            className="flex items-center gap-3 py-2.5"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-lg">
              {feature.icon}
            </div>
            <span className="text-sm text-gray-600">{feature.text}</span>
          </div>
        ))}
      </div>

      <div className="mt-10 w-full max-w-[280px]">
        <button
          onClick={onContinue}
          className="w-full rounded-2xl bg-emerald-500 px-6 py-4 text-base font-bold text-white transition-colors hover:bg-emerald-600"
        >
          Get Started
        </button>
        <p className="mt-2.5 text-xs text-gray-400">
          No account needed to browse
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create LocationPrompt component**

Create `components/onboarding/LocationPrompt.tsx`:
```tsx
"use client"

import { useRouter } from "next/navigation"
import { getUserLocation } from "@/lib/utils/geo"
import { useState } from "react"

export function LocationPrompt() {
  const router = useRouter()
  const [requesting, setRequesting] = useState(false)

  async function handleAllow() {
    setRequesting(true)
    try {
      const location = await getUserLocation()
      localStorage.setItem("user_location", JSON.stringify(location))
    } catch {
      // Permission denied or error — fall through to default Brisbane
    }
    localStorage.setItem("onboarding_complete", "true")
    router.replace("/")
  }

  function handleSkip() {
    localStorage.setItem("onboarding_complete", "true")
    router.replace("/")
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-8 py-12 text-center">
      <div className="flex h-[120px] w-[120px] items-center justify-center rounded-full bg-emerald-50 text-6xl">
        📍
      </div>

      <h2 className="mt-6 text-2xl font-extrabold text-gray-900">
        Find food near you
      </h2>
      <p className="mt-3 max-w-[280px] text-base leading-relaxed text-gray-500">
        Allow location access so we can show cheap eats close to where you are
        right now.
      </p>

      <div className="mt-6 w-full max-w-[280px] rounded-xl bg-gray-50 p-4 text-left">
        <p className="mb-2 text-xs font-semibold uppercase text-gray-400">
          We use your location to:
        </p>
        <p className="text-sm leading-7 text-gray-600">
          ✓ Centre the map on your area
          <br />
          ✓ Show distances to restaurants
          <br />
          ✓ Find the closest cheap eats
        </p>
      </div>

      <p className="mt-4 max-w-[260px] text-xs leading-relaxed text-gray-400">
        Your location stays on your device. We never store or share it.
      </p>

      <div className="mt-8 flex w-full max-w-[280px] flex-col gap-2.5">
        <button
          onClick={handleAllow}
          disabled={requesting}
          className="w-full rounded-2xl bg-emerald-500 px-6 py-4 text-base font-bold text-white transition-colors hover:bg-emerald-600 disabled:opacity-50"
        >
          {requesting ? "Requesting..." : "Allow Location Access"}
        </button>
        <button
          onClick={handleSkip}
          className="w-full px-6 py-3 text-sm font-medium text-gray-500 transition-colors hover:text-gray-700"
        >
          Skip — I'll search manually
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create onboarding page**

Create `app/onboarding/page.tsx`:
```tsx
"use client"

import { useState } from "react"
import { WelcomeScreen } from "@/components/onboarding/WelcomeScreen"
import { LocationPrompt } from "@/components/onboarding/LocationPrompt"

export default function OnboardingPage() {
  const [step, setStep] = useState<"welcome" | "location">("welcome")

  if (step === "welcome") {
    return <WelcomeScreen onContinue={() => setStep("location")} />
  }

  return <LocationPrompt />
}
```

- [ ] **Step 4: Commit**

```bash
git add app/onboarding/ components/onboarding/
git commit -m "feat: add onboarding flow with welcome screen and location prompt"
```

---

### Task 5: Map Container with Mapbox

**Files:**
- Create: `components/map/MapContainer.tsx`
- Create: `components/map/PricePin.tsx`
- Create: `app/globals.css` (modify — add Mapbox CSS import)

- [ ] **Step 1: Add Mapbox CSS to globals**

Add to the top of `app/globals.css` (keep existing Tailwind imports):
```css
@import "mapbox-gl/dist/mapbox-gl.css";
```

- [ ] **Step 2: Create PricePin component**

Create `components/map/PricePin.tsx`:
```tsx
import { formatPrice } from "@/lib/utils/price"

export function createPricePinElement(price: number, isActive: boolean = false): HTMLElement {
  const wrapper = document.createElement("div")
  wrapper.className = "price-pin-wrapper"
  wrapper.style.cursor = "pointer"

  const pin = document.createElement("div")
  pin.style.cssText = `
    background: ${isActive ? "#f59e0b" : "#10b981"};
    color: white;
    padding: 4px 10px;
    border-radius: 16px;
    font-weight: 700;
    font-size: 13px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    white-space: nowrap;
    transition: background 0.2s, transform 0.2s;
    transform: ${isActive ? "scale(1.15)" : "scale(1)"};
  `
  pin.textContent = formatPrice(price)

  const arrow = document.createElement("div")
  arrow.style.cssText = `
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid ${isActive ? "#f59e0b" : "#10b981"};
    margin: 0 auto;
    transition: border-top-color 0.2s;
  `

  wrapper.appendChild(pin)
  wrapper.appendChild(arrow)
  return wrapper
}
```

- [ ] **Step 3: Create MapContainer component**

Create `components/map/MapContainer.tsx`:
```tsx
"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import mapboxgl from "mapbox-gl"
import { BRISBANE_CENTER, DEFAULT_ZOOM } from "@/lib/utils/geo"
import { createPricePinElement } from "@/components/map/PricePin"
import type { Restaurant } from "@/lib/types/database"

type MapContainerProps = {
  restaurants: Restaurant[]
  onPinClick: (restaurant: Restaurant) => void
  maxPrice: number
}

export function MapContainer({ restaurants, onPinClick, maxPrice }: MapContainerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map())
  const [activeId, setActiveId] = useState<string | null>(null)

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

    // Check for stored user location
    let center: [number, number] = [BRISBANE_CENTER.lng, BRISBANE_CENTER.lat]
    const stored = localStorage.getItem("user_location")
    if (stored) {
      try {
        const loc = JSON.parse(stored)
        center = [loc.lng, loc.lat]
      } catch {
        // use default
      }
    }

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center,
      zoom: DEFAULT_ZOOM,
    })

    map.addControl(new mapboxgl.NavigationControl(), "top-right")

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Manage markers based on restaurants and price filter
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const currentMarkers = markersRef.current

    // Remove markers that are filtered out
    currentMarkers.forEach((marker, id) => {
      const restaurant = restaurants.find((r) => r.id === id)
      if (!restaurant || restaurant.price > maxPrice) {
        marker.remove()
        currentMarkers.delete(id)
      }
    })

    // Add or update markers for visible restaurants
    restaurants
      .filter((r) => r.price <= maxPrice)
      .forEach((restaurant) => {
        if (currentMarkers.has(restaurant.id)) {
          // Update existing marker's pin style
          const marker = currentMarkers.get(restaurant.id)!
          const el = createPricePinElement(restaurant.price, restaurant.id === activeId)
          el.addEventListener("click", () => {
            setActiveId(restaurant.id)
            onPinClick(restaurant)
          })
          marker.getElement().replaceWith(el)
          return
        }

        // Create new marker
        const el = createPricePinElement(restaurant.price, restaurant.id === activeId)
        el.addEventListener("click", () => {
          setActiveId(restaurant.id)
          onPinClick(restaurant)
        })

        const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
          .setLngLat([restaurant.longitude, restaurant.latitude])
          .addTo(map)

        currentMarkers.set(restaurant.id, marker)
      })
  }, [restaurants, maxPrice, activeId, onPinClick])

  const handleRecenter = useCallback(() => {
    if (!mapRef.current) return

    const stored = localStorage.getItem("user_location")
    if (stored) {
      try {
        const loc = JSON.parse(stored)
        mapRef.current.flyTo({ center: [loc.lng, loc.lat], zoom: DEFAULT_ZOOM })
        return
      } catch {
        // fall through
      }
    }

    // Try to get fresh location
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        localStorage.setItem("user_location", JSON.stringify(loc))
        mapRef.current?.flyTo({ center: [loc.lng, loc.lat], zoom: DEFAULT_ZOOM })
      },
      () => {
        mapRef.current?.flyTo({
          center: [BRISBANE_CENTER.lng, BRISBANE_CENTER.lat],
          zoom: DEFAULT_ZOOM,
        })
      }
    )
  }, [])

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainerRef} className="h-full w-full" />

      {/* Recenter button */}
      <button
        onClick={handleRecenter}
        className="absolute bottom-28 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition-colors hover:bg-gray-50"
        aria-label="Re-center on my location"
      >
        <span className="text-lg">📍</span>
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add components/map/ app/globals.css
git commit -m "feat: add Mapbox map container with price pins and location re-center"
```

---

### Task 6: Price Filter Component

**Files:**
- Create: `components/filters/PriceFilter.tsx`

- [ ] **Step 1: Create PriceFilter component**

Create `components/filters/PriceFilter.tsx`:
```tsx
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
    <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 rounded-2xl bg-white/95 px-3 py-2.5 shadow-lg backdrop-blur-sm">
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
```

- [ ] **Step 2: Commit**

```bash
git add components/filters/
git commit -m "feat: add price filter with preset buttons and range slider"
```

---

### Task 7: Search Bar Component

**Files:**
- Create: `components/shared/SearchBar.tsx`

- [ ] **Step 1: Create SearchBar component**

Create `components/shared/SearchBar.tsx`:
```tsx
"use client"

import { useState, useCallback, useRef } from "react"

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

  return (
    <div className="absolute left-3 right-3 top-3 z-10">
      <div className="relative">
        <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 shadow-md">
          <span className="text-gray-400">🔍</span>
          <input
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={() => results.length > 0 && setIsOpen(true)}
            placeholder="Search suburb or area..."
            className="flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
          />
        </div>

        {isOpen && (
          <div className="absolute left-0 right-0 top-full mt-1 overflow-hidden rounded-2xl bg-white shadow-lg">
            {results.map((result, i) => (
              <button
                key={i}
                onClick={() => handleSelect(result)}
                className="block w-full px-4 py-3 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
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
```

- [ ] **Step 2: Commit**

```bash
git add components/shared/
git commit -m "feat: add search bar with Mapbox geocoding"
```

---

### Task 8: Bottom Sheet Restaurant Preview

**Files:**
- Create: `components/map/RestaurantPreview.tsx`
- Create: `components/shared/PlaceholderImage.tsx`

- [ ] **Step 1: Create PlaceholderImage component**

Create `components/shared/PlaceholderImage.tsx`:
```tsx
type PlaceholderImageProps = {
  className?: string
  size?: "sm" | "md" | "lg"
}

const sizeMap = {
  sm: "text-2xl",
  md: "text-4xl",
  lg: "text-6xl",
}

export function PlaceholderImage({ className = "", size = "md" }: PlaceholderImageProps) {
  return (
    <div
      className={`flex items-center justify-center bg-gray-100 ${className}`}
    >
      <span className={sizeMap[size]}>🍽️</span>
    </div>
  )
}
```

- [ ] **Step 2: Create RestaurantPreview bottom sheet**

Create `components/map/RestaurantPreview.tsx`:
```tsx
"use client"

import Image from "next/image"
import Link from "next/link"
import { PlaceholderImage } from "@/components/shared/PlaceholderImage"
import { formatPrice } from "@/lib/utils/price"
import { getVerificationStatus } from "@/lib/utils/price"
import type { Restaurant } from "@/lib/types/database"

type RestaurantPreviewProps = {
  restaurant: Restaurant
  onClose: () => void
}

export function RestaurantPreview({ restaurant, onClose }: RestaurantPreviewProps) {
  const verification = getVerificationStatus(restaurant.verified_at)

  return (
    <>
      {/* Backdrop */}
      <div
        className="absolute inset-0 z-10"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="absolute bottom-0 left-0 right-0 z-20 animate-slide-up rounded-t-[20px] bg-white p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.15)]">
        {/* Drag handle */}
        <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-gray-300" />

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
            <h3 className="truncate text-base font-bold text-gray-900">
              {restaurant.name}
            </h3>
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

        {/* CTA */}
        <Link
          href={`/restaurant/${restaurant.id}`}
          className="mt-3.5 block rounded-xl bg-gray-900 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-gray-800"
        >
          View Full Details →
        </Link>
      </div>
    </>
  )
}
```

- [ ] **Step 3: Add slide-up animation to globals.css**

Add to `app/globals.css`:
```css
@keyframes slide-up {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}
```

- [ ] **Step 4: Commit**

```bash
git add components/map/RestaurantPreview.tsx components/shared/PlaceholderImage.tsx app/globals.css
git commit -m "feat: add restaurant preview bottom sheet with slide-up animation"
```

---

### Task 9: Home Page — Assemble Map View

**Files:**
- Modify: `app/page.tsx`
- Create: `app/map-view.tsx` (client component that wires everything together)

- [ ] **Step 1: Create the client-side map view assembly**

Create `app/map-view.tsx`:
```tsx
"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { MapContainer } from "@/components/map/MapContainer"
import { PriceFilter } from "@/components/filters/PriceFilter"
import { SearchBar } from "@/components/shared/SearchBar"
import { RestaurantPreview } from "@/components/map/RestaurantPreview"
import type { Restaurant } from "@/lib/types/database"

type MapViewProps = {
  restaurants: Restaurant[]
}

export function MapView({ restaurants }: MapViewProps) {
  const [maxPrice, setMaxPrice] = useState(15)
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
  const mapContainerRef = useRef<{ flyTo: (center: [number, number]) => void } | null>(null)

  // Redirect to onboarding if first visit
  useEffect(() => {
    if (!localStorage.getItem("onboarding_complete")) {
      window.location.href = "/onboarding"
    }
  }, [])

  const handlePinClick = useCallback((restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant)
  }, [])

  const handleSearchSelect = useCallback((center: [number, number]) => {
    // MapContainer handles flyTo internally via ref if needed
    // For now, we dispatch a custom event the map listens to
    window.dispatchEvent(
      new CustomEvent("map-fly-to", { detail: { center } })
    )
  }, [])

  const handleClosePreview = useCallback(() => {
    setSelectedRestaurant(null)
  }, [])

  return (
    <div className="relative h-dvh w-full overflow-hidden">
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
}
```

- [ ] **Step 2: Update home page as server component**

Replace `app/page.tsx`:
```tsx
import { getActiveRestaurants } from "@/lib/queries/restaurants"
import { MapView } from "./map-view"

export default async function Home() {
  const restaurants = await getActiveRestaurants()

  return <MapView restaurants={restaurants} />
}
```

- [ ] **Step 3: Add map-fly-to event listener to MapContainer**

Add inside the `useEffect` that initializes the map in `components/map/MapContainer.tsx`, before the return cleanup:

```typescript
    const handleFlyTo = (e: Event) => {
      const { center } = (e as CustomEvent).detail
      map.flyTo({ center, zoom: DEFAULT_ZOOM })
    }

    window.addEventListener("map-fly-to", handleFlyTo)

    return () => {
      window.removeEventListener("map-fly-to", handleFlyTo)
      map.remove()
      mapRef.current = null
    }
```

(Replace the existing cleanup return.)

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx app/map-view.tsx components/map/MapContainer.tsx
git commit -m "feat: assemble home page with map, filters, search, and bottom sheet"
```

---

### Task 10: Restaurant Detail Page

**Files:**
- Create: `app/restaurant/[id]/page.tsx`
- Create: `components/restaurant/RestaurantDetail.tsx`
- Create: `components/restaurant/PriceStamp.tsx`
- Create: `components/restaurant/PlaceholderActions.tsx`

- [ ] **Step 1: Create PriceStamp component**

Create `components/restaurant/PriceStamp.tsx`:
```tsx
import { getVerificationStatus } from "@/lib/utils/price"

type PriceStampProps = {
  verifiedAt: string
}

export function PriceStamp({ verifiedAt }: PriceStampProps) {
  const { label, isStale } = getVerificationStatus(verifiedAt)

  if (isStale) {
    return (
      <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
        ⚠️ {label}
      </div>
    )
  }

  return (
    <div className="mt-3 flex items-center gap-1.5">
      <span className="text-sm text-emerald-500">✓</span>
      <span className="text-sm font-medium text-emerald-600">{label}</span>
    </div>
  )
}
```

- [ ] **Step 2: Create PlaceholderActions component**

Create `components/restaurant/PlaceholderActions.tsx`:
```tsx
export function PlaceholderActions() {
  return (
    <>
      {/* Vote section placeholder */}
      <div className="border-t border-gray-100 pt-6 opacity-40">
        <h3 className="mb-2.5 text-sm font-semibold text-gray-900">
          Is this price still accurate?
        </h3>
        <div className="flex gap-3">
          <div className="flex flex-1 flex-col items-center rounded-xl bg-gray-100 py-3">
            <span className="text-2xl">👍</span>
            <span className="mt-1 text-xs text-gray-500">Still accurate</span>
          </div>
          <div className="flex flex-1 flex-col items-center rounded-xl bg-gray-100 py-3">
            <span className="text-2xl">👎</span>
            <span className="mt-1 text-xs text-gray-500">Price changed</span>
          </div>
        </div>
        <p className="mt-2 text-center text-[11px] text-gray-400">Coming soon</p>
      </div>

      {/* Comments placeholder */}
      <div className="border-t border-gray-100 pt-6 opacity-40">
        <h3 className="mb-2.5 text-sm font-semibold text-gray-900">Comments</h3>
        <div className="rounded-xl bg-gray-50 py-5 text-center text-sm text-gray-400">
          💬 Comments coming soon
        </div>
      </div>

      {/* Flag button placeholder */}
      <div className="border-t border-gray-100 pt-6 text-center opacity-40">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-400">
          🚩 Report outdated info
        </span>
        <p className="mt-1.5 text-[11px] text-gray-400">Coming soon</p>
      </div>
    </>
  )
}
```

- [ ] **Step 3: Create RestaurantDetail component**

Create `components/restaurant/RestaurantDetail.tsx`:
```tsx
import Image from "next/image"
import Link from "next/link"
import { PlaceholderImage } from "@/components/shared/PlaceholderImage"
import { PriceStamp } from "@/components/restaurant/PriceStamp"
import { PlaceholderActions } from "@/components/restaurant/PlaceholderActions"
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

        {/* Placeholder actions for M2/M3 */}
        <PlaceholderActions />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create the restaurant detail page route**

Create `app/restaurant/[id]/page.tsx`:
```tsx
import { notFound } from "next/navigation"
import { getRestaurantById } from "@/lib/queries/restaurants"
import { RestaurantDetail } from "@/components/restaurant/RestaurantDetail"

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const restaurant = await getRestaurantById(id)

  if (!restaurant) {
    notFound()
  }

  return <RestaurantDetail restaurant={restaurant} />
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const restaurant = await getRestaurantById(id)

  if (!restaurant) {
    return { title: "Restaurant Not Found" }
  }

  return {
    title: `${restaurant.dish_name} for $${restaurant.price} at ${restaurant.name} — Guess How Much?`,
    description: `${restaurant.dish_name} for just $${restaurant.price} at ${restaurant.name} in ${restaurant.suburb}, Brisbane. Community-verified cheap eats.`,
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add app/restaurant/ components/restaurant/
git commit -m "feat: add restaurant detail page with price stamp and placeholder actions"
```

---

### Task 11: Root Layout and Global Styles

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Update root layout with app metadata**

Replace `app/layout.tsx`:
```tsx
import type { Metadata, Viewport } from "next"
import { Geist } from "next/font/google"
import "./globals.css"

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Guess How Much? — Cheap Eats Map for Brisbane",
  description:
    "Find genuinely cheap takeaway food near you. Everything under $15 AUD, verified by the community.",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#10b981",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-[family-name:var(--font-geist)]">
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Clean up globals.css**

Replace `app/globals.css` with:
```css
@import "tailwindcss";
@import "mapbox-gl/dist/mapbox-gl.css";

@keyframes slide-up {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}
```

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx app/globals.css
git commit -m "feat: update root layout with app branding and clean up global styles"
```

---

### Task 12: Not Found Page

**Files:**
- Create: `app/not-found.tsx`
- Create: `app/restaurant/[id]/not-found.tsx`

- [ ] **Step 1: Create global not-found page**

Create `app/not-found.tsx`:
```tsx
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-8 text-center">
      <span className="text-6xl">🤷</span>
      <h1 className="mt-4 text-2xl font-bold text-gray-900">Page not found</h1>
      <p className="mt-2 text-gray-500">
        The page you're looking for doesn't exist.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
      >
        Back to Map
      </Link>
    </div>
  )
}
```

- [ ] **Step 2: Create restaurant not-found page**

Create `app/restaurant/[id]/not-found.tsx`:
```tsx
import Link from "next/link"

export default function RestaurantNotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-8 text-center">
      <span className="text-6xl">🍽️</span>
      <h1 className="mt-4 text-2xl font-bold text-gray-900">
        Restaurant not found
      </h1>
      <p className="mt-2 text-gray-500">
        This listing may have been removed or doesn't exist.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
      >
        Back to Map
      </Link>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add app/not-found.tsx app/restaurant/
git commit -m "feat: add not-found pages for global and restaurant routes"
```

---

### Task 13: Final Wiring and Smoke Test

**Files:**
- Review all files for consistency
- Verify build passes

- [ ] **Step 1: Create .env.local with placeholder values**

Create `.env.local` (not committed — gitignored by default):
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token
```

- [ ] **Step 2: Verify the project builds**

```bash
npm run build
```

Expected: Build succeeds with no TypeScript errors. Pages may show runtime warnings about missing env vars — that's expected until real keys are provided.

- [ ] **Step 3: Verify dev server starts**

```bash
npm run dev
```

Expected: Dev server starts on `localhost:3000`. Home page loads (may show empty map without Mapbox token). Navigating to `/onboarding` shows welcome screen.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete M1 — map, restaurants, onboarding, price filter, detail pages"
```
