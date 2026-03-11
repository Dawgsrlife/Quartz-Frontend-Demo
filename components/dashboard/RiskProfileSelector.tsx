"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";
import { Shield, ShieldAlert, ShieldCheck } from "lucide-react";

interface RiskOption {
    id: "conservative" | "balanced" | "aggressive";
    label: string;
    desc: string;
    icon: any;
    color: string;
}

const options: RiskOption[] = [
    {
        id: "conservative",
        label: "Conservative",
        desc: "Preservation first. Drawdown < 2%.",
        icon: ShieldCheck,
        color: "bg-emerald-500",
    },
    {
        id: "balanced",
        label: "Balanced",
        desc: "Growth focus. Drawdown < 10%.",
        icon: Shield,
        color: "bg-blue-500",
    },
    {
        id: "aggressive",
        label: "Aggressive",
        desc: "Max alpha. Drawdown < 25%.",
        icon: ShieldAlert,
        color: "bg-quartz-rose", // Using our custom rose
    },
];

export function RiskProfileSelector() {
    const [selected, setSelected] = useState<RiskOption["id"]>("balanced");
    const containerRef = useRef<HTMLDivElement>(null);
    const cursorRef = useRef<HTMLDivElement>(null);

    // Using useLayoutEffect to prevent flash of unstyled content during animation setup
    useLayoutEffect(() => {
        // Animate cursor to selected item
        const ctx = gsap.context(() => {
            const target = document.getElementById(`risk-${selected}`);
            if (target && cursorRef.current) {
                gsap.to(cursorRef.current, {
                    x: target.offsetLeft,
                    width: target.offsetWidth,
                    duration: 0.5,
                    ease: "elastic.out(1, 0.75)",
                });
            }
        }, containerRef);

        return () => ctx.revert();
    }, [selected]);

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-zinc-500">Risk Profile</label>
                <span className="text-xs text-zinc-400">Controls leverage & stop-loss</span>
            </div>

            <div
                ref={containerRef}
                className="relative flex bg-zinc-100 dark:bg-zinc-900 rounded-xl p-1 border border-zinc-200 dark:border-zinc-800"
            >
                {/* Animated Background Cursor */}
                <div
                    ref={cursorRef}
                    className="absolute top-1 bottom-1 left-0 rounded-lg bg-white dark:bg-zinc-800 shadow-sm z-0"
                ></div>

                {options.map((opt) => (
                    <button
                        key={opt.id}
                        id={`risk-${opt.id}`}
                        onClick={() => setSelected(opt.id)}
                        className={cn(
                            "relative z-10 flex-1 flex flex-col items-center justify-center py-3 text-sm font-medium transition-colors duration-200",
                            selected === opt.id ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-500 hover:text-zinc-700"
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <opt.icon className={cn("w-4 h-4", selected === opt.id ? "opacity-100" : "opacity-50")} />
                            <span>{opt.label}</span>
                        </div>
                        {selected === opt.id && (
                            <span className="text-[10px] text-zinc-400 mt-1 font-normal opacity-0 animate-fadeIn fill-mode-forwards" style={{ animationDelay: '200ms', animationName: 'fadeIn' }}>
                                {opt.desc}
                            </span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
