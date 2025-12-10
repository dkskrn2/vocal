// src/components/ui/tabs.tsx
import { createContext, useContext, ReactNode, useState } from "react";
import { cn } from "../../lib/utils";

type TabsContextType = {
    value: string;
    onValueChange: (value: string) => void;
};

const TabsContext = createContext<TabsContextType | undefined>(undefined);

const useTabsContext = () => {
    const context = useContext(TabsContext);
    if (!context) {
        throw new Error("Tabs components must be used within Tabs");
    }
    return context;
};

type TabsProps = {
    defaultValue: string;
    children: ReactNode;
    className?: string;
};

export const Tabs = ({ defaultValue, children, className }: TabsProps) => {
    const [value, setValue] = useState(defaultValue);

    return (
        <TabsContext.Provider value={{ value, onValueChange: setValue }}>
            <div className={className}>{children}</div>
        </TabsContext.Provider>
    );
};

type TabsListProps = {
    children: ReactNode;
    className?: string;
};

export const TabsList = ({ children, className }: TabsListProps) => {
    return (
        <div
            className={cn(
                "inline-flex items-center gap-1 rounded bg-muted p-1",
                className
            )}
        >
            {children}
        </div>
    );
};

type TabsTriggerProps = {
    value: string;
    children: ReactNode;
    className?: string;
};

export const TabsTrigger = ({ value, children, className }: TabsTriggerProps) => {
    const { value: selectedValue, onValueChange } = useTabsContext();
    const isActive = selectedValue === value;

    return (
        <button
            type="button"
            onClick={() => onValueChange(value)}
            className={cn(
                "rounded px-3 py-1.5 text-sm font-medium transition-colors",
                isActive
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                className
            )}
        >
            {children}
        </button>
    );
};

type TabsContentProps = {
    value: string;
    children: ReactNode;
    className?: string;
};

export const TabsContent = ({ value, children, className }: TabsContentProps) => {
    const { value: selectedValue } = useTabsContext();

    if (selectedValue !== value) {
        return null;
    }

    return <div className={className}>{children}</div>;
};
