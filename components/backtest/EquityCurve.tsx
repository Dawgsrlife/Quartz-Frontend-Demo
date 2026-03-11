"use client";

import React, { useEffect, useRef } from "react";
import { createChart, IChartApi, ISeriesApi, LineData, Time } from "lightweight-charts";
import { useBacktestStore } from "@/lib/backtestStore";

/**
 * EquityCurve — renders two synced charts:
 *   1. Equity line (cumulative portfolio value)
 *   2. Drawdown area (negative % from peak)
 *
 * Uses lightweight-charts for consistency with the rest of Quartz.
 */
export function EquityCurve() {
    const containerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const equitySeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
    const drawdownSeriesRef = useRef<ISeriesApi<"Area"> | null>(null);

    const equityCurve = useBacktestStore((s) => s.equityCurve);
    const status = useBacktestStore((s) => s.status);
    const initialCapital = useBacktestStore((s) => s.initialCapital);

    /* ---- Initialize chart ---- */
    useEffect(() => {
        if (!containerRef.current) return;

        const chart = createChart(containerRef.current, {
            width: containerRef.current.clientWidth,
            height: 260,
            layout: {
                background: { color: "transparent" },
                textColor: "var(--text-muted)",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
            },
            grid: {
                vertLines: { color: "rgba(128, 128, 128, 0.05)" },
                horzLines: { color: "rgba(128, 128, 128, 0.05)" },
            },
            crosshair: {
                mode: 1,
                vertLine: {
                    color: "rgba(128, 128, 128, 0.3)",
                    width: 1,
                    style: 2,
                    labelBackgroundColor: "var(--bg-secondary)",
                },
                horzLine: {
                    color: "rgba(128, 128, 128, 0.3)",
                    width: 1,
                    style: 2,
                    labelBackgroundColor: "var(--bg-secondary)",
                },
            },
            rightPriceScale: {
                borderColor: "rgba(128, 128, 128, 0.1)",
                scaleMargins: { top: 0.05, bottom: 0.35 },
            },
            timeScale: {
                borderColor: "rgba(128, 128, 128, 0.1)",
                timeVisible: true,
                secondsVisible: false,
            },
            handleScale: { mouseWheel: true, pinch: true },
            handleScroll: { mouseWheel: true, pressedMouseMove: true },
        });

        chartRef.current = chart;

        // Equity line
        const equitySeries = chart.addLineSeries({
            color: "#10b981",
            lineWidth: 2,
            priceScaleId: "right",
            crosshairMarkerVisible: true,
            crosshairMarkerRadius: 3,
            priceFormat: {
                type: "custom",
                formatter: (price: number) =>
                    new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                        minimumFractionDigits: 0,
                    }).format(price),
            },
        });
        equitySeriesRef.current = equitySeries;

        // Drawdown area (overlaid, bottom portion)
        const drawdownSeries = chart.addAreaSeries({
            topColor: "rgba(225, 29, 72, 0.05)",
            bottomColor: "rgba(225, 29, 72, 0.2)",
            lineColor: "rgba(225, 29, 72, 0.5)",
            lineWidth: 1,
            priceScaleId: "drawdown",
            priceFormat: {
                type: "custom",
                formatter: (price: number) => `${price.toFixed(1)}%`,
            },
        });
        drawdownSeries.priceScale().applyOptions({
            scaleMargins: { top: 0.75, bottom: 0 },
            autoScale: true,
        });
        drawdownSeriesRef.current = drawdownSeries;

        // Resize handler
        const handleResize = () => {
            if (containerRef.current && chartRef.current) {
                chartRef.current.applyOptions({
                    width: containerRef.current.clientWidth,
                });
            }
        };
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            chart.remove();
        };
    }, []);

    /* ---- Update data when equityCurve changes ---- */
    useEffect(() => {
        if (!equitySeriesRef.current || !drawdownSeriesRef.current) return;
        if (equityCurve.length === 0) return;

        const equityData: LineData[] = equityCurve.map((pt) => ({
            time: (new Date(pt.timestamp).getTime() / 1000) as Time,
            value: pt.equity,
        }));

        const drawdownData: LineData[] = equityCurve.map((pt) => ({
            time: (new Date(pt.timestamp).getTime() / 1000) as Time,
            value: -Math.abs(pt.drawdown),
        }));

        equitySeriesRef.current.setData(equityData);
        drawdownSeriesRef.current.setData(drawdownData);

        chartRef.current?.timeScale().fitContent();
    }, [equityCurve]);

    /* ---- Loading / empty state ---- */
    if (status !== "completed" || equityCurve.length === 0) {
        return (
            <div className="border border-quartz-border rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-quartz-border bg-quartz-bg/50">
                    <div className="flex items-center justify-between">
                        <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-quartz-muted">
                            Equity Curve
                        </h3>
                        <span className="font-mono text-[9px] text-quartz-muted/50 uppercase tracking-widest">
                            {status === "running" ? "Computing…" : "Awaiting results"}
                        </span>
                    </div>
                </div>
                <div className="h-[260px] flex items-center justify-center">
                    {status === "running" ? (
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-6 h-6 border-2 border-quartz-accent border-t-transparent rounded-full animate-spin" />
                            <p className="font-mono text-[9px] text-quartz-muted uppercase tracking-widest">
                                Building equity curve
                            </p>
                        </div>
                    ) : (
                        <p className="font-mono text-[10px] text-quartz-muted/50 uppercase tracking-widest">
                            Run a backtest to see the equity curve
                        </p>
                    )}
                </div>
            </div>
        );
    }

    /* ---- Render ---- */
    const startValue = initialCapital;
    const endValue = equityCurve[equityCurve.length - 1]?.equity ?? initialCapital;
    const totalReturn = ((endValue - startValue) / startValue) * 100;
    const maxDD = Math.min(...equityCurve.map((p) => -Math.abs(p.drawdown)));

    return (
        <div className="border border-quartz-border rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-quartz-border bg-quartz-bg/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-quartz-muted">
                            Equity Curve
                        </h3>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                                <span className="w-3 h-[2px] bg-emerald-500 rounded" />
                                <span className="font-mono text-[8px] text-quartz-muted uppercase">Equity</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-3 h-[2px] bg-rose-500/50 rounded" />
                                <span className="font-mono text-[8px] text-quartz-muted uppercase">Drawdown</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className={`font-mono text-[10px] font-bold ${totalReturn >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                            {totalReturn >= 0 ? "+" : ""}{totalReturn.toFixed(2)}%
                        </span>
                        <span className="font-mono text-[9px] text-quartz-muted/50">
                            Max DD: {maxDD.toFixed(1)}%
                        </span>
                    </div>
                </div>
            </div>
            <div ref={containerRef} className="bg-quartz-bg" />
        </div>
    );
}
