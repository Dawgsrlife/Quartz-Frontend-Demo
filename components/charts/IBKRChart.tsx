"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createChart, IChartApi, ISeriesApi, CandlestickData, LineData, Time } from "lightweight-charts";
import { apiFetch } from "@/lib/apiClient";
import { MARKET_DATA_WS } from "@/lib/MarketDataClient";

interface Candle {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

interface IBKRChartProps {
    symbol?: string;
    timeframe?: string;
    height?: number;
    showVolume?: boolean;
}

interface Bar {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export function IBKRChart({ 
    symbol = "ES", 
    timeframe = "5m", 
    height = 500,
    showVolume = true 
}: IBKRChartProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
    const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "connecting">("connecting");
    const [lastPrice, setLastPrice] = useState<number | null>(null);
    const [priceChange, setPriceChange] = useState<number>(0);
    const [dataSource, setDataSource] = useState<"ibkr" | "database">("ibkr");

    // Map timeframe to API resolution format for database fallback
    const TIMEFRAME_MAP: Record<string, string> = {
        '1m': '1m',
        '5m': '5m',
        '15m': '15m',
        '30m': '15m',
        '1h': '1h',
        '4h': '1h',
        '1D': '1d',
    };

    // Fetch historical bars - try IBKR first, fallback to database
    const fetchBars = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            // Try IBKR endpoint first
            let data = null;
            let usedDatabase = false;
            
            try {
                data = await apiFetch<any>(`/api/ibkr/bars?symbol=${symbol}&timeframe=${timeframe}&duration=1 D`, {
                    signal: AbortSignal.timeout(8000)
                });
                
                // If IBKR returns error or no bars, try database
                if (data.error || !data.bars || data.bars.length === 0) {
                    throw new Error(data.error || "No IBKR data");
                }
            } catch (ibkrErr) {
                console.warn("IBKR bars unavailable, falling back to database:", ibkrErr);
                
                // Fallback to database endpoint
                const resolution = TIMEFRAME_MAP[timeframe] || '5m';
                const dbData = await apiFetch<any>(`/api/bars?symbol=ESH6&resolution=${resolution}&limit=200`, {
                    signal: AbortSignal.timeout(10000)
                });
                
                if (dbData.bars && dbData.bars.length > 0) {
                    // Convert database format (milliseconds) to IBKR format (seconds)
                    data = {
                        bars: dbData.bars.map((bar: Bar) => ({
                            ...bar,
                            time: Math.floor(bar.time / 1000) // Convert ms to seconds
                        }))
                    };
                    usedDatabase = true;
                } else {
                    throw new Error("No data available from IBKR or database");
                }
            }
            
            if (data.bars && data.bars.length > 0) {
                const candleData: CandlestickData[] = data.bars.map((bar: Bar) => ({
                    time: bar.time as Time,
                    open: bar.open,
                    high: bar.high,
                    low: bar.low,
                    close: bar.close,
                }));
                
                const volumeData = data.bars.map((bar: Bar) => ({
                    time: bar.time as Time,
                    value: bar.volume,
                    color: bar.close >= bar.open ? "rgba(0, 255, 136, 0.3)" : "rgba(255, 85, 85, 0.3)",
                }));
                
                if (candleSeriesRef.current) {
                    candleSeriesRef.current.setData(candleData);
                }
                
                if (volumeSeriesRef.current && showVolume) {
                    volumeSeriesRef.current.setData(volumeData);
                }
                
                // Set initial last price
                const lastBar = data.bars[data.bars.length - 1];
                if (lastBar) {
                    setLastPrice(lastBar.close);
                }
                
                setDataSource(usedDatabase ? "database" : "ibkr");
                
                // Fit chart to show all data
                chartRef.current?.timeScale().fitContent();
            }
        } catch (err) {
            console.error("Failed to fetch bars:", err);
            setError(err instanceof Error ? err.message : "Failed to load chart data");
        } finally {
            setIsLoading(false);
        }
    }, [symbol, timeframe, showVolume]);

    // Initialize chart
    useEffect(() => {
        if (!containerRef.current) return;

        const chart = createChart(containerRef.current, {
            width: containerRef.current.clientWidth,
            height: height,
            layout: {
                background: { color: "#050509" },
                textColor: "#8a8a8a",
                fontFamily: "'JetBrains Mono', monospace",
            },
            grid: {
                vertLines: { color: "rgba(255, 255, 255, 0.03)" },
                horzLines: { color: "rgba(255, 255, 255, 0.03)" },
            },
            crosshair: {
                mode: 1,
                vertLine: {
                    color: "rgba(255, 255, 255, 0.2)",
                    width: 1,
                    style: 2,
                    labelBackgroundColor: "#1a1a1a",
                },
                horzLine: {
                    color: "rgba(255, 255, 255, 0.2)",
                    width: 1,
                    style: 2,
                    labelBackgroundColor: "#1a1a1a",
                },
            },
            rightPriceScale: {
                borderColor: "rgba(255, 255, 255, 0.1)",
                scaleMargins: {
                    top: 0.1,
                    bottom: showVolume ? 0.25 : 0.1,
                },
            },
            timeScale: {
                borderColor: "rgba(255, 255, 255, 0.1)",
                timeVisible: true,
                secondsVisible: false,
            },
        });

        chartRef.current = chart;

        // Create candlestick series
        const candleSeries = chart.addCandlestickSeries({
            upColor: "#00ff88",
            downColor: "#ff5555",
            borderUpColor: "#00ff88",
            borderDownColor: "#ff5555",
            wickUpColor: "#00ff88",
            wickDownColor: "#ff5555",
        });
        candleSeriesRef.current = candleSeries;

        // Create volume series
        if (showVolume) {
            const volumeSeries = chart.addHistogramSeries({
                color: "rgba(0, 255, 136, 0.3)",
                priceFormat: { type: "volume" },
                priceScaleId: "",
            });
            
            volumeSeries.priceScale().applyOptions({
                scaleMargins: {
                    top: 0.85,
                    bottom: 0,
                },
            });
            
            volumeSeriesRef.current = volumeSeries;
        }

        // Handle resize
        const handleResize = () => {
            if (containerRef.current && chartRef.current) {
                chartRef.current.applyOptions({ 
                    width: containerRef.current.clientWidth 
                });
            }
        };

        window.addEventListener("resize", handleResize);

        // Fetch initial data
        fetchBars();

        return () => {
            window.removeEventListener("resize", handleResize);
            chart.remove();
        };
    }, [height, showVolume, fetchBars]);

    // Subscribe to live market data via WebSocket proxy
    useEffect(() => {
        if (!MARKET_DATA_WS) return;
        
        let ws: WebSocket | null = null;
        
        try {
            ws = new WebSocket(MARKET_DATA_WS);
            
            ws.onopen = () => {
                setConnectionStatus("connected");
            };
            
            ws.onmessage = (event) => {
                try {
                    const tick = JSON.parse(event.data);
                    if (tick.price && candleSeriesRef.current) {
                        setLastPrice((prev) => {
                            if (prev !== null) {
                                setPriceChange(tick.price - prev);
                            }
                            return tick.price;
                        });
                    }
                } catch (e) {
                    // ignore parse errors
                }
            };
            
            ws.onclose = () => {
                setConnectionStatus("disconnected");
            };
            
            ws.onerror = () => {
                setConnectionStatus("disconnected");
            };
        } catch {
            setConnectionStatus("disconnected");
        }

        return () => {
            ws?.close();
        };
    }, [showVolume]);

    return (
        <div className="relative h-full w-full">
            {/* Header with status and price */}
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-2 bg-gradient-to-b from-[#050509] to-transparent">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="flex h-6 items-center rounded-sm bg-white/90 px-2 font-display text-[10px] font-bold text-[#050509] uppercase tracking-tight">
                            {symbol}
                        </div>
                        <span className="font-mono text-[10px] text-white/50 uppercase tracking-widest">
                            {dataSource === "ibkr" ? "IBKR" : "DB"} • {timeframe}
                        </span>
                    </div>
                    
                    {/* Connection status */}
                    <div className="flex items-center gap-1.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${
                            connectionStatus === "connected" 
                                ? "bg-green-400 animate-pulse" 
                                : connectionStatus === "connecting"
                                ? "bg-yellow-400 animate-pulse"
                                : "bg-red-400"
                        }`} />
                        <span className="font-mono text-[9px] text-white/40 uppercase">
                            {connectionStatus === "connected" ? "LIVE" : connectionStatus === "connecting" ? "CONNECTING" : "OFFLINE"}
                        </span>
                    </div>
                    
                    {/* Data source indicator */}
                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-mono ${
                        dataSource === "ibkr" 
                            ? "bg-green-500/20 text-green-400" 
                            : "bg-blue-500/20 text-blue-400"
                    }`}>
                        {dataSource === "ibkr" ? "LIVE" : "HISTORICAL"}
                    </div>
                </div>
                
                {/* Current price */}
                {lastPrice !== null && (
                    <div className="flex items-center gap-3">
                        <span className="font-mono text-lg font-bold text-white">
                            {lastPrice.toFixed(2)}
                        </span>
                        {priceChange !== 0 && (
                            <span className={`font-mono text-xs ${priceChange >= 0 ? "text-green-400" : "text-red-400"}`}>
                                {priceChange >= 0 ? "+" : ""}{priceChange.toFixed(2)}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Loading state */}
            {isLoading && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-[#050509]">
                    <div className="relative">
                        <div className="w-10 h-10 border-2 border-green-500/20 rounded-full" />
                        <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-green-500 rounded-full animate-spin" />
                    </div>
                    <span className="font-mono text-[10px] text-green-500/70 uppercase tracking-widest">
                        Loading IBKR Data...
                    </span>
                </div>
            )}

            {/* Error state */}
            {error && !isLoading && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-[#050509]">
                    <div className="text-red-400 text-center">
                        <div className="font-mono text-[11px] uppercase tracking-wider mb-2">Connection Error</div>
                        <div className="font-mono text-[10px] text-red-400/60">{error}</div>
                    </div>
                    <button 
                        onClick={fetchBars}
                        className="mt-2 px-4 py-1.5 rounded border border-red-400/30 font-mono text-[10px] text-red-400 hover:bg-red-400/10 transition-colors uppercase tracking-wider"
                    >
                        Retry Connection
                    </button>
                </div>
            )}

            {/* Chart container */}
            <div 
                ref={containerRef} 
                className="w-full h-full"
                style={{ height: `${height}px` }}
            />
        </div>
    );
}

export default IBKRChart;
