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
