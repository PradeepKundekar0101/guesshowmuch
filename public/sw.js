/* eslint-disable no-restricted-globals */
// Guess How Much — service worker (v3)
//
// Strategy
//   • Static assets (Next chunks, fonts, icons) → cache-first
//   • HTML navigations           → network-first, fallback to last cached, then /offline
//   • Image requests             → stale-while-revalidate, capped LRU
//   • API & Supabase             → network-only (no offline writes / no stale data)

const VERSION = "v3"
const STATIC_CACHE = `ghm-static-${VERSION}`
const PAGES_CACHE = `ghm-pages-${VERSION}`
const IMAGES_CACHE = `ghm-images-${VERSION}`
const IMAGE_CACHE_LIMIT = 60

const PRECACHE_URLS = [
  "/",
  "/offline",
  "/manifest.json",
  "/icons/icon.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) =>
                ![STATIC_CACHE, PAGES_CACHE, IMAGES_CACHE].includes(key)
            )
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  )
})

async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()
  if (keys.length <= maxItems) return
  for (let i = 0; i < keys.length - maxItems; i++) {
    await cache.delete(keys[i])
  }
}

function isImageRequest(request) {
  if (request.destination === "image") return true
  const url = new URL(request.url)
  return /\.(png|jpg|jpeg|webp|avif|gif|svg)$/i.test(url.pathname)
}

function isStaticAsset(request) {
  const url = new URL(request.url)
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/manifest.json" ||
    /\.(css|js|woff2?|ttf|otf|eot)$/i.test(url.pathname)
  )
}

function isApiRequest(request) {
  const url = new URL(request.url)
  return (
    url.pathname.startsWith("/api/") ||
    url.hostname.endsWith(".supabase.co") ||
    url.hostname.endsWith(".supabase.in") ||
    url.hostname === "api.mapbox.com"
  )
}

self.addEventListener("fetch", (event) => {
  const { request } = event
  if (request.method !== "GET") return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin && !isImageRequest(request)) return

  // Network-only for API / Supabase / Mapbox tiles
  if (isApiRequest(request)) return

  // Image: stale-while-revalidate, cross-origin OK (Unsplash, Cloudinary)
  if (isImageRequest(request)) {
    event.respondWith(
      caches.open(IMAGES_CACHE).then(async (cache) => {
        const cached = await cache.match(request)
        const network = fetch(request)
          .then((res) => {
            if (res.ok && (res.type === "basic" || res.type === "cors")) {
              cache.put(request, res.clone()).then(() => trimCache(IMAGES_CACHE, IMAGE_CACHE_LIMIT))
            }
            return res
          })
          .catch(() => cached)
        return cached || network
      })
    )
    return
  }

  // Static asset: cache-first
  if (isStaticAsset(request)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            if (res.ok) {
              const copy = res.clone()
              caches.open(STATIC_CACHE).then((c) => c.put(request, copy))
            }
            return res
          })
      )
    )
    return
  }

  // HTML navigation: network-first, fallback to last cached page → offline page
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone()
            caches.open(PAGES_CACHE).then((c) => c.put(request, copy))
          }
          return res
        })
        .catch(async () => {
          const cached = await caches.match(request)
          if (cached) return cached
          return caches.match("/offline")
        })
    )
    return
  }

  // Default: network-first with cache fallback
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  )
})

// Allow page to ping the SW to skip waiting after an update
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting()
})
