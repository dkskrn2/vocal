// src/components/ui/card.tsx
import * as React from "react";
import { cn } from "../../lib/utils";

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

export const Card = ({ className, ...props }: CardProps) => (
  <div
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className,
    )}
    {...props}
  />
);

export type CardHeaderProps = React.HTMLAttributes<HTMLDivElement>;

export const CardHeader = ({ className, ...props }: CardHeaderProps) => (
  <div className={cn("flex flex-col space-y-1.5 p-4", className)} {...props} />
);

export type CardTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

export const CardTitle = ({ className, ...props }: CardTitleProps) => (
  <h3
    className={cn("text-base font-semibold leading-none tracking-tight", className)}
    {...props}
  />
);

export type CardContentProps = React.HTMLAttributes<HTMLDivElement>;

export const CardContent = ({ className, ...props }: CardContentProps) => (
  <div className={cn("p-4 pt-0", className)} {...props} />
);
