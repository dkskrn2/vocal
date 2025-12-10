// src/components/ui/avatar.tsx
import * as React from "react";
import { cn } from "../../lib/utils";

export type AvatarProps = React.HTMLAttributes<HTMLDivElement>;

export const Avatar = ({ className, ...props }: AvatarProps) => (
    <div
        className={cn(
            "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
            className
        )}
        {...props}
    />
);

export type AvatarFallbackProps = React.HTMLAttributes<HTMLDivElement>;

export const AvatarFallback = ({ className, ...props }: AvatarFallbackProps) => (
    <div
        className={cn(
            "flex h-full w-full items-center justify-center rounded-full bg-muted text-sm font-medium",
            className
        )}
        {...props}
    />
);
