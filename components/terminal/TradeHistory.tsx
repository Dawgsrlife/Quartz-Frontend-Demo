"use client";

import React, { useEffect, useState, useCallback } from "react";
import { CollapsiblePanel } from "./CollapsiblePanel";
import { RefreshCw, Radio } from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND || "";

interface Trade {
  time: number;
  price: number;
  size: number;
  side: 'buy' | 'sell';
}

export function TradeHistory() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [status, setStatus] = useState<'checking' | 'live' | 'offline'>('checking');

  const checkGatewayStatus = useCallback(async () => {
    setStatus('checking');
    try {
      const res = await fetch(`${BACKEND_URL}/health/ibkr`, { signal: AbortSignal.timeout(5000) });
      const data = await res.json();
      if (data.connected) {
        setStatus('live');
        // TODO: Connect to WebSocket for trade stream when gateway is live
      } else {
        setStatus('offline');
      }
    } catch {
      setStatus('offline');
    }
  }, []);

  useEffect(() => {
    checkGatewayStatus();
    const interval = setInterval(checkGatewayStatus, 30000);
    return () => clearInterval(interval);
  }, [checkGatewayStatus]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour12: false });
  };

  return (
    <CollapsiblePanel
      title="TIME & SALES"
      subtitle=""
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
              Time & Sales requires real-time tick stream.
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
        <div className="grid grid-cols-4 gap-1 border-b border-[var(--border-subtle)] pb-2 mb-1 px-3 text-[var(--text-muted)] mt-2 shrink-0">
          <div>TIME</div>
          <div className="text-center">SIDE</div>
          <div className="text-right">SIZE</div>
          <div className="text-right">PRICE</div>
        </div>

        {/* Trade List */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {trades.length > 0 ? (
            trades.slice(-50).reverse().map((trade, i) => (
              <div
                key={i}
                className={`grid grid-cols-4 gap-1 py-1 px-3 border-b border-[var(--border-subtle)]/30 ${
                  trade.side === 'buy' ? 'bg-emerald-500/5' : 'bg-rose-500/5'
                }`}
              >
                <span className="text-[var(--text-muted)]">{formatTime(trade.time)}</span>
                <span className={`text-center font-bold ${trade.side === 'buy' ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {trade.side === 'buy' ? 'BUY' : 'SELL'}
                </span>
                <span className="text-right text-[var(--text-primary)]">{trade.size}</span>
                <span className={`text-right font-bold ${trade.side === 'buy' ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {trade.price.toFixed(2)}
                </span>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-full text-[var(--text-muted)] opacity-30 italic">
              Waiting for trades...
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-[var(--border-subtle)] py-2 px-3 flex justify-between text-[var(--text-muted)] bg-[var(--bg-secondary)]">
          <span>TRADES: {trades.length}</span>
          <span className={status === 'live' ? 'text-green-500' : 'text-rose-400'}>
            {status === 'live' ? '● LIVE' : '○ OFFLINE'}
          </span>
        </div>
      </div>
    </CollapsiblePanel>
  );
}
