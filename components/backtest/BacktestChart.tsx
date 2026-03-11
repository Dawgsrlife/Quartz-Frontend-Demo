"use client";

import React, { useEffect, useRef, useCallback } from "react";
import {
    createChart,
    IChartApi,
    ISeriesApi,
    CandlestickData,
    Time,
    SeriesMarker,
    SeriesMarkerPosition,
    SeriesMarkerShape,
} from "lightweight-charts";
import { useBacktestStore } from "@/lib/backtestStore";
import type { Trade, OHLCV } from "@/services/BacktestService";

/**
 * BacktestChart — renders historical OHLCV candles with trade marker overlay.
 *
 * After a backtest completes, trade entry/exit points are drawn as markers:
 *   - Green ▲ (arrowUp below bar) for LONG entries
 *   - Red ▼ (arrowDown above bar) for SHORT entries / exits
 *
 * Uses the same lightweight-charts setup as IBKRChart for visual consistency.
 */
export function BacktestChart() {
    const containerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
    const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);

    const bars = useBacktestStore((s) => s.bars);
    const trades = useBacktestStore((s) => s.trades);
    const status = useBacktestStore((s) => s.status);
    const symbol = useBacktestStore((s) => s.symbol);

    /* ---- Build trade markers ---- */
    const buildMarkers = useCallback(
        (tradeList: Trade[]): SeriesMarker<Time>[] => {
            const markers: SeriesMarker<Time>[] = [];

            for (const trade of tradeList) {
                const isLong = trade.direction === "LONG";

                // Entry marker
                markers.push({
                    time: (new Date(trade.entry_time).getTime() / 1000) as Time,
                    position: (isLong ? "belowBar" : "aboveBar") as SeriesMarkerPosition,
                    shape: (isLong ? "arrowUp" : "arrowDown") as SeriesMarkerShape,
                    color: isLong ? "#10b981" : "#ef4444",
                    text: `${isLong ? "BUY" : "SELL"} @ ${trade.entry_price.toFixed(2)}`,
                    size: 1.5,
                });

                // Exit marker
                markers.push({
                    time: (new Date(trade.exit_time).getTime() / 1000) as Time,
                    position: (isLong ? "aboveBar" : "belowBar") as SeriesMarkerPosition,
                    shape: "circle" as SeriesMarkerShape,
                    color: trade.pnl >= 0 ? "#10b981" : "#ef4444",
                    text: `EXIT ${trade.pnl >= 0 ? "+" : ""}$${trade.pnl.toFixed(0)}`,
                    size: 1,
                });
            }

            // Sort by time (required by lightweight-charts)
            markers.sort((a, b) => (a.time as number) - (b.time as number));
            return markers;
        },
        []
    );

    /* ---- Initialize chart ---- */
    useEffect(() => {
        if (!containerRef.current) return;

        const isDark = document.documentElement.classList.contains("dark");

        const chart = createChart(containerRef.current, {
            width: containerRef.current.clientWidth,
            height: containerRef.current.clientHeight || 500,
            layout: {
                background: { color: "transparent" },
                textColor: isDark ? "#94a3b8" : "#64748b",
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
                    labelBackgroundColor: isDark ? "#0d0d0e" : "#f2f2f2",
                },
                horzLine: {
                    color: "rgba(128, 128, 128, 0.3)",
                    width: 1,
                    style: 2,
                    labelBackgroundColor: isDark ? "#0d0d0e" : "#f2f2f2",
                },
            },
            rightPriceScale: {
                borderColor: "rgba(128, 128, 128, 0.1)",
                scaleMargins: { top: 0.08, bottom: 0.25 },
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

        // Candlestick series — matches the live chart colors
        const candleSeries = chart.addCandlestickSeries({
            upColor: "#10b981",
            downColor: "#ef4444",
            borderUpColor: "#10b981",
            borderDownColor: "#ef4444",
            wickUpColor: "#10b981",
            wickDownColor: "#ef4444",
        });
        candleSeriesRef.current = candleSeries;

        // Volume histogram
        const volumeSeries = chart.addHistogramSeries({
            color: "rgba(16, 185, 129, 0.2)",
            priceFormat: { type: "volume" },
            priceScaleId: "",
        });
        volumeSeries.priceScale().applyOptions({
            scaleMargins: { top: 0.85, bottom: 0 },
        });
        volumeSeriesRef.current = volumeSeries;

        // Resize
        const ro = new ResizeObserver(() => {
            if (containerRef.current && chartRef.current) {
                chartRef.current.applyOptions({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight,
                });
            }
        });
        ro.observe(containerRef.current);

        return () => {
            ro.disconnect();
            chart.remove();
        };
    }, []);

    /* ---- Update bars ---- */
    useEffect(() => {
        if (!candleSeriesRef.current || !volumeSeriesRef.current) return;
        if (bars.length === 0) return;

        const candleData: CandlestickData[] = bars.map((bar: OHLCV) => ({
            time: bar.time as Time,
            open: bar.open,
            high: bar.high,
            low: bar.low,
            close: bar.close,
        }));

        const volumeData = bars.map((bar: OHLCV) => ({
            time: bar.time as Time,
            value: bar.volume || 0,
            color:
                bar.close >= bar.open
                    ? "rgba(16, 185, 129, 0.2)"
                    : "rgba(239, 68, 68, 0.2)",
        }));

        candleSeriesRef.current.setData(candleData);
        volumeSeriesRef.current.setData(volumeData);

        chartRef.current?.timeScale().fitContent();
    }, [bars]);

    /* ---- Update trade markers ---- */
    useEffect(() => {
        if (!candleSeriesRef.current) return;

        if (status === "completed" && trades.length > 0) {
            const markers = buildMarkers(trades);
            candleSeriesRef.current.setMarkers(markers);
        } else {
            candleSeriesRef.current.setMarkers([]);
        }
    }, [trades, status, buildMarkers]);

    /* ---- Loading / no-data states ---- */
    const showOverlay = status !== "completed" && bars.length === 0;

    return (
        <div className="relative border border-quartz-border rounded-lg overflow-hidden">
            {/* Chart header */}
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-2.5 bg-gradient-to-b from-quartz-bg via-quartz-bg/90 to-transparent pointer-events-none">
                <div className="flex items-center gap-3 pointer-events-auto">
                    <div className="flex h-5 items-center rounded-sm bg-quartz-text px-2 font-display text-[9px] font-bold text-quartz-bg uppercase tracking-tight">
                        {symbol}
                    </div>
                    <span className="font-mono text-[9px] text-quartz-muted uppercase tracking-widest">
                        Historical • Backtest View
                    </span>
                </div>
                {status === "completed" && trades.length > 0 && (
                    <div className="flex items-center gap-4 pointer-events-auto">
                        <div className="flex items-center gap-1.5">
                            <span className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[5px] border-b-emerald-500" />
                            <span className="font-mono text-[8px] text-quartz-muted uppercase">Buy</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[5px] border-t-rose-500" />
                            <span className="font-mono text-[8px] text-quartz-muted uppercase">Sell</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full border border-quartz-muted/50" />
                            <span className="font-mono text-[8px] text-quartz-muted uppercase">Exit</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Chart container */}
            <div
                ref={containerRef}
                className="w-full h-[500px] bg-quartz-bg"
                style={{ minHeight: 400 }}
            />

            {/* Overlay for loading/empty states */}
            {showOverlay && (
                <div className="absolute inset-0 flex items-center justify-center bg-quartz-bg/80 backdrop-blur-sm">
                    {status === "running" ? (
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-2 border-quartz-accent border-t-transparent rounded-full animate-spin" />
                            <p className="font-mono text-[10px] text-quartz-muted uppercase tracking-widest">
                                Loading historical data…
                            </p>
                        </div>
                    ) : (
                        <div className="text-center space-y-2">
                            <p className="font-mono text-[11px] text-quartz-muted/70 uppercase tracking-widest">
                                Select a date range & run a backtest
                            </p>
                            <p className="font-mono text-[9px] text-quartz-muted/40">
                                Historical candles will appear here with trade markers overlaid
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
