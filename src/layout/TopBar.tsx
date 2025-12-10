// src/components/layout/TopBar.tsx
import { Link } from "react-router-dom";
import { ReactNode } from "react";
import { Avatar, AvatarFallback } from "../components/ui/avatar";

type TopBarProps = {
  rightSlot?: ReactNode;
};

export const TopBar = ({ rightSlot }: TopBarProps) => {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-2">
        <Link to="/" className="flex items-center gap-2">
          <span className="h-6 w-6 rounded bg-primary" />
          <span className="text-sm font-semibold tracking-tight">
            CoverFit
          </span>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        {rightSlot}
        <Avatar className="h-8 w-8">
          <AvatarFallback>CF</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};
