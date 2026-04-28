# Milestone 3: Social Features + PWA — Design Spec

## Overview

Add social features (community feed, comments, hot deals, featured listings), magic link auth, and PWA support to "Guess How Much?". Auth required only for posting content; all browsing remains login-free.

## Architecture

Extends M1/M2's server-first approach. Supabase Auth with magic link (email-only) for content creation. Three new database tables (posts, comments, deals). PWA via web manifest + service worker. Real-time not needed for MVP — standard request/response.

## New Database Tables

### SQL Schema Addition (`supabase/schema-m3.sql`)

```sql
-- Posts table (community feed)
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  content TEXT NOT NULL,
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read posts"
  ON posts FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts"
  ON posts FOR INSERT
  WITH CHECK (true);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_restaurant ON comments (restaurant_id);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read comments"
  ON comments FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  WITH CHECK (true);

-- Deals table (hot deals)
CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  original_price NUMERIC(5,2),
  deal_price NUMERIC(5,2) NOT NULL CHECK (deal_price > 0),
  expires_at TIMESTAMPTZ NOT NULL,
  photo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_deals_active ON deals (is_active, expires_at);

ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active deals"
  ON deals FOR SELECT USING (is_active = true);

CREATE POLICY "Service role full access on deals"
  ON deals FOR ALL USING (true) WITH CHECK (true);
```

## New Environment Variables

None new — Supabase Auth uses the existing `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Authentication

### Approach: Supabase Magic Link (Email Only)

**Flow:**
1. User taps "Sign in" on feed or comment section
2. Modal/inline form: enter email address
3. Supabase sends magic link email
4. User clicks link → redirected to `/api/auth/callback` → session established
5. User is now logged in — can post to feed and comment

**Session Management:**
- Supabase Auth via `@supabase/ssr` — cookie-based sessions
- Server components read session from cookies
- Client components use `createBrowserClient()` from `@supabase/ssr`
- Session persists across page loads until logout

**Auth UI:**
- No separate login page — inline auth prompt where needed (feed, comments)
- "Sign in with email" input + "Send magic link" button
- After sign-in: show user's anonymized email + "Sign out" button

**Email Anonymization:**
- Display as `pri***@gmail.com` (first 3 chars of local part + `***` + domain)
- Function: `anonymizeEmail(email: string): string`

### Updated Supabase Client

Need to update `lib/supabase/client.ts` to use `@supabase/ssr` for proper cookie-based auth:
- `createBrowserSupabaseClient()` — for client components, handles auth cookies
- `createServerSupabaseClient()` — for server components, reads cookies from request

## Feature Specifications

### 1. Community Feed

**Route:** `/feed` — in `(main)` route group with bottom nav

**Content:**
- Header: "Community Feed" with "New Post" button (requires login)
- Scrollable list of posts, newest first
- Each post card: anonymized email, content text, photo (if any), relative timestamp ("2h ago")
- Empty state: "No posts yet. Be the first to share a cheap eat find!"

**Post creation (requires login):**
- Inline form at top of feed when logged in
- Fields: text content (required), photo (optional — reuse PhotoUpload component from M2)
- On submit: POST to `/api/posts`, prepend to list

**Data:** Server component fetches posts from Supabase, ordered by `created_at` desc.

### 2. Comments on Restaurant Pages

**Location:** Restaurant detail page — replaces the greyed-out "Comments coming soon" placeholder

**Content:**
- Section header: "Comments"
- List of comments, newest first
- Each comment: anonymized email, content, relative timestamp
- "Sign in to comment" prompt if not logged in
- Simple text input + "Post" button if logged in

**Data:**
- Server component fetches comments for the restaurant
- Client component handles posting via `/api/comments`

### 3. Hot Deals Feed

**Route:** `/deals` — in `(main)` route group with bottom nav

**Content:**
- Header: "Hot Deals" with "Add Deal" button
- List of active, non-expired deals sorted by expiry (soonest first)
- Each deal card: title, description, original price (strikethrough) → deal price, countdown timer, restaurant name (if linked), photo
- Countdown: "Xh Xm left" — updates every minute client-side
- Expired deals hidden automatically (filtered server-side: `expires_at > now()`)

**Deal submission (no login required):**
- New page `/deals/submit`
- Fields: title, description, deal price, original price (optional), expiry datetime, restaurant link (optional — dropdown of existing restaurants), photo (optional)
- On submit: POST to `/api/deals`

**Map integration:** "Hot Deals" banner/button on map view linking to `/deals`

### 4. Featured Listings

**Map pins:** `pin_type = "featured"` restaurants get a gold (#f59e0b) pin instead of green
- Already partially supported — `createPricePinElement` needs to accept `pinType` parameter

**Detail page:** Featured badge next to restaurant name
- Gold "Featured" pill badge

**No admin UI needed** — toggle `pin_type` directly in Supabase or via the existing passphrase-protected import tool

### 5. PWA Setup

**Manifest:** `/public/manifest.json`
```json
{
  "name": "Guess How Much?",
  "short_name": "GuessHowMuch",
  "description": "Find cheap takeaway food near you",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#10b981",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

**Service Worker:** Basic caching of app shell (HTML, CSS, JS). No offline data — just offline shell with "You're offline" message.

**Meta tags:** Added to root layout for iOS support:
```html
<link rel="manifest" href="/manifest.json" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<link rel="apple-touch-icon" href="/icons/icon-192.png" />
```

**Install prompt:** Not custom — rely on browser's native "Add to Home Screen" prompt.

## Updated Bottom Nav

4 tabs (was 3):
1. 🗺️ **Map** → `/`
2. 🔥 **Deals** → `/deals`
3. 💬 **Feed** → `/feed`
4. ❤️ **Saved** → `/saved`

Rankings accessible from a link button on the map page header (moves out of bottom nav to make room).

## New Routes

### Pages
```
app/
  (main)/feed/page.tsx           → Community feed
  (main)/deals/page.tsx          → Hot deals with countdown
  deals/submit/page.tsx          → Submit a deal form
  api/auth/callback/route.ts     → Magic link auth callback
```

### API Routes
```
app/
  api/posts/route.ts             → GET: list posts, POST: create post
  api/comments/route.ts          → GET: list by restaurant_id, POST: create
  api/deals/route.ts             → GET: list active deals, POST: create deal
```

## New Components

```
components/
  auth/
    AuthPrompt.tsx               → "Sign in with email" inline form
    AuthProvider.tsx              → Client context provider for auth state
    UserBadge.tsx                → Shows anonymized email + sign out
  feed/
    FeedList.tsx                 → List of community posts
    PostCard.tsx                 → Single post card
    NewPostForm.tsx              → Create post form (inline)
  comments/
    CommentList.tsx              → List of comments for a restaurant
    CommentForm.tsx              → Post comment form
  deals/
    DealsList.tsx                → List of hot deals
    DealCard.tsx                 → Single deal with countdown
    DealSubmitForm.tsx           → Submit new deal form
    CountdownTimer.tsx           → Client-side countdown component
  featured/
    FeaturedBadge.tsx            → Gold "Featured" badge
```

## New Utility Functions

```
lib/
  utils/
    auth.ts                      → anonymizeEmail(), getSession() helpers
    time.ts                      → formatRelativeTime(), getCountdown()
  supabase/
    client.ts                    → Updated: use @supabase/ssr for auth cookies
    server.ts                    → Updated: read session from cookies
    middleware.ts                → Refresh auth session on request
  queries/
    posts.ts                     → getPosts()
    comments.ts                  → getCommentsByRestaurant()
    deals.ts                     → getActiveDeals()
```

## Modifications to Existing Files

- `components/navigation/BottomNav.tsx` → Update to 4 tabs (add Deals, Feed; remove Rankings)
- `components/map/PricePin.tsx` → Accept `pinType` param, gold color for featured
- `components/map/MapContainer.tsx` → Pass `pinType` to PricePin
- `components/restaurant/RestaurantDetail.tsx` → Add FeaturedBadge, replace comments placeholder with real CommentList/CommentForm
- `app/(main)/map-view.tsx` → Add "Hot Deals" banner and Rankings link button
- `app/layout.tsx` → Add PWA meta tags and manifest link
- `app/(main)/layout.tsx` → Wrap with AuthProvider
- `lib/supabase/client.ts` → Rewrite for @supabase/ssr cookie auth
- `lib/supabase/server.ts` → Add cookie-based server client for auth
- `app/proxy.ts` → New: refresh auth session (Next.js 16 uses proxy.ts not middleware.ts)

## Non-Functional

- Magic link emails sent by Supabase (no custom email provider needed)
- PWA manifest + basic service worker for installability
- Countdown timers update client-side every 60 seconds
- No real-time subscriptions — standard request/response
- Comments and posts are text-only or text+photo
