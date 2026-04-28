# Milestone 2: Community Interactions — Design Spec

## Overview

Add community interaction features to "Guess How Much?" — restaurant submissions, value voting, suburb rankings, bookmarks, flagging, CSV import, and bottom navigation. All features work without login.

## Architecture

Extends M1's server-first approach. New API routes handle mutations (votes, flags, submissions). Client-side localStorage tracks per-device state (votes cast, flags sent, bookmarks). No new auth required.

## New Database Changes

No new tables. M1 schema already has `vote_score`, `flag_count`, `is_active` on `restaurants`. Submissions go directly into `restaurants` table (no staging/moderation — admin panel was explicitly skipped).

## New Environment Variables

```
ADMIN_PASSPHRASE=your-admin-passphrase
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-unsigned-upload-preset
```

## New Routes

### Pages
```
app/
  submit/page.tsx           → Submit restaurant form
  rankings/page.tsx         → Suburb popularity rankings
  saved/page.tsx            → Bookmarked restaurants
  import/page.tsx           → CSV import (admin-gated)
```

### API Routes
```
app/
  api/restaurants/route.ts              → POST: create restaurant
  api/restaurants/[id]/vote/route.ts    → POST: thumbs up/down
  api/restaurants/[id]/flag/route.ts    → POST: flag outdated info
  api/import/route.ts                   → POST: bulk CSV import
```

## New Components

```
components/
  navigation/
    BottomNav.tsx             → 3-tab nav bar (Map, Rankings, Saved)
    FloatingSubmitButton.tsx  → "+" button to open submit form
  submit/
    SubmitForm.tsx            → Restaurant submission form
    PhotoUpload.tsx           → Cloudinary upload with client-side compression
  voting/
    VoteButtons.tsx           → Thumbs up/down (replaces placeholder)
  bookmark/
    BookmarkButton.tsx        → Heart/save toggle
  flag/
    FlagButton.tsx            → Report outdated info (replaces placeholder)
  rankings/
    SuburbRankings.tsx        → Suburb list with top restaurants
  saved/
    SavedList.tsx             → List of bookmarked restaurants
  import/
    CsvImportForm.tsx         → File upload + passphrase input
```

## Feature Specifications

### 1. Submit a Restaurant Form

**Route:** `/submit` — client component page

**Fields:**
| Field | Type | Required | Notes |
|---|---|---|---|
| Restaurant name | text | yes | |
| Dish name | text | yes | The cheap dish |
| Price | number | yes | Must be > 0 and ≤ 15 |
| Cuisine type | text select | yes | Dropdown: Vietnamese, Thai, Japanese, Chinese, Korean, Indian, Mexican, Italian, Greek, Middle Eastern, Malaysian, Taiwanese, Australian, Vegetarian, Asian Fusion, Other |
| Address | text | yes | Street address |
| Suburb | text | yes | |
| Photo | file upload | no | JPEG/PNG, compressed to ≤ 500KB |

**Behavior:**
- Floating "+" button on the map view opens `/submit`
- Address is geocoded via Mapbox Geocoding API to get latitude/longitude
- If geocoding fails, show error asking user to check the address
- Photo uploaded to Cloudinary via unsigned upload preset (client-side)
- Photo compressed client-side using canvas: resize to max 1200px wide, JPEG quality 0.7, target ≤ 500KB
- On success: redirect to map, show the new pin
- City defaults to "Brisbane" (hardcoded for launch)
- `verified_at` set to now, `pin_type` set to "standard"
- No login required

**API:** `POST /api/restaurants`
- Validates all required fields
- Validates price range (0 < price ≤ 15)
- Inserts into `restaurants` table using service role
- Returns the created restaurant

### 2. Value Voting (Thumbs Up/Down)

**Location:** Restaurant detail page — replaces greyed-out placeholder from M1

**Behavior:**
- Two buttons: 👍 "Still accurate" and 👎 "Price changed"
- Current vote score displayed between buttons
- One vote per restaurant per device, tracked in localStorage key `votes` (object: `{ [restaurantId]: "up" | "down" }`)
- If already voted: show which way they voted, allow changing vote
- Changing vote adjusts score by 2 (removes old vote, applies new)

**API:** `POST /api/restaurants/[id]/vote`
- Body: `{ direction: "up" | "down" }`
- Increments or decrements `vote_score` on the restaurant
- Returns updated vote_score
- No auth — rate limiting via simple in-memory counter (basic abuse prevention)

### 3. Popularity Ranking by Suburb

**Route:** `/rankings` — server component page

**Content:**
- Header: "Popular Suburbs"
- List of suburbs sorted by total vote score (sum of all restaurant vote_scores in that suburb)
- Each suburb card shows: suburb name, total score, number of restaurants, top 3 restaurants with prices
- Tapping a restaurant navigates to its detail page
- Tapping a suburb name flies the map to that suburb's center

**Data:** Server-side query grouping restaurants by suburb, aggregating vote scores, ordering descending.

### 4. Save/Bookmark to Device

**Location:** Bookmark icon on RestaurantPreview (bottom sheet) and RestaurantDetail page

**Behavior:**
- Heart icon toggle — filled when bookmarked, outline when not
- Stored in localStorage key `bookmarks` (array of restaurant IDs)
- No login required
- Instant feedback (optimistic UI)

**Saved Page (`/saved`):**
- List of all bookmarked restaurants
- Each card shows: photo/placeholder, name, cuisine, suburb, dish, price
- Tapping navigates to detail page
- "Remove" swipe or button to unbookmark
- Empty state: "No saved restaurants yet. Browse the map and tap the heart icon to save."

### 5. Flag Outdated Info

**Location:** Restaurant detail page — replaces greyed-out placeholder from M1

**Behavior:**
- "🚩 Report outdated info" button
- One flag per restaurant per device, tracked in localStorage key `flags` (array of restaurant IDs)
- After flagging: button changes to "Flagged" (disabled)
- Increments `flag_count` on the restaurant
- When `flag_count >= 3`: restaurant auto-hidden (existing RLS policy handles this)

**API:** `POST /api/restaurants/[id]/flag`
- Increments `flag_count` by 1
- Returns updated flag_count
- No auth

### 6. CSV Import Tool

**Route:** `/import` — client component page

**Access:** Protected by passphrase. User enters passphrase, compared against `ADMIN_PASSPHRASE` env var via API route.

**Behavior:**
- Passphrase input field + "Unlock" button
- Once unlocked: file upload area for CSV
- CSV format matches `scripts/sample-data.csv`: name, cuisine_type, address, suburb, city, latitude, longitude, dish_name, price, photo_url
- Shows preview of parsed rows before import
- "Import" button triggers bulk insert
- Shows success/error count after import

**API:** `POST /api/import`
- Body: `{ passphrase: string, restaurants: RestaurantInsert[] }`
- Validates passphrase against env var
- Validates each row
- Bulk inserts valid rows
- Returns: `{ imported: number, errors: string[] }`

### 7. Bottom Navigation Bar

**Location:** Persistent on map view, rankings, and saved pages

**Tabs:**
1. 🗺️ **Map** → `/`
2. 🏆 **Rankings** → `/rankings`
3. ❤️ **Saved** → `/saved`

**Behavior:**
- Fixed to bottom of screen
- Active tab highlighted in emerald
- Does not show on: onboarding, submit form, restaurant detail, import page

**Implementation:** Wrap pages that need the nav in a layout group `(main)`:
```
app/
  (main)/
    layout.tsx          → Adds BottomNav
    page.tsx            → Map (move from app/page.tsx)
    map-view.tsx        → (move from app/map-view.tsx)
    rankings/page.tsx
    saved/page.tsx
```

### 8. Floating Submit Button

**Location:** Map view only — bottom-right, above the nav bar

**Behavior:**
- Green circle with "+" icon
- Navigates to `/submit`
- Positioned above the price filter bar

## Data Flow

### Voting
1. User taps 👍 or 👎 on detail page
2. Check localStorage — if already voted same direction, no-op
3. If changing vote or new vote: call `POST /api/restaurants/[id]/vote`
4. API updates `vote_score` in Supabase
5. Update localStorage vote record
6. Update UI optimistically

### Submission
1. User fills form on `/submit`
2. If photo: compress client-side, upload to Cloudinary, get URL
3. Geocode address via Mapbox
4. Call `POST /api/restaurants` with all fields
5. On success: redirect to `/` (map)

### Flagging
1. User taps "Report outdated info"
2. Check localStorage — if already flagged, no-op
3. Call `POST /api/restaurants/[id]/flag`
4. API increments `flag_count`
5. Update localStorage
6. Button changes to "Flagged" state

## Modifications to Existing Files

- `components/restaurant/PlaceholderActions.tsx` → Remove placeholder vote/flag sections, replace with real VoteButtons and FlagButton components
- `components/map/RestaurantPreview.tsx` → Add BookmarkButton
- `components/restaurant/RestaurantDetail.tsx` → Add BookmarkButton, use real VoteButtons and FlagButton
- `app/page.tsx` → Move into `app/(main)/page.tsx` route group
- `app/map-view.tsx` → Move into `app/(main)/map-view.tsx`, add FloatingSubmitButton
- `app/layout.tsx` → Stays as root layout (no nav)
- `app/(main)/layout.tsx` → New layout that adds BottomNav

## Non-Functional

- Photo compression happens client-side (no server processing)
- localStorage used for votes, flags, bookmarks — no user accounts needed
- API routes use service role key for writes
- Basic rate limiting on vote/flag endpoints (in-memory, resets on deploy)
