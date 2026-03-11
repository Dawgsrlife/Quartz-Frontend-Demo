/**
 * StrategyClient — MOCK VERSION for frontend demo.
 *
 * No-op. No WebSocket needed for demo mode.
 */

export const SIGNAL_WS = "";

export function startStrategySignalWebSocket() {
    console.log("[Strategy] DEMO MODE: Signal WebSocket disabled");
    return null;
}