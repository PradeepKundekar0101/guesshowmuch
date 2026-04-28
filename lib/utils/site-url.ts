/**
 * Resolve the canonical site URL for redirects (magic links, OG, etc.).
 *
 * Priority (highest first):
 *   1. NEXT_PUBLIC_SITE_URL — set explicitly in Vercel and locally for prod-like links.
 *   2. NEXT_PUBLIC_VERCEL_URL — auto-set on Vercel previews/prod (no protocol).
 *   3. window.location.origin — only useful in the browser as a last resort.
 *   4. http://localhost:3000 — dev default.
 *
 * Always returns a URL with no trailing slash.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (explicit) return stripTrailingSlash(ensureProtocol(explicit))

  const vercel = process.env.NEXT_PUBLIC_VERCEL_URL?.trim()
  if (vercel) return stripTrailingSlash(ensureProtocol(vercel))

  if (typeof window !== "undefined" && window.location?.origin) {
    return stripTrailingSlash(window.location.origin)
  }

  return "http://localhost:3000"
}

/** Build an absolute URL on the canonical site, e.g. siteUrl("/api/auth/callback"). */
export function siteUrl(path: string = "/"): string {
  const base = getSiteUrl()
  if (!path) return base
  return path.startsWith("/") ? `${base}${path}` : `${base}/${path}`
}

function stripTrailingSlash(s: string) {
  return s.endsWith("/") ? s.slice(0, -1) : s
}

function ensureProtocol(s: string) {
  return /^https?:\/\//i.test(s) ? s : `https://${s}`
}
