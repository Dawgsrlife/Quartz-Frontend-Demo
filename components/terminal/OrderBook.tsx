"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { CollapsiblePanel } from "./CollapsiblePanel";
import { RefreshCw, Radio } from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND || "";

// Derive WebSocket URL from backend URL
const L2_WS_URL = BACKEND_URL.replace(/^http/, "ws") + "/ws/l2-data";

interface L2Level {
  price: number;
  size: number;
}

interface L2Update {
  bids: L2Level[];
  asks: L2Level[];
  error?: string;
  source?: 'tick' | 'l2';  // 'tick' = top-of-book only, 'l2' = full depth
}

export function OrderBook() {
  const [book, setBook] = useState<L2Update | null>(null);
  const [status, setStatus] = useState<'checking' | 'live' | 'offline'>('checking');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connectWebSocket = useCallback(() => {
    // Clean up existing connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    try {
      console.log("[OrderBook] Connecting to L2 WebSocket:", L2_WS_URL);
      const ws = new WebSocket(L2_WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("[OrderBook] L2 WebSocket connected");
        setStatus('live');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as L2Update;
          if (data.error) {
            console.warn("[OrderBook] L2 error:", data.error);
            setStatus('offline');
            return;
          }
          if (data.bids || data.asks) {
            setBook(data);
          }
        } catch (e) {
          console.error("[OrderBook] Failed to parse L2 data:", e);
        }
      };

      ws.onerror = (error) => {
        console.error("[OrderBook] L2 WebSocket error:", error);
      };

      ws.onclose = () => {
        console.log("[OrderBook] L2 WebSocket closed");
        wsRef.current = null;
        // Don't auto-reconnect immediately - let status check handle it
      };
    } catch (e) {
      console.error("[OrderBook] Failed to create WebSocket:", e);
      setStatus('offline');
    }
  }, []);

  const checkGatewayStatus = useCallback(async () => {
    setStatus('checking');
    try {
      const res = await fetch(`${BACKEND_URL}/health/ibkr`, { signal: AbortSignal.timeout(5000) });
      const data = await res.json();
      if (data.connected) {
        // Gateway is live - connect to L2 WebSocket if not already connected
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
          connectWebSocket();
        } else {
          setStatus('live');
        }
      } else {
        setStatus('offline');
        // Close WebSocket if gateway goes offline
        if (wsRef.current) {
          wsRef.current.close();
          wsRef.current = null;
        }
        setBook(null);
      }
    } catch {
      setStatus('offline');
    }
  }, [connectWebSocket]);

  useEffect(() => {
    checkGatewayStatus();
    // Recheck every 30 seconds
    const interval = setInterval(checkGatewayStatus, 30000);
    return () => {
      clearInterval(interval);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [checkGatewayStatus]);

  const bestBid = book?.bids[0]?.price || 0;
  const bestAsk = book?.asks[0]?.price || 0;
  const spread = bestBid > 0 ? Math.abs(bestAsk - bestBid).toFixed(2) : '--';
  const isTickBased = book?.source === 'tick';

  return (
    <CollapsiblePanel
      title="ORDER BOOK"
      subtitle={isTickBased ? "TOP OF BOOK" : "L2 DEEP"}
      className="h-full border-none"
      maxHeight="100%"
    >
      <div className="relative flex flex-col h-full w-full text-[10px] font-mono select-none">
        {/* Offline Overlay */}
        {status === 'offline' && (
          <div className="absolute inset-0 z-50 backdrop-blur-sm bg-[var(--bg-primary)]/80 flex flex-col items-center justify-center gap-3 p-4">
            <Radio className="w-8 h-8 text-[var(--text-muted)] opacity-50" />
            <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-widest text-center">
              Requires Live Gateway
            </span>
            <span className="text-[9px] text-[var(--text-muted)]/60 text-center">
              IBKR Gateway is offline. L2 data requires real-time connection.
            </span>
            <button
              onClick={checkGatewayStatus}
              className="flex items-center gap-2 px-3 py-1.5 bg-[var(--accent)] text-black text-[10px] font-semibold uppercase tracking-wider rounded hover:opacity-90 transition-opacity cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              Check Status
            </button>
          </div>
        )}

        {status === 'checking' && (
          <div className="absolute inset-0 z-50 backdrop-blur-sm bg-[var(--bg-primary)]/70 flex flex-col items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
            <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest">
              Checking Gateway...
            </span>
          </div>
        )}

        {/* Header */}
        <div className="grid grid-cols-3 gap-1 border-b border-[var(--border-subtle)] pb-2 mb-1 px-3 text-[var(--text-muted)] mt-2 shrink-0">
          <div>BID</div>
          <div className="text-center">SIZE</div>
          <div className="text-right">ASK</div>
        </div>

        {/* Order Book Levels */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-1">
          {book ? (
            isTickBased ? (
              // Tick-based top-of-book display (single level, centered)
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="grid grid-cols-3 gap-4 w-full px-4 py-3 bg-[var(--bg-secondary)]/50 rounded">
                  {/* Bid */}
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] text-[var(--text-muted)] uppercase mb-1">Best Bid</span>
                    <span className="text-lg font-bold text-emerald-500">
                      {book.bids[0]?.price.toFixed(2) || '--'}
                    </span>
                    <span className="text-[9px] text-[var(--text-muted)]">
                      {book.bids[0]?.size || 0} lots
                    </span>
                  </div>
                  {/* Spread */}
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-[9px] text-[var(--text-muted)] uppercase mb-1">Spread</span>
                    <span className="text-sm font-semibold text-[var(--text-primary)]">{spread}</span>
                  </div>
                  {/* Ask */}
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] text-[var(--text-muted)] uppercase mb-1">Best Ask</span>
                    <span className="text-lg font-bold text-rose-500">
                      {book.asks[0]?.price.toFixed(2) || '--'}
                    </span>
                    <span className="text-[9px] text-[var(--text-muted)]">
                      {book.asks[0]?.size || 0} lots
                    </span>
                  </div>
                </div>
                <span className="text-[8px] text-[var(--text-muted)]/60 uppercase tracking-wider">
                  Full L2 depth requires market data subscription
                </span>
              </div>
            ) : (
              // Full L2 depth display (multiple levels)
              [...Array(15)].map((_, i) => {
                const bid = book.bids[i];
                const ask = book.asks[i];
                const maxSize = 100;
                const bidWidth = bid ? Math.min((bid.size / maxSize) * 100, 100) : 0;
                const askWidth = ask ? Math.min((ask.size / maxSize) * 100, 100) : 0;

                return (
                  <div key={i} className="grid grid-cols-3 gap-1 py-1 px-2 relative">
                    {/* Bid bar */}
                    <div className="relative flex items-center">
                      <div
                        className="absolute right-0 h-full bg-emerald-500/20 rounded-l"
                        style={{ width: `${bidWidth}%` }}
                      />
                      <span className="relative z-10 text-emerald-500">{bid?.price.toFixed(2) || '--'}</span>
                    </div>
                    <div className="text-center text-[var(--text-muted)]">
                      {bid?.size || '--'} / {ask?.size || '--'}
                    </div>
                    {/* Ask bar */}
                    <div className="relative flex items-center justify-end">
                      <div
                        className="absolute left-0 h-full bg-rose-500/20 rounded-r"
                        style={{ width: `${askWidth}%` }}
                      />
                      <span className="relative z-10 text-rose-500">{ask?.price.toFixed(2) || '--'}</span>
                    </div>
                  </div>
                );
              })
            )
          ) : (
            <div className="flex items-center justify-center h-full text-[var(--text-muted)] opacity-30 italic">
              Connecting...
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-[var(--border-subtle)] py-2 px-3 flex justify-between text-[var(--text-muted)] bg-[var(--bg-secondary)]">
          <span>SPREAD: <span className="text-[var(--text-primary)]">{spread}</span></span>
          <span className={status === 'live' ? (isTickBased ? 'text-green-500' : 'text-green-500') : 'text-rose-400'}>
            {status === 'live' ? (isTickBased ? '● LIVE' : '● LIVE') : '○ OFFLINE'}
          </span>
        </div>
      </div>
    </CollapsiblePanel>
  );
}
