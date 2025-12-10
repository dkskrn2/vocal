// src/components/ui/button.tsx
import * as React from "react";
import { cn } from "../../lib/utils";

export type ButtonVariant = "default" | "outline";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: "sm" | "md";
  asChild?: boolean;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", asChild = false, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-background";

    const variantClass =
      variant === "outline"
        ? "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
        : "bg-primary text-primary-foreground hover:bg-primary/90";

    const sizeClass = size === "sm" ? "h-8 px-3" : "h-9 px-4";

    const Comp = asChild ? "span" : "button";

    return (
      <Comp
        ref={asChild ? undefined : ref}
        className={cn(base, variantClass, sizeClass, className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
