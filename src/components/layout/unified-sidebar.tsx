"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Mic2,
  Music,
  Headphones,
  TrendingUp,
  Hash,
  Star,
  Sparkles,
  Settings,
  LogOut,
  Gem,
  Sliders,
  HelpCircle,
  Flame,
} from "lucide-react"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type NavItem = {
  label: string
  to: string
  icon: React.ComponentType<{ className?: string }>
}

type ChannelItem = {
  id: string
  label: string
  to: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: string
}

type ChannelCategory = {
  id: string
  title: string
  items: ChannelItem[]
}

const mainNavItems: NavItem[] = [
  { label: "커버곡 추천", to: "/songs", icon: Music },
  { label: "인기곡 차트", to: "/trending", icon: Flame },
  { label: "믹싱", to: "/mixing", icon: Headphones },
  { label: "보컬 평가", to: "/evaluation", icon: TrendingUp },
  { label: "내 정보", to: "/profile", icon: Mic2 },
]

const getChannelsByRoute = (pathname: string): ChannelCategory[] => {
  if (pathname.startsWith("/profile")) {
    return [
      {
        id: "my-info",
        title: "MY INFO",
        items: [
          { id: "vocal-style", label: "vocal-style", to: "/profile", icon: Hash },
          { id: "my-profile", label: "my-profile", to: "/profile#profile", icon: Hash },
        ],
      },
      {
        id: "records",
        title: "RECORDS",
        items: [
          { id: "performance", label: "performance", to: "/profile#performance", icon: Star },
          { id: "evaluations", label: "evaluations", to: "/profile#evaluations", icon: Hash },
        ],
      },
    ]
  }

  if (pathname.startsWith("/songs")) {
    return [
      {
        id: "discovery",
        title: "DISCOVERY",
        items: [
          { id: "recommended", label: "recommended-songs", to: "/songs", icon: Sparkles },
          { id: "trending", label: "trending-songs", to: "/songs#trending", icon: Star },
        ],
      },
    ]
  }

  if (pathname.startsWith("/mixing")) {
    return [
      {
        id: "studio",
        title: "MIXING STUDIO",
        items: [
          { id: "upload", label: "upload-cover", to: "/mixing", icon: Hash },
          { id: "queue", label: "mixing-queue", to: "/mixing#queue", icon: Hash },
        ],
      },
    ]
  }

  if (pathname.startsWith("/evaluation")) {
    return [
      {
        id: "evaluation",
        title: "VOCAL EVALUATION",
        items: [
          { id: "new", label: "new-evaluation", to: "/evaluation", icon: Sparkles },
          { id: "history", label: "evaluation-history", to: "/evaluation#history", icon: Hash },
        ],
      },
    ]
  }

  if (pathname.startsWith("/trending")) {
    return [
      {
        id: "trending",
        title: "TRENDING",
        items: [
          { id: "charts", label: "charts", to: "/trending", icon: Flame },
          { id: "new-releases", label: "new-releases", to: "/trending#new-releases", icon: Hash },
        ],
      },
    ]
  }

  return []
}

export const UnifiedSidebar = () => {
  const pathname = usePathname()
  const categories = getChannelsByRoute(pathname)
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set())

  const toggleCategory = (categoryId: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(categoryId)) {
        next.delete(categoryId)
      } else {
        next.add(categoryId)
      }
      return next
    })
  }

  return (
    <nav className="hidden md:flex w-60 flex-col glass-panel" style={{ borderRight: "1px solid var(--border-subtle)" }}>
      <div className="px-4 py-4 border-b" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl gradient-brand-main flex items-center justify-center text-white font-bold text-lg">
            CF
          </div>
          <div>
            <h2 className="text-lg font-bold" style={{ color: "var(--text-strong)" }}>
              CoverFit
            </h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              보컬 성장 플랫폼
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 border-b space-y-1" style={{ borderColor: "var(--border-subtle)" }}>
        {mainNavItems.map((item) => {
          const isActive = pathname === item.to || (item.to !== "/" && pathname.startsWith(item.to))
          const Icon = item.icon

          return (
            <Link
              key={item.to}
              href={item.to}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
                isActive ? "gradient-brand-main text-white font-medium shadow-lg" : "hover:bg-white/5",
              )}
              style={!isActive ? { color: "var(--text-default)" } : {}}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>

      <div className="p-4 mt-auto border-t" style={{ borderColor: "var(--border-subtle)" }}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group outline-none">
              <Avatar className="h-9 w-9 border border-white/10 group-hover:border-white/20 transition-colors">
                <AvatarImage src="/images/design-mode/shadcn.png" />
                <AvatarFallback className="bg-indigo-500 text-white text-xs">김</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate leading-none mb-1" style={{ color: "var(--text-strong)" }}>
                  김보컬
                </p>
                <p className="text-[10px] truncate leading-none" style={{ color: "var(--text-muted)" }}>
                  Pro Member
                </p>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" side="top" align="start" sideOffset={8}>
            <div className="flex items-center gap-3 p-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/images/design-mode/shadcn.png" />
                <AvatarFallback>김</AvatarFallback>
              </Avatar>
              <div className="flex flex-col space-y-0.5">
                <p className="text-sm font-medium leading-none">김보컬</p>
                <p className="text-xs text-muted-foreground">@kimvocal</p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <Gem className="mr-2 h-4 w-4" />
              <span>플랜 업그레이드</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Sliders className="mr-2 h-4 w-4" />
              <span>개인 맞춤 설정</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>설정</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>도움말</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer text-red-500 focus:text-red-500"
              onClick={() => (window.location.href = "/login")}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>로그아웃</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}
