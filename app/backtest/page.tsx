"use client";

import React, { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

import { BacktestConfig } from "@/components/backtest/BacktestConfig";
import { BacktestChart } from "@/components/backtest/BacktestChart";
import { EquityCurve } from "@/components/backtest/EquityCurve";
import { MetricsSummary } from "@/components/backtest/MetricsSummary";
import { TradeLog } from "@/components/backtest/TradeLog";
import { PlaybackControls } from "@/components/backtest/PlaybackControls";
import { BacktestHistory } from "@/components/backtest/BacktestHistory";
import { useBacktestStore } from "@/lib/backtestStore";

/**
 * BacktestPage — US-14: Backtest UI Dashboard
 *
 * Full-featured backtesting page allowing users to:
 *   1. Configure strategy, dates, parameters
 *   2. Run a backtest via the API (Celery job)
 *   3. View historical candles with trade markers
 *   4. Analyze equity curve, metrics, and trade log
 *   5. Browse and reload previous backtest sessions
 *
 * Layout:
 *   ┌─────────────────────────────────────────────────────────────┐
 *   │  Header                                                     │
 *   ├─────────────────────────────────┬───────────────────────────┤
 *   │  Config Panel (collapsible)     │  Chart + Playback         │
 *   │                                 │                           │
 *   │                                 ├───────────────────────────┤
 *   │                                 │  Metrics Summary          │
 *   │                                 ├───────────────────────────┤
 *   │                                 │  Equity Curve             │
 *   ├─────────────────────────────────┤                           │
 *   │  Session History                ├───────────────────────────┤
 *   │                                 │  Trade Log                │
 *   └─────────────────────────────────┴───────────────────────────┘
 */
export default function BacktestPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [configCollapsed, setConfigCollapsed] = useState(() => {
        // Auto-collapse on smaller screens to prevent layout overflow
        if (typeof window !== "undefined") return window.innerWidth < 1280;
        return false;
    });
    const status = useBacktestStore((s) => s.status);
    const progress = useBacktestStore((s) => s.progress);

    /* ---- Entrance animation ---- */
    useGSAP(() => {
        const tl = gsap.timeline({ defaults: { ease: "expo.out", duration: 0.6 } });

        tl.from(".bt-header", {
            y: 10,
            opacity: 0,
            filter: "blur(4px)",
            clearProps: "all",
        })
        .from(".bt-sidebar", {
            x: -20,
            opacity: 0,
            duration: 0.5,
            clearProps: "all",
        }, "-=0.4")
        .from(".bt-main", {
            opacity: 0,
            scale: 0.99,
            duration: 0.7,
            clearProps: "all",
        }, "-=0.4")
        .from(".bt-section", {
            opacity: 0,
            y: 12,
            stagger: 0.06,
            clearProps: "all",
        }, "-=0.4");
    }, { scope: containerRef });

    return (
        <main ref={containerRef} className="h-full overflow-y-auto bg-quartz-bg">
            <div className="mx-auto max-w-[1800px] p-4 sm:p-6 lg:p-8 pb-24 space-y-6">
                {/* ---- Header ---- */}
                <header className="bt-header flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-quartz-border pb-6">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-quartz-accent" />
                            <span className="font-mono text-[9px] text-quartz-accent uppercase tracking-[0.3em] font-bold">
                                Quantitative Validation
                            </span>
                        </div>
                        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-quartz-text uppercase">
                            Backtest Dashboard
                        </h1>
                        <p className="font-mono text-[10px] text-quartz-muted tracking-[0.2em] uppercase">
                            Historical strategy simulation & performance analysis
                        </p>
                    </div>

                    <div className="flex items-center gap-8">
                        {/* Status indicator */}
                        <div className="text-right">
                            <p className="font-display text-[9px] font-bold uppercase tracking-[0.2em] text-quartz-muted mb-1">
                                Engine Status
                            </p>
                            <div className="flex items-center justify-end gap-2">
                                <span className={cn(
                                    "h-1.5 w-1.5 rounded-full",
                                    status === "running"
                                        ? "bg-amber-500 animate-pulse"
                                        : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                                )} />
                                <span className={cn(
                                    "font-mono text-[10px] font-bold tracking-wider uppercase",
                                    status === "running" ? "text-amber-500" : "text-emerald-500"
                                )}>
                                    {status === "running" ? `Running ${progress}%` : "Ready"}
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* ---- Main Layout: Sidebar + Content ---- */}
                {/* Below xl: stacks vertically. At xl+: side-by-side flex. */}
                <div className="flex flex-col xl:flex-row gap-6">
                    {/* ---- Left Sidebar: Config + History ---- */}
                    <div className={cn(
                        "bt-sidebar space-y-6 transition-all duration-300",
                        configCollapsed
                            ? "h-0 xl:h-auto xl:w-0 overflow-hidden opacity-0"
                            : "w-full xl:w-[360px] xl:shrink-0"
                    )}>
                        <BacktestConfig />
                        <BacktestHistory />
                    </div>

                    {/* Collapse toggle */}
                    <button
                        type="button"
                        onClick={() => setConfigCollapsed(!configCollapsed)}
                        className="self-start xl:self-start xl:mt-2 p-1.5 rounded border border-quartz-border hover:bg-quartz-border/50 text-quartz-muted hover:text-quartz-text transition-all shrink-0"
                        title={configCollapsed ? "Show config panel" : "Hide config panel"}
                    >
                        <span className="flex items-center gap-2">
                            {configCollapsed ? (
                                <ChevronRight className="w-3.5 h-3.5" />
                            ) : (
                                <ChevronLeft className="w-3.5 h-3.5" />
                            )}
                            <span className="xl:hidden font-mono text-[9px] uppercase tracking-widest">
                                {configCollapsed ? "Show Config" : "Hide Config"}
                            </span>
                        </span>
                    </button>

                    {/* ---- Right: Results Area ---- */}
                    <div className="bt-main flex-1 min-w-0 space-y-6">
                        {/* Chart + Playback */}
                        <section className="bt-section">
                            <BacktestChart />
                        </section>

                        <section className="bt-section">
                            <PlaybackControls />
                        </section>

                        {/* Metrics row */}
                        <section className="bt-section">
                            <MetricsSummary />
                        </section>

                        {/* Equity curve */}
                        <section className="bt-section">
                            <EquityCurve />
                        </section>

                        {/* Trade log */}
                        <section className="bt-section">
                            <TradeLog />
                        </section>
                    </div>
                </div>
            </div>
        </main>
    );
}
