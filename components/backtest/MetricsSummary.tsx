"use client";

import React from "react";
import { useBacktestStore } from "@/lib/backtestStore";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Metric Card (local to this component — more compact than the      */
/*  dashboard MetricCard for the denser backtest results view)         */
/* ------------------------------------------------------------------ */

function Metric({
    label,
    value,
    sub,
    tone = "neutral",
}: {
    label: string;
    value: string;
    sub?: string;
    tone?: "positive" | "negative" | "neutral" | "accent";
}) {
    const toneClasses: Record<string, string> = {
        positive: "text-emerald-500",
        negative: "text-rose-500",
        neutral: "text-quartz-text",
        accent: "text-quartz-accent",
    };

    return (
        <div className="group relative flex flex-col justify-between p-6 transition-all hover:bg-white/[0.02]">
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-quartz-muted mb-2">
                {label}
            </p>
            <p className={cn("font-mono text-xl font-bold tracking-tight", toneClasses[tone])}>
                {value}
            </p>
            {sub && (
                <p className="mt-1.5 font-mono text-[9px] text-quartz-muted/70 uppercase tracking-wider">
                    {sub}
                </p>
            )}
            <div className="absolute right-0 top-0 h-12 w-12 bg-gradient-to-bl from-quartz-accent/[0.03] to-transparent pointer-events-none" />
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  MetricsSummary — renders a row of key performance metrics          */
/* ------------------------------------------------------------------ */

export function MetricsSummary() {
    const metrics = useBacktestStore((s) => s.metrics);
    const status = useBacktestStore((s) => s.status);

    if (status !== "completed" || !metrics) {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-px bg-quartz-border border border-quartz-border rounded-lg overflow-hidden">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-quartz-bg p-6">
                        <div className="h-3 w-16 bg-quartz-border/50 rounded mb-3 animate-pulse" />
                        <div className="h-6 w-20 bg-quartz-border/30 rounded animate-pulse" />
                    </div>
                ))}
            </div>
        );
    }

    const fmt = (n: number, decimals = 2) =>
        new Intl.NumberFormat("en-US", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        }).format(n);

    const fmtCurrency = (n: number) =>
        new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
        }).format(n);

    const pnlTone = metrics.total_pnl >= 0 ? "positive" : "negative";
    const returnTone = metrics.total_return_pct >= 0 ? "positive" : "negative";

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-px bg-quartz-border border border-quartz-border rounded-lg overflow-hidden">
            <div className="bg-quartz-bg">
                <Metric
                    label="Total P&L"
                    value={fmtCurrency(metrics.total_pnl)}
                    sub={`${metrics.total_return_pct >= 0 ? "+" : ""}${fmt(metrics.total_return_pct)}% return`}
                    tone={pnlTone}
                />
            </div>
            <div className="bg-quartz-bg">
                <Metric
                    label="Sharpe Ratio"
                    value={fmt(metrics.sharpe_ratio)}
                    sub={`Sortino: ${fmt(metrics.sortino_ratio)}`}
                    tone={metrics.sharpe_ratio >= 1 ? "positive" : metrics.sharpe_ratio >= 0 ? "neutral" : "negative"}
                />
            </div>
            <div className="bg-quartz-bg">
                <Metric
                    label="Max Drawdown"
                    value={`-${fmt(metrics.max_drawdown_pct)}%`}
                    sub={fmtCurrency(-Math.abs(metrics.max_drawdown))}
                    tone="negative"
                />
            </div>
            <div className="bg-quartz-bg">
                <Metric
                    label="Win Rate"
                    value={`${fmt(metrics.win_rate, 1)}%`}
                    sub={`${metrics.winning_trades}W / ${metrics.losing_trades}L`}
                    tone={metrics.win_rate >= 50 ? "positive" : "negative"}
                />
            </div>
            <div className="bg-quartz-bg">
                <Metric
                    label="Total Trades"
                    value={metrics.total_trades.toString()}
                    sub={metrics.avg_trade_duration}
                    tone="neutral"
                />
            </div>
            <div className="bg-quartz-bg">
                <Metric
                    label="Profit Factor"
                    value={fmt(metrics.profit_factor)}
                    sub={`Avg W: ${fmtCurrency(metrics.avg_win)} / L: ${fmtCurrency(metrics.avg_loss)}`}
                    tone={metrics.profit_factor >= 1.5 ? "positive" : metrics.profit_factor >= 1 ? "neutral" : "negative"}
                />
            </div>
        </div>
    );
}
