// src/components/ui/select.tsx
import { ReactNode } from "react";
import { cn } from "../../lib/utils";

type SelectProps = {
    value: string;
    onValueChange: (value: string) => void;
    children: ReactNode;
};

export const Select = ({ value, onValueChange, children }: SelectProps) => {
    return (
        <div className="relative">
            {children}
        </div>
    );
};

type SelectTriggerProps = {
    className?: string;
    children: ReactNode;
};

export const SelectTrigger = ({ className, children }: SelectTriggerProps) => {
    return (
        <button
            type="button"
            className={cn(
                "flex w-full items-center justify-between rounded border bg-background px-3 py-2 text-sm",
                className
            )}
        >
            {children}
        </button>
    );
};

type SelectValueProps = {
    placeholder?: string;
};

export const SelectValue = ({ placeholder }: SelectValueProps) => {
    return <span>{placeholder}</span>;
};

type SelectContentProps = {
    children: ReactNode;
};

export const SelectContent = ({ children }: SelectContentProps) => {
    return (
        <div className="absolute z-50 mt-1 w-full rounded border bg-background shadow-lg">
            {children}
        </div>
    );
};

type SelectItemProps = {
    value: string;
    children: ReactNode;
};

export const SelectItem = ({ value, children }: SelectItemProps) => {
    return (
        <div
            className="cursor-pointer px-3 py-2 text-sm hover:bg-muted"
            data-value={value}
        >
            {children}
        </div>
    );
};
