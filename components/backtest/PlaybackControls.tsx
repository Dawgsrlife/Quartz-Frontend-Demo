"use client";

import React, { useMemo } from "react";
import { useBacktestStore } from "@/lib/backtestStore";
import { cn } from "@/lib/utils";
import { SkipBack, SkipForward, ChevronsLeft, ChevronsRight } from "lucide-react";

/**
 * PlaybackControls — a timeline scrub bar for navigating the historical chart.
 *
 * Displays the date range of the loaded bars and provides:
 *   - Range indicator showing start/end dates
 *   - Visual trade marker dots on the timeline
 *   - Step forward/backward controls
 *
 * This is a visual companion to the chart — the chart itself handles
 * scroll/zoom via lightweight-charts' built-in handlers.
 */
export function PlaybackControls() {
    const bars = useBacktestStore((s) => s.bars);
    const trades = useBacktestStore((s) => s.trades);
    const status = useBacktestStore((s) => s.status);
    const startDate = useBacktestStore((s) => s.startDate);
    const endDate = useBacktestStore((s) => s.endDate);
    const resolution = useBacktestStore((s) => s.resolution);

    /* ---- Compute trade positions on timeline ---- */
    const tradePositions = useMemo(() => {
        if (bars.length < 2 || trades.length === 0) return [];

        const startTime = bars[0].time;
        const endTime = bars[bars.length - 1].time;
        const range = endTime - startTime;

        if (range <= 0) return [];

        return trades.map((trade) => {
            const entryTime = new Date(trade.entry_time).getTime() / 1000;
            const pct = ((entryTime - startTime) / range) * 100;
            return {
                pct: Math.max(0, Math.min(100, pct)),
                isProfit: trade.pnl >= 0,
                direction: trade.direction,
            };
        });
    }, [bars, trades]);

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    if (bars.length === 0) return null;

    return (
        <div className="border border-quartz-border rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-quartz-bg flex items-center gap-4">
                {/* Left: navigation buttons */}
                <div className="flex items-center gap-1">
                    <button
                        className="p-1.5 rounded hover:bg-quartz-border/50 text-quartz-muted hover:text-quartz-text transition-colors"
                        title="Jump to start"
                    >
                        <SkipBack className="w-3 h-3" />
                    </button>
                    <button
                        className="p-1.5 rounded hover:bg-quartz-border/50 text-quartz-muted hover:text-quartz-text transition-colors"
                        title="Step backward"
                    >
                        <ChevronsLeft className="w-3 h-3" />
                    </button>
                    <button
                        className="p-1.5 rounded hover:bg-quartz-border/50 text-quartz-muted hover:text-quartz-text transition-colors"
                        title="Step forward"
                    >
                        <ChevronsRight className="w-3 h-3" />
                    </button>
                    <button
                        className="p-1.5 rounded hover:bg-quartz-border/50 text-quartz-muted hover:text-quartz-text transition-colors"
                        title="Jump to end"
                    >
                        <SkipForward className="w-3 h-3" />
                    </button>
                </div>

                {/* Center: timeline bar */}
                <div className="flex-1 relative">
                    {/* Background track */}
                    <div className="h-1.5 bg-quartz-border/50 rounded-full relative overflow-hidden">
                        {/* Data availability fill */}
                        <div className="absolute inset-0 bg-quartz-accent/20 rounded-full" />
                    </div>

                    {/* Trade marker dots on timeline */}
                    {status === "completed" && tradePositions.map((tp, idx) => (
                        <div
                            key={idx}
                            className={cn(
                                "absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full",
                                tp.isProfit ? "bg-emerald-500" : "bg-rose-500"
                            )}
                            style={{ left: `${tp.pct}%` }}
                            title={`${tp.direction} — ${tp.isProfit ? "Win" : "Loss"}`}
                        />
                    ))}
                </div>

                {/* Right: date range labels */}
                <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-[9px] text-quartz-muted uppercase tracking-wider">
                        {formatDate(startDate)}
                    </span>
                    <span className="font-mono text-[8px] text-quartz-muted/40">→</span>
                    <span className="font-mono text-[9px] text-quartz-muted uppercase tracking-wider">
                        {formatDate(endDate)}
                    </span>
                    <span className="ml-2 font-mono text-[8px] text-quartz-accent/60 uppercase">
                        {resolution}
                    </span>
                    <span className="font-mono text-[8px] text-quartz-muted/40">
                        {bars.length.toLocaleString()} bars
                    </span>
                </div>
            </div>
        </div>
    );
}
