"use client";

import React, { useMemo } from "react";
import { useBacktestStore } from "@/lib/backtestStore";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, ChevronUp, ChevronDown } from "lucide-react";
import type { Trade } from "@/services/BacktestService";

/* ------------------------------------------------------------------ */
/*  Column definitions                                                */
/* ------------------------------------------------------------------ */

type SortField = "entry_time" | "exit_time" | "direction" | "pnl" | "pnl_pct" | "quantity";

const COLUMNS: { key: SortField; label: string; align: "left" | "right" }[] = [
    { key: "direction",  label: "Side",       align: "left" },
    { key: "entry_time", label: "Entry",      align: "left" },
    { key: "exit_time",  label: "Exit",       align: "left" },
    { key: "quantity",   label: "Qty",        align: "right" },
    { key: "pnl",        label: "P&L",        align: "right" },
    { key: "pnl_pct",    label: "Return",     align: "right" },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function formatTimestamp(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
}

function formatCurrency(n: number): string {
    const sign = n >= 0 ? "+" : "";
    return `${sign}${new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
    }).format(n)}`;
}

function formatPct(n: number): string {
    const sign = n >= 0 ? "+" : "";
    return `${sign}${n.toFixed(2)}%`;
}

function formatPrice(n: number): string {
    return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(n);
}

/* ------------------------------------------------------------------ */
/*  Sort comparator                                                   */
/* ------------------------------------------------------------------ */

function compareTrades(a: Trade, b: Trade, field: SortField, dir: "asc" | "desc"): number {
    let cmp = 0;
    switch (field) {
        case "entry_time":
            cmp = new Date(a.entry_time).getTime() - new Date(b.entry_time).getTime();
            break;
        case "exit_time":
            cmp = new Date(a.exit_time).getTime() - new Date(b.exit_time).getTime();
            break;
        case "direction":
            cmp = a.direction.localeCompare(b.direction);
            break;
        case "pnl":
            cmp = a.pnl - b.pnl;
            break;
        case "pnl_pct":
            cmp = a.pnl_pct - b.pnl_pct;
            break;
        case "quantity":
            cmp = a.quantity - b.quantity;
            break;
    }
    return dir === "asc" ? cmp : -cmp;
}

/* ------------------------------------------------------------------ */
/*  TradeLog Component                                                */
/* ------------------------------------------------------------------ */

export function TradeLog() {
    const trades = useBacktestStore((s) => s.trades);
    const status = useBacktestStore((s) => s.status);
    const sortField = useBacktestStore((s) => s.sortField);
    const sortDir = useBacktestStore((s) => s.sortDir);
    const setSortField = useBacktestStore((s) => s.setSortField);

    const sortedTrades = useMemo(
        () => [...trades].sort((a, b) => compareTrades(a, b, sortField, sortDir)),
        [trades, sortField, sortDir]
    );

    /* ---- Empty / loading state ---- */
    if (status !== "completed" || trades.length === 0) {
        return (
            <div className="border border-quartz-border rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-quartz-border bg-quartz-bg/50">
                    <div className="flex items-center justify-between">
                        <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-quartz-muted">
                            Trade Log
                        </h3>
                        <span className="font-mono text-[9px] text-quartz-muted/50 uppercase tracking-widest">
                            {status === "completed" ? "0 trades" : "Awaiting results"}
                        </span>
                    </div>
                </div>
                <div className="p-12 text-center">
                    <p className="font-mono text-[10px] text-quartz-muted/50 uppercase tracking-widest">
                        {status === "running"
                            ? "Backtest in progress…"
                            : status === "completed"
                            ? "No trades were generated"
                            : "Run a backtest to see trade history"}
                    </p>
                </div>
            </div>
        );
    }

    /* ---- Table ---- */
    return (
        <div className="border border-quartz-border rounded-lg overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-quartz-border bg-quartz-bg/50">
                <div className="flex items-center justify-between">
                    <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-quartz-muted">
                        Trade Log
                    </h3>
                    <span className="font-mono text-[9px] text-quartz-muted/50 uppercase tracking-widest">
                        {trades.length} trade{trades.length !== 1 ? "s" : ""}
                    </span>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-quartz-border/50">
                            {COLUMNS.map((col) => (
                                <th
                                    key={col.key}
                                    onClick={() => setSortField(col.key)}
                                    className={cn(
                                        "px-4 py-3 font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-quartz-muted cursor-pointer select-none hover:text-quartz-text transition-colors",
                                        col.align === "right" && "text-right"
                                    )}
                                >
                                    <span className="inline-flex items-center gap-1">
                                        {col.label}
                                        {sortField === col.key && (
                                            sortDir === "asc"
                                                ? <ChevronUp className="w-3 h-3" />
                                                : <ChevronDown className="w-3 h-3" />
                                        )}
                                    </span>
                                </th>
                            ))}
                            {/* Extra columns (non-sortable) */}
                            <th className="px-4 py-3 font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-quartz-muted text-right">
                                Entry
                            </th>
                            <th className="px-4 py-3 font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-quartz-muted text-right">
                                Exit
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedTrades.map((trade, idx) => {
                            const isLong = trade.direction === "LONG";
                            const isProfitable = trade.pnl >= 0;

                            return (
                                <tr
                                    key={trade.id || idx}
                                    className="border-b border-quartz-border/30 hover:bg-white/[0.02] transition-colors"
                                >
                                    {/* Direction */}
                                    <td className="px-4 py-3">
                                        <span
                                            className={cn(
                                                "inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider",
                                                isLong ? "text-emerald-500" : "text-rose-500"
                                            )}
                                        >
                                            {isLong ? (
                                                <ArrowUpRight className="w-3 h-3" />
                                            ) : (
                                                <ArrowDownRight className="w-3 h-3" />
                                            )}
                                            {trade.direction}
                                        </span>
                                    </td>

                                    {/* Entry time */}
                                    <td className="px-4 py-3 font-mono text-[10px] text-quartz-text">
                                        {formatTimestamp(trade.entry_time)}
                                    </td>

                                    {/* Exit time */}
                                    <td className="px-4 py-3 font-mono text-[10px] text-quartz-text">
                                        {formatTimestamp(trade.exit_time)}
                                    </td>

                                    {/* Quantity */}
                                    <td className="px-4 py-3 font-mono text-[10px] text-quartz-text text-right">
                                        {trade.quantity}
                                    </td>

                                    {/* P&L */}
                                    <td
                                        className={cn(
                                            "px-4 py-3 font-mono text-[10px] font-bold text-right",
                                            isProfitable ? "text-emerald-500" : "text-rose-500"
                                        )}
                                    >
                                        {formatCurrency(trade.pnl)}
                                    </td>

                                    {/* Return % */}
                                    <td
                                        className={cn(
                                            "px-4 py-3 font-mono text-[10px] text-right",
                                            isProfitable ? "text-emerald-500/80" : "text-rose-500/80"
                                        )}
                                    >
                                        {formatPct(trade.pnl_pct)}
                                    </td>

                                    {/* Entry price */}
                                    <td className="px-4 py-3 font-mono text-[10px] text-quartz-muted text-right">
                                        {formatPrice(trade.entry_price)}
                                    </td>

                                    {/* Exit price */}
                                    <td className="px-4 py-3 font-mono text-[10px] text-quartz-muted text-right">
                                        {formatPrice(trade.exit_price)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
