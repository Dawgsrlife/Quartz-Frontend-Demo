"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { createChart, ColorType, IChartApi, ISeriesApi, UTCTimestamp } from "lightweight-charts";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useMarketStore } from "@/lib/store";
import { RefreshCw, WifiOff, Database, Globe } from "lucide-react";
import { apiFetch } from "@/lib/apiClient";
import { generateMockCandles } from "@/lib/mockData";

type ChartTimezone = 'ET' | 'UTC' | 'Local';

/**
 * Get the timezone offset (in seconds) from UTC to US/Eastern.
 * Handles EST (UTC-5) and EDT (UTC-4) automatically.
 */
function getETOffsetSeconds(date: Date = new Date()): number {
  // Build a formatter that gives us the ET offset
  const eastern = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    timeZoneName: 'shortOffset',
  }).formatToParts(date);
  const offsetPart = eastern.find(p => p.type === 'timeZoneName')?.value || 'GMT-5';
  // offsetPart looks like "GMT-5" or "GMT-4"
  const hours = parseInt(offsetPart.replace('GMT', ''), 10);
  return hours * 3600; // e.g. -5 * 3600 = -18000
}

/**
 * Get local timezone offset in seconds from UTC.
 */
function getLocalOffsetSeconds(): number {
  return -(new Date().getTimezoneOffset() * 60);
}

/**
 * Shift a UTC epoch-seconds timestamp for chart display based on the selected timezone.
 * lightweight-charts treats all times as UTC — we offset to fake the display.
 */
function shiftTimestamp(utcEpoch: number, tz: ChartTimezone): number {
  switch (tz) {
    case 'ET':
      return utcEpoch + getETOffsetSeconds(new Date(utcEpoch * 1000));
    case 'UTC':
      return utcEpoch; // no shift
    case 'Local':
      return utcEpoch + getLocalOffsetSeconds();
  }
}

/** @deprecated Use shiftTimestamp(epoch, 'ET') instead */
function utcToET(utcEpoch: number): number {
  return utcEpoch + getETOffsetSeconds(new Date(utcEpoch * 1000));
}

// Convert timeframe label to seconds for live candle bucketing
function getTimeframeSec(tf: string): number {
  const map: Record<string, number> = {
    '1m': 60, '5m': 300, '15m': 900,
    '1H': 3600, '4H': 14400, '1D': 86400,
  };
  return map[tf] || 300;
}

// Current front-month ES contract
const SYMBOL = "ESH6";

// Map timeframe labels to API resolution format
const TIMEFRAME_MAP: Record<string, string> = {
  '1m': '1m',
  '5m': '5m',
  '15m': '15m',
  '1H': '1h',
  '4H': '4h',
  '1D': '1d',
};

interface Bar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export function CandleChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const currentCandleRef = useRef<{time: number; open: number; high: number; low: number; close: number} | null>(null);
  const { theme } = useTheme();
  const { timeframe, setTimeframe, timezone, setTimezone } = useMarketStore();
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [lastPrice, setLastPrice] = useState<number>(0);
  const [dataSource, setDataSource] = useState<'live' | 'database' | 'bridge' | 'demo'>('database');
  const [tzOpen, setTzOpen] = useState(false);
  const tzRef = useRef<HTMLDivElement>(null);

  const isDark = theme === "dark";

  const backgroundColor = "transparent";
  const gridColor = isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)";
  const textColor = isDark ? "#94A3B8" : "#64748B";
  const upColor = isDark ? "#F59E0B" : "#E11D48";
  const downColor = isDark ? "#334155" : "#475569";

  // Map resolution to IBKR timeframe format
  const IBKR_TIMEFRAME_MAP: Record<string, string> = {
    '1m': '1m',
    '5m': '5m',
    '15m': '15m',
    '1H': '1h',
    '4H': '4h',
    '1D': '1D',
  };

  // Fetch bars from REST API - try IBKR first, then database, then local bridge
  const fetchBars = useCallback(async (tf: string, opts?: { silent?: boolean }) => {
    const silent = opts?.silent ?? false;
    if (!silent) setStatus('loading');
    const resolution = TIMEFRAME_MAP[tf] || '1m';
    const ibkrTimeframe = IBKR_TIMEFRAME_MAP[tf] || '5m';
    const tz = useMarketStore.getState().timezone;

    let bars: Bar[] = [];
    let source = 'none';

    try {
      // 1) Try IBKR endpoint first for live data
      try {
        const ibkrData = await apiFetch<any>(
          `/api/ibkr/bars?symbol=ES&timeframe=${ibkrTimeframe}&duration=1%20D`,
          { signal: AbortSignal.timeout(8000) }
        );
        
        if (ibkrData.bars && ibkrData.bars.length > 0 && !ibkrData.error) {
          // IBKR returns UTC timestamps in seconds — shift for display
          bars = ibkrData.bars.map((b: Bar) => ({ ...b, time: shiftTimestamp(b.time, tz) }));
          source = 'ibkr';
          console.log(`[Chart] Loaded ${bars.length} bars from IBKR`);
        }
      } catch (ibkrErr) {
        console.warn('[Chart] IBKR bars unavailable, falling back to database:', ibkrErr);
      }

      // 2) Try local data bridge BEFORE database (bridge has fresher data when running)
      if (bars.length === 0) {
        try {
          const bridgeResponse = await fetch(
            `http://localhost:8888/api/ibkr/bars?symbol=ES&timeframe=${ibkrTimeframe}`,
            { signal: AbortSignal.timeout(3000) }
          );
          const bridgeData = await bridgeResponse.json();
          const bridgeBars = bridgeData.bars || [];

          if (bridgeBars.length > 0) {
            // Bridge /api/ibkr/bars returns seconds (like IBKR endpoint)
            bars = bridgeBars.map((bar: Bar) => ({
              ...bar,
              time: shiftTimestamp(bar.time, tz)
            }));
            source = 'bridge';
            console.log(`[Chart] Loaded ${bars.length} bars from local data bridge`);
          }
        } catch {
          // Local bridge not running — that's fine, continue to database
        }
      }

      // 3) Fallback to database if bridge didn't return data
      if (bars.length === 0) {
        try {
          const data = await apiFetch<any>(
            `/api/bars?symbol=${SYMBOL}&resolution=${resolution}&limit=200`,
            { signal: AbortSignal.timeout(15000) }
          );

          {
            const dbBars = data.bars || [];

            if (dbBars.length > 0) {
              // Database returns milliseconds — convert to seconds then shift
              bars = dbBars.map((bar: Bar) => ({
                ...bar,
                time: shiftTimestamp(Math.floor(bar.time / 1000), tz)
              }));
              source = 'database';
              console.log(`[Chart] Loaded ${bars.length} bars from database`);
            }
          }
        } catch (dbErr: any) {
          console.warn('[Chart] Database bars failed:', dbErr);
        }
      }

      // 4) Final fallback: generate mock candlesticks for demo
      if (bars.length === 0) {
        const mockCandles = generateMockCandles(100);
        bars = mockCandles.map(c => ({
          time: shiftTimestamp(c.time, tz),
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
          volume: c.volume,
        }));
        source = 'demo';
        console.log(`[Chart] Loaded ${bars.length} mock candlesticks for demo`);
      }

      if (bars.length > 0 && seriesRef.current) {
        const chartData = bars.map(bar => ({
          time: bar.time as UTCTimestamp,
          open: bar.open,
          high: bar.high,
          low: bar.low,
          close: bar.close,
        }));

        seriesRef.current.setData(chartData);
        setLastPrice(bars[bars.length - 1].close);
        setStatus('connected');
        setDataSource(source === 'ibkr' ? 'live' : source === 'bridge' ? 'bridge' : source === 'demo' ? 'demo' : 'database');

        // Only fit content on first load (not during polling refreshes)
        if (!silent) {
          chartRef.current?.timeScale().fitContent();
        }
      } else {
        if (!silent) setStatus('error');
      }
    } catch (error) {
      console.error('Error fetching bars:', error);
      if (!silent) setStatus('error');
    }
  }, []);

  const handleRetry = useCallback(() => {
    fetchBars(timeframe);
  }, [fetchBars, timeframe]);

  // Handle timeframe change
  const handleTimeframeChange = useCallback((newTf: string) => {
    setTimeframe(newTf);
  }, [setTimeframe]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: backgroundColor },
        textColor: textColor,
        fontFamily: "var(--font-mono)",
      },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      crosshair: {
        mode: 0, // Normal mode - crosshair follows cursor exactly
        vertLine: {
          color: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
          width: 1,
          style: 1, // Dashed
          labelBackgroundColor: isDark ? '#1e293b' : '#f1f5f9',
        },
        horzLine: {
          color: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
          width: 1,
          style: 1, // Dashed
          labelBackgroundColor: isDark ? '#1e293b' : '#f1f5f9',
        },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: gridColor,
        barSpacing: 8,
        fixLeftEdge: false,
        fixRightEdge: false,
        rightOffset: 20,
      },
      rightPriceScale: {
        borderColor: gridColor,
        scaleMargins: { top: 0.1, bottom: 0.2 },
      },
      handleScale: { mouseWheel: true, pinch: true },
      handleScroll: { mouseWheel: false, pressedMouseMove: true },
    });

    const series = chart.addCandlestickSeries({
      upColor: upColor,
      downColor: downColor,
      borderVisible: false,
      wickUpColor: upColor,
      wickDownColor: downColor,
    });

    seriesRef.current = series;
    chartRef.current = chart;

    // Fetch initial data
    fetchBars(timeframe);

    // Custom wheel handler — TradingView-like zoom behavior:
    //   Default scroll: zoom anchored to the right edge of the chart
    //   Ctrl + scroll:  zoom anchored to the cursor position (built-in)
    const container = chartContainerRef.current;
    const handleWheel = (e: WheelEvent) => {
      if (!chartRef.current) return;

      if (e.ctrlKey) {
        // Ctrl held → let the built-in handler zoom at cursor position
        return;
      }

      // No modifier → zoom from the right edge (like TradingView default)
      e.preventDefault();
      e.stopPropagation();

      const ts = chartRef.current.timeScale();
      const visibleRange = ts.getVisibleLogicalRange();
      if (!visibleRange) return;

      const { from, to } = visibleRange;
      const rangeWidth = to - from;

      // Scroll up (negative deltaY) = zoom in → range shrinks
      const factor = e.deltaY > 0 ? 1.12 : 1 / 1.12;
      const newRangeWidth = rangeWidth * factor;

      // Clamp to reasonable bounds
      if (newRangeWidth < 5 || newRangeWidth > 10000) return;

      // Keep right edge fixed, adjust left edge
      ts.setVisibleLogicalRange({ from: to - newRangeWidth, to });
    };

    container.addEventListener('wheel', handleWheel, { capture: true, passive: false });

    const resizeObserver = new ResizeObserver((entries) => {
      if (chartRef.current && entries[0]?.contentRect) {
        const { width, height } = entries[0].contentRect;
        chartRef.current.applyOptions({ width, height });
      }
    });

    resizeObserver.observe(container);

    return () => {
      container.removeEventListener('wheel', handleWheel, { capture: true } as EventListenerOptions);
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [isDark]);

  // Refetch when timeframe changes
  useEffect(() => {
    if (seriesRef.current) {
      fetchBars(timeframe);
    }
  }, [timeframe, fetchBars]);

  // Re-render bars when timezone changes (data unchanged, timestamps shift)
  useEffect(() => {
    if (seriesRef.current) {
      fetchBars(timeframe);
    }
  }, [timezone, fetchBars, timeframe]);

  // Close timezone dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (tzRef.current && !tzRef.current.contains(e.target as Node)) {
        setTzOpen(false);
      }
    };
    if (tzOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [tzOpen]);

  // REST polling fallback — refetch bars every 30s so chart updates even without WebSocket.
  // This is the primary mechanism for "live" candle development on delayed data.
  // Disabled for demo mode to keep mock data static.
  useEffect(() => {
    if (status !== 'connected' || dataSource === 'demo') return;

    const pollInterval = setInterval(() => {
      console.log('[Chart] Polling for latest bars...');
      fetchBars(timeframe, { silent: true });
    }, 30_000);

    return () => clearInterval(pollInterval);
  }, [timeframe, fetchBars, status, dataSource]);

  // Subscribe to live tick updates from the Zustand store (fed by MarketDataClient WS)
  // Disabled in demo mode to keep mock data static
  useEffect(() => {
    // Skip tick subscription in demo mode
    if (dataSource === 'demo') return;
    
    // Reset live candle when timeframe changes
    currentCandleRef.current = null;

    const unsub = useMarketStore.subscribe((state) => {
      const tick = state.lastTick;
      if (!tick || !seriesRef.current || tick.price <= 0) return;

      const tz = state.timezone;
      const tfSeconds = getTimeframeSec(timeframe);
      const utcBucket = Math.floor(tick.timestamp / tfSeconds) * tfSeconds;
      const candleTime = shiftTimestamp(utcBucket, tz);

      const current = currentCandleRef.current;
      if (!current || current.time !== candleTime) {
        // New candle bucket
        currentCandleRef.current = {
          time: candleTime,
          open: tick.price,
          high: tick.price,
          low: tick.price,
          close: tick.price,
        };
      } else {
        // Update existing candle
        current.close = tick.price;
        current.high = Math.max(current.high, tick.price);
        current.low = Math.min(current.low, tick.price);
      }

      seriesRef.current!.update({
        time: currentCandleRef.current!.time as UTCTimestamp,
        open: currentCandleRef.current!.open,
        high: currentCandleRef.current!.high,
        low: currentCandleRef.current!.low,
        close: currentCandleRef.current!.close,
      });

      setLastPrice(tick.price);
      setDataSource('live');
    });

    return unsub;
  }, [timeframe, dataSource]);

  return (
    <div className="w-full h-full relative group">
      <div ref={chartContainerRef} className="w-full h-full" />

      {/* Error Overlay with Retry Button */}
      {status === 'error' && (
        <div className="absolute inset-0 z-40 backdrop-blur-md bg-[var(--bg-primary)]/70 flex flex-col items-center justify-center gap-4">
          <WifiOff className="w-10 h-10 text-[var(--text-muted)] opacity-50" />
          <span className="text-sm text-[var(--text-muted)] font-mono uppercase tracking-widest">
            Failed to Load Data
          </span>
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 px-4 py-2 rounded bg-[var(--accent)] text-black font-mono text-sm uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      )}

      {/* Loading Overlay */}
      {status === 'loading' && (
        <div className="absolute inset-0 z-40 backdrop-blur-sm bg-[var(--bg-primary)]/60 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-[var(--text-muted)] font-mono uppercase tracking-widest">
            Loading {SYMBOL} {timeframe}...
          </span>
        </div>
      )}

      {/* Symbol badge with price, data source, and timezone selector */}
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <div className="px-2 py-1 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[10px] font-mono text-[var(--accent)] shadow-sm">
          {SYMBOL}
        </div>
        {lastPrice > 0 && (
          <div className="px-2 py-1 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-primary)] font-bold shadow-sm tabular-nums">
            {lastPrice.toFixed(2)}
          </div>
        )}
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[10px] font-mono shadow-sm ${
          dataSource === 'live' ? 'text-green-500' : dataSource === 'bridge' ? 'text-amber-400' : 'text-blue-400'
        }`}>
          {dataSource === 'live' ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              LIVE
            </>
          ) : dataSource === 'bridge' ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              LOCAL BRIDGE
            </>
          ) : (
            <>
              <Database className="w-3 h-3" />
              HISTORICAL
            </>
          )}
        </div>

        {/* Timezone selector */}
        <div ref={tzRef} className="relative">
          <button
            onClick={() => setTzOpen(!tzOpen)}
            className="flex items-center gap-1 px-2 py-1 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[10px] font-mono text-[var(--text-muted)] shadow-sm hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <Globe className="w-3 h-3" />
            {timezone}
          </button>
          {tzOpen && (
            <div className="absolute top-full left-0 mt-1 z-50 rounded border border-[var(--border-subtle)] bg-[var(--bg-secondary)] shadow-lg overflow-hidden">
              {(['ET', 'UTC', 'Local'] as ChartTimezone[]).map((tz) => (
                <button
                  key={tz}
                  onClick={() => { setTimezone(tz); setTzOpen(false); }}
                  className={`block w-full text-left px-3 py-1.5 text-[10px] font-mono transition-colors cursor-pointer ${
                    timezone === tz
                      ? 'bg-[var(--accent)]/20 text-[var(--accent)]'
                      : 'text-[var(--text-muted)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {tz === 'ET' ? 'US/Eastern' : tz === 'UTC' ? 'UTC' : 'Local'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
