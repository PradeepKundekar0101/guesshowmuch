"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Map, Flame, MessageCircle, Heart } from "lucide-react"

const tabs = [
  { href: "/", icon: Map, label: "Map" },
  { href: "/deals", icon: Flame, label: "Deals" },
  { href: "/feed", icon: MessageCircle, label: "Feed" },
  { href: "/saved", icon: Heart, label: "Saved" },
] as const

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-100 bg-white pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href)
          const Icon = tab.icon
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 transition-colors ${
                isActive ? "text-emerald-600" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className={`text-[10px] ${isActive ? "font-semibold" : "font-medium"}`}>
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
