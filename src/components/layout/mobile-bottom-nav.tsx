"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Mic2, Music, Headphones, TrendingUp, Flame } from "lucide-react"

type NavItem = {
  label: string
  to: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { label: "커버곡", to: "/songs", icon: Music },
  { label: "인기곡", to: "/trending", icon: Flame },
  { label: "믹싱", to: "/mixing", icon: Headphones },
  { label: "평가", to: "/evaluation", icon: TrendingUp },
  { label: "내 정보", to: "/profile", icon: Mic2 },
]

export const MobileBottomNav = () => {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass-panel"
      style={{
        borderTop: "1px solid var(--border-subtle)",
        backgroundColor: "var(--bg-elevated)",
      }}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.to || (item.to !== "/" && pathname.startsWith(item.to))
          const Icon = item.icon

          return (
            <Link
              key={item.to}
              href={item.to}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all min-w-[64px]",
                isActive ? "gradient-brand-main text-white" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
