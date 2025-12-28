"use client"

import type { ReactNode } from "react"
import { UnifiedSidebar } from "./unified-sidebar"
import { MobileBottomNav } from "./mobile-bottom-nav"

type AppLayoutProps = {
  children: ReactNode
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="flex h-screen" style={{ backgroundColor: "var(--bg-base)" }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-96 h-96 gradient-blob-purple opacity-30" />
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] gradient-blob-pink opacity-25" />
        <div className="absolute bottom-[-15%] left-[30%] w-[450px] h-[450px] gradient-blob-blue opacity-20" />
      </div>

      <UnifiedSidebar />

      <div className="flex flex-1 flex-col overflow-hidden relative z-10">
        <main className="flex-1 overflow-auto p-4 md:p-6 pb-24 md:pb-6" style={{ color: "var(--text-default)" }}>
          {children}
        </main>
      </div>

      <MobileBottomNav />
    </div>
  )
}
