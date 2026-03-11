"use client";

import React from "react";
import { useMarketStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const TIMEFRAMES = [
  { label: "1m", value: "1m" },
  { label: "5m", value: "5m" },
  { label: "15m", value: "15m" },
  { label: "1H", value: "1H" },
  { label: "4H", value: "4H" },
  { label: "1D", value: "1D" },
];

// For display, map to consistent format
const getResolution = (tf: string): string => {
  const map: Record<string, string> = {
    '1m': '1m', '5m': '5m', '15m': '15m',
    '1H': '1h', '4H': '4h', '1D': '1d'
  };
  return map[tf] || tf.toLowerCase();
};

export function TimeframeSelector() {
  const { timeframe, setTimeframe } = useMarketStore();

  return (
    <div className="flex items-center gap-1 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-md p-1 no-drag">
      {TIMEFRAMES.map((tf) => (
        <button
          key={tf.value}
          onClick={() => setTimeframe(tf.value)}
          className={cn(
            "px-2.5 py-1 text-[10px] font-mono rounded transition-all",
            timeframe === tf.value
              ? "bg-[var(--accent)] text-white shadow-sm"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)]"
          )}
        >
          {tf.label}
        </button>
      ))}
    </div>
  );
}
