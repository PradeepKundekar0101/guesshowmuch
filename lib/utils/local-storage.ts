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
    return true
  } else {
    bookmarks.splice(index, 1)
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks))
    return false
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
