"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import gsap from "gsap";

interface Option {
    value: string;
    label: string;
}

interface QuartzSelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    label?: string;
}

export function QuartzSelect({ options, value, onChange, label }: QuartzSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const selectedOption = options.find(opt => opt.value === value) || options[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen) {
            gsap.fromTo(dropdownRef.current, 
                { opacity: 0, y: -4, scale: 0.98 },
                { opacity: 1, y: 0, scale: 1, duration: 0.2, ease: "power2.out" }
            );
        }
    }, [isOpen]);

    return (
        <div className="space-y-4 w-full" ref={containerRef}>
            {label && (
                <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-quartz-muted font-bold block">
                    {label}
                </label>
            )}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "w-full h-12 bg-quartz-bg border border-quartz-border rounded-sm px-4 flex items-center justify-between transition-all hover:bg-white/[0.02] active:scale-[0.99] relative z-[101]",
                        isOpen && "border-quartz-accent/40 ring-1 ring-quartz-accent/20 rounded-b-none"
                    )}
                >
                    <span className="font-mono text-xs text-quartz-text">{selectedOption.label}</span>
                    <ChevronDown className={cn("w-3.5 h-3.5 text-quartz-muted transition-transform duration-300", isOpen && "rotate-180")} />
                </button>

                {isOpen && (
                    <div 
                        ref={dropdownRef}
                        className="absolute z-[100] top-full left-0 right-0 bg-quartz-bg border border-quartz-border border-t-0 rounded-b-sm shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden backdrop-blur-xl"
                    >
                        <div className="py-1 border-t border-quartz-border/30">
                            {options.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={cn(
                                        "w-full px-4 py-3 text-left font-mono text-[11px] transition-all hover:bg-quartz-accent/10 hover:translate-x-1",
                                        value === option.value ? "text-quartz-accent bg-white/[0.03]" : "text-quartz-text"
                                    )}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
