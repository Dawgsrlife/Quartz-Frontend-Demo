/**
 * BacktestService — MOCK VERSION for frontend demo.
 *
 * Returns simulated strategies, results, bars, and history.
 * No backend calls.
 */

import { generateMockCandles } from "@/lib/mockData";

/* ------------------------------------------------------------------ */
/*  Types (unchanged)                                                 */
/* ------------------------------------------------------------------ */

export interface StrategyParam {
    name: string;
    type: "int" | "float" | "bool" | "string";
    default: number | string | boolean;
    min?: number;
    max?: number;
    options?: string[];
    description?: string;
}

export interface StrategyDefinition {
    id: string;
    name: string;
    description: string;
    category: "Breakout" | "Trend" | "Mean-Reversion" | "Scalping";
    params: StrategyParam[];
}

export interface BacktestRunRequest {
    strategy_id: string;
    symbol: string;
    start_date: string;
    end_date: string;
    resolution: string;
    initial_capital: number;
    parameters: Record<string, number | string | boolean>;
    commission?: number;
    slippage?: number;
}

export interface BacktestRunResponse {
    job_id: string;
    status: "queued" | "running";
}

export interface Trade {
    id: string;
    entry_time: string;
    exit_time: string;
    symbol: string;
    direction: "LONG" | "SHORT";
    quantity: number;
    entry_price: number;
    exit_price: number;
    pnl: number;
    pnl_pct: number;
    commission: number;
    slippage: number;
    duration?: string;
}

export interface EquityPoint {
    timestamp: string;
    equity: number;
    drawdown: number;
}

export interface BacktestMetrics {
    total_pnl: number;
    total_return_pct: number;
    sharpe_ratio: number;
    sortino_ratio: number;
    max_drawdown: number;
    max_drawdown_pct: number;
    win_rate: number;
    total_trades: number;
    winning_trades: number;
    losing_trades: number;
    profit_factor: number;
    avg_win: number;
    avg_loss: number;
    avg_trade_duration: string;
}

export interface BacktestResult {
    job_id: string;
    status: "queued" | "running" | "completed" | "failed";
    metrics?: BacktestMetrics;
    trades?: Trade[];
    equity_curve?: EquityPoint[];
    bars?: OHLCV[];
    error?: string;
}

export interface BacktestHistoryItem {
    job_id: string;
    strategy_id: string;
    symbol: string;
    start_date: string;
    end_date: string;
    status: "queued" | "running" | "completed" | "failed";
    created_at: string;
    metrics?: {
        total_pnl: number;
        total_return_pct: number;
    };
}

export interface OHLCV {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

/* ------------------------------------------------------------------ */
/*  Mock Data Generators                                              */
/* ------------------------------------------------------------------ */

function generateMockTrades(count: number = 15): Trade[] {
    const trades: Trade[] = [];
    const now = Date.now();
    for (let i = 0; i < count; i++) {
        const dir = Math.random() > 0.45 ? "LONG" : "SHORT" as const;
        const entry = 5800 + Math.random() * 200;
        const delta = (Math.random() - 0.4) * 40;
        const exit = dir === "LONG" ? entry + delta : entry - delta;
        const pnl = (exit - entry) * (dir === "LONG" ? 1 : -1) * 50;
        trades.push({
            id: `TRD-${String(i + 1).padStart(3, "0")}`,
            entry_time: new Date(now - (count - i) * 86400000).toISOString(),
            exit_time: new Date(now - (count - i) * 86400000 + 3600000).toISOString(),
            symbol: "ES",
            direction: dir,
            quantity: Math.ceil(Math.random() * 4),
            entry_price: +entry.toFixed(2),
            exit_price: +exit.toFixed(2),
            pnl: +pnl.toFixed(2),
            pnl_pct: +(pnl / 100000 * 100).toFixed(3),
            commission: 2.50,
            slippage: 0.25,
            duration: `${Math.floor(Math.random() * 4) + 1}h ${Math.floor(Math.random() * 59)}m`,
        });
    }
    return trades;
}

function generateMockEquityCurve(initial: number = 100000, points: number = 60): EquityPoint[] {
    const curve: EquityPoint[] = [];
    let equity = initial;
    let peak = equity;
    const now = Date.now();
    for (let i = 0; i < points; i++) {
        equity += (Math.random() - 0.42) * 800;
        peak = Math.max(peak, equity);
        const dd = (peak - equity) / peak;
        curve.push({
            timestamp: new Date(now - (points - i) * 86400000).toISOString(),
            equity: +equity.toFixed(2),
            drawdown: +dd.toFixed(4),
        });
    }
    return curve;
}

const MOCK_METRICS: BacktestMetrics = {
    total_pnl: 14_832.50,
    total_return_pct: 14.83,
    sharpe_ratio: 1.87,
    sortino_ratio: 2.41,
    max_drawdown: 4_210.25,
    max_drawdown_pct: 3.92,
    win_rate: 0.68,
    total_trades: 42,
    winning_trades: 29,
    losing_trades: 13,
    profit_factor: 2.14,
    avg_win: 682.50,
    avg_loss: -312.75,
    avg_trade_duration: "2h 15m",
};

/* ------------------------------------------------------------------ */
/*  Service (MOCK)                                                    */
/* ------------------------------------------------------------------ */

let _callCount = 0;

export const BacktestService = {
    /** Mock submit — returns fake job_id immediately */
    async run(_config: BacktestRunRequest): Promise<BacktestRunResponse> {
        _callCount++;
        return {
            job_id: `mock-job-${_callCount}-${Date.now()}`,
            status: "running",
        };
    },

    /** Mock results — returns completed data on second call (simulates polling) */
    async getResults(jobId: string): Promise<BacktestResult> {
        // Simulate brief processing delay then return completed
        await new Promise((r) => setTimeout(r, 300));
        return {
            job_id: jobId,
            status: "completed",
            metrics: MOCK_METRICS,
            trades: generateMockTrades(),
            equity_curve: generateMockEquityCurve(),
        };
    },

    /** Mock history */
    async getHistory(_limit = 20): Promise<BacktestHistoryItem[]> {
        const now = Date.now();
        return [
            { job_id: "mock-hist-1", strategy_id: "orb", symbol: "ES", start_date: "2026-01-15", end_date: "2026-02-15", status: "completed", created_at: new Date(now - 86400000 * 3).toISOString(), metrics: { total_pnl: 8420.50, total_return_pct: 8.42 } },
            { job_id: "mock-hist-2", strategy_id: "orb", symbol: "NQ", start_date: "2026-01-01", end_date: "2026-02-01", status: "completed", created_at: new Date(now - 86400000 * 7).toISOString(), metrics: { total_pnl: -1230.00, total_return_pct: -1.23 } },
            { job_id: "mock-hist-3", strategy_id: "orb", symbol: "ES", start_date: "2025-12-01", end_date: "2025-12-31", status: "completed", created_at: new Date(now - 86400000 * 14).toISOString(), metrics: { total_pnl: 5610.75, total_return_pct: 5.61 } },
        ];
    },

    /** Mock historical bars — uses existing mock candle generator */
    async fetchBars(_symbol: string, _resolution: string, _start: string, _end: string): Promise<OHLCV[]> {
        return generateMockCandles(200);
    },

    /** Returns default strategies (no backend needed) */
    async getStrategies(): Promise<StrategyDefinition[]> {
        return DEFAULT_STRATEGIES;
    },
};

/* ------------------------------------------------------------------ */
/*  Default Strategy Definitions                                      */
/* ------------------------------------------------------------------ */

export const DEFAULT_STRATEGIES: StrategyDefinition[] = [
    {
        id: "orb",
        name: "Opening Range Breakout (ORB)",
        description: "Strategic entry based on the breakout of the first 5, 15, or 30 minutes of the market session.",
        category: "Breakout",
        params: [
            { name: "timeframe", type: "string", default: "15m", options: ["5m", "15m", "30m"], description: "Opening Range Window" },
            { name: "multiplier", type: "float", default: 1.0, min: 0.1, max: 2.0, description: "Range Multiplier" },
            { name: "use_vmap", type: "bool", default: true, description: "VWAP Filter" },
        ],
    },
];
