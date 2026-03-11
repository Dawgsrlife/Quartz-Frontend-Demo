"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface QuartzInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export function QuartzInput({ label, className, ...props }: QuartzInputProps) {
    return (
        <div className="space-y-4 w-full">
            {label && (
                <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-quartz-muted font-bold block">
                    {label}
                </label>
            )}
            <input
                {...props}
                className={cn(
                    "w-full h-12 bg-quartz-bg border border-quartz-border rounded-sm px-4 font-mono text-xs text-quartz-text transition-all duration-300",
                    "placeholder:text-quartz-muted/40",
                    "focus:outline-none focus:border-quartz-accent/40 focus:ring-1 focus:ring-quartz-accent/20 focus:bg-white/[0.01]",
                    "hover:bg-white/[0.02]",
                    className
                )}
            />
        </div>
    );
}
