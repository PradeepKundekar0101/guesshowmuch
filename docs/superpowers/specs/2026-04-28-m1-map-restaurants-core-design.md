# Milestone 1: Map + Restaurants Core — Design Spec

## Overview

Build the core map experience for "Guess How Much?" — an interactive map showing cheap takeaway food (under $15 AUD) in Brisbane. Users can browse price pins, filter by price, detect their location, preview restaurants via bottom sheet, and view full restaurant detail pages.

## Architecture

**Approach:** Server-First with Next.js App Router

- Restaurant data fetched server-side (SEO, fast initial load)
- Map + filters rendered as client-side islands
- Supabase used server-side for queries; client SDK reserved for future real-time features
- API routes for future mutations (M2+)

**Tech Stack:**
- Next.js 16 (App Router, Server Components)
- React 19
- Tailwind CSS 4
- Supabase (PostgreSQL, server-side queries)
- Mapbox GL JS (map rendering)
- Vercel (hosting target)

## Database Schema

### `restaurants` table

| Column | Type | Default | Notes |
|---|---|---|---|
| id | uuid (PK) | gen_random_uuid() | |
| name | text NOT NULL | | Restaurant name |
| cuisine_type | text | | e.g. "Thai", "Vietnamese" |
| address | text | | Full street address |
| suburb | text | | For suburb-based ranking (M2) |
| city | text | 'Brisbane' | Expansion-ready |
| latitude | float8 NOT NULL | | Pin position |
| longitude | float8 NOT NULL | | Pin position |
| dish_name | text NOT NULL | | The cheap dish |
| price | numeric(5,2) NOT NULL | | AUD price |
| photo_url | text | NULL | Cloudinary URL or null |
| pin_type | text | 'standard' | Future: featured, hot_deal, top_rated |
| verified_at | timestamptz | now() | Drives date stamp |
| flag_count | int | 0 | Auto-hide at 3+ (M2) |
| vote_score | int | 0 | Thumbs up/down tally (M2) |
| is_active | boolean | true | False hides from map |
| created_at | timestamptz | now() | |
| updated_at | timestamptz | now() | |

**Design decision:** One row = one dish. A restaurant with 3 cheap dishes = 3 rows. This matches the "price pin" concept where each pin represents a specific dish at a specific price.

### Indexes
- `idx_restaurants_location` on (latitude, longitude) — spatial queries
- `idx_restaurants_price` on (price) — price filter
- `idx_restaurants_city` on (city) — city scoping
- `idx_restaurants_active` on (is_active) WHERE is_active = true — active listings

### Row Level Security
- Public read access on active restaurants (is_active = true, flag_count < 3)
- Write access restricted to service role (admin/API routes only)

## App Structure

### Pages
```
app/
  page.tsx                    → Map view (home)
  restaurant/[id]/page.tsx    → Restaurant detail (server-rendered)
  onboarding/page.tsx         → Welcome + location permission
  layout.tsx                  → Root layout
```

### Components
```
components/
  map/
    MapContainer.tsx          → Mapbox GL JS wrapper (client component)
    PricePin.tsx              → Custom marker with price badge
    RestaurantPreview.tsx     → Bottom sheet quick preview
  filters/
    PriceFilter.tsx           → Preset buttons + range slider
  restaurant/
    RestaurantDetail.tsx      → Full detail page content
    PriceStamp.tsx            → "Verified X days ago" + 90-day warning
    PlaceholderActions.tsx    → Greyed out vote/comment/flag
  onboarding/
    WelcomeScreen.tsx         → App intro + features
    LocationPrompt.tsx        → Location permission + skip
  shared/
    SearchBar.tsx             → Suburb/area search
    PlaceholderImage.tsx      → Fallback when no photo
```

### Data Layer
```
lib/
  supabase/
    server.ts                 → Server-side Supabase client
    client.ts                 → Browser Supabase client (future)
  queries/
    restaurants.ts            → Fetch/filter functions
  utils/
    geo.ts                    → Location detection, Brisbane default coords
    price.ts                  → Date stamp logic, formatting
```

## Feature Specifications

### 1. Onboarding Flow

**Trigger:** First visit only, checked via `localStorage.getItem('onboarding_complete')`

**Screen 1 — Welcome:**
- App logo/branding
- Tagline: "Find genuinely cheap takeaway food near you. Everything under $15, verified by the community."
- 3 feature highlights: live map, price filters, community-verified
- "Get Started" button → advances to Screen 2
- "No account needed to browse" note

**Screen 2 — Location Permission:**
- Explains why: centre map, show distances, find closest eats
- Privacy note: "Your location stays on your device. We never store or share it."
- "Allow Location Access" → triggers `navigator.geolocation.getCurrentPosition()`, then redirects to `/`
- "Skip — I'll search manually" → redirects to `/` with Brisbane CBD default

**After completion:** Sets `localStorage.setItem('onboarding_complete', 'true')`, never shown again.

### 2. Map View (Home Page)

**Layout:** Full-screen map with overlay controls:
- Search bar (top) — suburb/area text search, geocodes via Mapbox Geocoding API
- Price filter bar (bottom) — preset buttons ($5, $8, $12, $15) + range slider
- Location re-center button (bottom-right)
- Price pins scattered on map

**Map Configuration:**
- Mapbox GL JS with streets style
- Default center: Brisbane CBD (-27.4698, 153.0251)
- Default zoom: 13
- Clustered pins at low zoom levels (Mapbox built-in clustering)

**Price Pins:**
- Custom HTML markers showing price (e.g., "$4.90")
- Green (#10b981) background, white text, rounded pill shape
- Tap → pin highlights to amber (#f59e0b), bottom sheet slides up

**Price Filter:**
- Preset buttons: $5, $8, $12, $15 — tapping sets slider to that value and filters pins ≤ that price
- Slider: 0–15 range, dragging updates which pins are visible
- Tapping a button updates slider position; dragging slider deselects active button
- Pins outside filter range hide with a fade animation

**Location Detection:**
- On load (if permission granted): center map on user location
- Re-center button: re-triggers geolocation
- If denied/unavailable: stays on Brisbane CBD

### 3. Bottom Sheet Preview

**Trigger:** Tapping a price pin on the map

**Content:**
- Drag handle at top
- Restaurant photo (or placeholder)
- Name, cuisine type, suburb
- Price badge + dish name
- "Verified X days ago" stamp
- "View Full Details →" button

**Behavior:**
- Slides up from bottom, ~30% of screen height
- Tapping outside or dragging down dismisses
- "View Full Details" navigates to `/restaurant/[id]`

### 4. Restaurant Detail Page

**Route:** `/restaurant/[id]` — server-rendered for SEO

**Content (top to bottom):**
1. Hero photo (full-width, placeholder if none)
2. Back button (top-left overlay)
3. Restaurant name, cuisine type, suburb
4. Full address
5. Price card: dish name, price badge, verification stamp
6. 90-day warning: yellow banner if `verified_at` > 90 days ago
7. Vote section: greyed out placeholder with "Coming soon" (M2)
8. Comments section: greyed out placeholder with "Coming soon" (M3)
9. Flag button: greyed out placeholder with "Coming soon" (M2)

**Price Stamp Logic:**
- `days = Math.floor((now - verified_at) / 86400000)`
- Green: "Verified X days ago" (0–89 days)
- Yellow warning: "Price not verified in 90+ days — may be outdated" (90+ days)

### 5. Search Bar

- Text input with search icon
- Uses Mapbox Geocoding API to convert suburb/area names to coordinates
- Scoped to Brisbane/Australia
- On result selection: map flies to that location

## Data Flow

1. **Initial load:** Server component fetches all active Brisbane restaurants from Supabase
2. **Passed to client:** Restaurant data serialized as props to MapContainer
3. **Filtering:** Client-side — price filter hides/shows pins without re-fetching
4. **Detail page:** Server component fetches single restaurant by ID from Supabase
5. **Location:** Client-side only — `navigator.geolocation`, never sent to server

## Seed Data

- CSV import support for initial restaurant data
- Schema: name, cuisine_type, address, suburb, city, latitude, longitude, dish_name, price, photo_url
- A seed script (`scripts/seed.ts`) that reads CSV and inserts into Supabase
- Placeholder image used when photo_url is empty/null

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_MAPBOX_TOKEN=
```

## Non-Functional Requirements (M1 scope)

- Map loads within 3 seconds on 4G
- Server-rendered restaurant detail pages
- Responsive: mobile-first, works on desktop
- HTTPS only (Vercel default)
- No login required for any M1 feature
