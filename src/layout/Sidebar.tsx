// src/components/layout/Sidebar.tsx
import { NavLink } from "react-router-dom";
import { ReactNode } from "react";
import { cn } from "../lib/utils";

type NavItem = {
  label: string;
  to: string;
  icon?: ReactNode;
};

const navItems: NavItem[] = [
  { label: "대시보드", to: "/" },
  { label: "보컬 분석", to: "/vocal-analysis" },
  { label: "곡 &amp; 세트리스트", to: "/songs" },
  { label: "녹음 · 믹싱", to: "/mixing" },
  { label: "성과 리포트", to: "/reports" },
  { label: "내 프로필", to: "/profile" },
];

export const Sidebar = () => {
  return (
    <aside className="flex w-56 flex-col border-r bg-muted/40">
      <nav className="flex flex-1 flex-col gap-1 px-2 py-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center rounded px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )
            }
          >
            {item.icon && <span className="mr-2">{item.icon}</span>}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
