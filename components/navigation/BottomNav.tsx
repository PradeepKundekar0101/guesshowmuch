"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Map, Flame, MessageCircle, Bookmark } from "lucide-react"

const tabs = [
  { href: "/", icon: Map, label: "Map" },
  { href: "/deals", icon: Flame, label: "Deals" },
  { href: "/feed", icon: MessageCircle, label: "Feed" },
  { href: "/saved", icon: Bookmark, label: "Saved" },
] as const

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-rule bg-paper/85 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]"
      aria-label="Primary"
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href)
          const Icon = tab.icon
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="group relative flex flex-1 flex-col items-center gap-1 py-2.5 transition-colors"
              aria-current={isActive ? "page" : undefined}
            >
              <span
                className={`flex h-7 w-12 items-center justify-center rounded-full transition-all ${
                  isActive
                    ? "bg-brand text-white"
                    : "text-ink-muted group-hover:text-ink"
                }`}
              >
                <Icon
                  size={16}
                  strokeWidth={isActive ? 2.25 : 1.75}
                />
              </span>
              <span
                className={`text-[10px] tracking-[0.08em] uppercase transition-colors ${
                  isActive ? "font-semibold text-brand" : "text-ink-muted"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
