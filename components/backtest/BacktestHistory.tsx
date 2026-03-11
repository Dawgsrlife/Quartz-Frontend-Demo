"use client";

import React, { useEffect } from "react";
import { useBacktestStore } from "@/lib/backtestStore";
import { cn } from "@/lib/utils";
import { Clock, TrendingUp, TrendingDown } from "lucide-react";

/**
 * BacktestHistory — sidebar panel showing previous backtest runs.
 *
 * Clicking a history item loads its results into the dashboard.
 * Polls GET /api/backtest/history on mount.
 */
export function BacktestHistory() {
    const history = useBacktestStore((s) => s.history);
    const loadHistory = useBacktestStore((s) => s.loadHistory);
    const loadResults = useBacktestStore((s) => s.loadResults);
    const jobId = useBacktestStore((s) => s.jobId);

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        const now = new Date();
        const diffMs = now.getTime() - d.getTime();
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffHrs < 1) return "Just now";
        if (diffHrs < 24) return `${diffHrs}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    return (
        <div className="border border-quartz-border rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-quartz-border bg-quartz-bg/50">
                <div className="flex items-center justify-between">
                    <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-quartz-muted">
                        Session History
                    </h3>
                    <span className="font-mono text-[9px] text-quartz-muted/50 uppercase tracking-widest">
                        {history.length} run{history.length !== 1 ? "s" : ""}
                    </span>
                </div>
            </div>

            {history.length === 0 ? (
                <div className="p-8 text-center">
                    <Clock className="w-5 h-5 text-quartz-muted/30 mx-auto mb-3" />
                    <p className="font-mono text-[9px] text-quartz-muted/50 uppercase tracking-widest">
                        No previous runs
                    </p>
                </div>
            ) : (
                <div className="divide-y divide-quartz-border/50 max-h-[400px] overflow-y-auto">
                    {history.map((item) => {
                        const isActive = item.job_id === jobId;
                        const isProfitable = (item.metrics?.total_pnl ?? 0) >= 0;
                        const isCompleted = item.status === "completed";

                        return (
                            <button
                                key={item.job_id}
                                type="button"
                                onClick={() => loadResults(item.job_id)}
                                className={cn(
                                    "w-full text-left px-6 py-4 transition-all hover:bg-white/[0.02]",
                                    isActive && "bg-quartz-accent/5 border-l-2 border-l-quartz-accent"
                                )}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2">
                                            <p className="font-mono text-[10px] font-bold text-quartz-text">
                                                {item.strategy_id.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                                            </p>
                                            <span className={cn(
                                                "inline-block w-1.5 h-1.5 rounded-full",
                                                item.status === "completed" ? "bg-emerald-500" :
                                                item.status === "running" ? "bg-amber-500 animate-pulse" :
                                                item.status === "failed" ? "bg-rose-500" : "bg-quartz-muted/30"
                                            )} />
                                        </div>
                                        <p className="font-mono text-[8px] text-quartz-muted/60 uppercase tracking-wider">
                                            {item.symbol} • {item.start_date} → {item.end_date}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        {isCompleted && item.metrics?.total_return_pct !== undefined ? (
                                            <div className="flex items-center gap-1">
                                                {isProfitable ? (
                                                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                                                ) : (
                                                    <TrendingDown className="w-3 h-3 text-rose-500" />
                                                )}
                                                <span className={cn(
                                                    "font-mono text-[11px] font-bold",
                                                    isProfitable ? "text-emerald-500" : "text-rose-500"
                                                )}>
                                                    {isProfitable ? "+" : ""}{item.metrics.total_return_pct.toFixed(2)}%
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="font-mono text-[9px] text-quartz-muted/40 uppercase">
                                                {item.status}
                                            </span>
                                        )}
                                        <p className="font-mono text-[8px] text-quartz-muted/40 mt-1">
                                            {formatDate(item.created_at)}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            <div className="px-6 py-3 border-t border-quartz-border">
                <button
                    type="button"
                    onClick={() => loadHistory()}
                    className="w-full py-2 font-mono text-[8px] font-bold uppercase tracking-[0.3em] text-quartz-muted hover:text-quartz-text border border-quartz-border border-dashed rounded-sm hover:bg-white/[0.02] transition-all"
                >
                    Refresh
                </button>
            </div>
        </div>
    );
}
