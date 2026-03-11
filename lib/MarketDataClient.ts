/**
 * MarketDataClient — MOCK VERSION for frontend demo.
 *
 * Simulates market data ticks with setInterval instead of WebSocket.
 */

import { useMarketStore } from "@/lib/store";

/** Exported for backward-compat — empty so WS guards (if (!MARKET_DATA_WS)) skip. */
export const MARKET_DATA_WS = "";

let intervalId: ReturnType<typeof setInterval> | null = null;
let basePrice = 5905.50;

/**
 * Start a simulated market data stream.
 * Emits random price ticks every 800ms.
 */
export function startMarketDataWebSocket() {
    // Prevent duplicate intervals
    if (intervalId) return null;

    console.log("[MarketData] DEMO MODE: Starting simulated data stream");

    intervalId = setInterval(() => {
        basePrice += (Math.random() - 0.5) * 1.2;

        useMarketStore.getState().updateTick({
            symbol: "ES",
            price: +basePrice.toFixed(2),
            timestamp: Date.now() / 1000,
        });
    }, 800);

    return null;
}

/** Stop the simulated data stream. */
export function stopMarketDataWebSocket() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
}