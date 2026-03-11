/**
 * Backtest Zustand Store — centralized state for the backtest workflow.
 *
 * Holds configuration, active run status, results, and history.
 * Components subscribe to slices of this store.
 */

import { create } from "zustand";
import type {
    BacktestRunRequest,
    BacktestResult,
    BacktestMetrics,
    BacktestHistoryItem,
    Trade,
    EquityPoint,
    StrategyDefinition,
    OHLCV,
} from "@/services/BacktestService";
import { BacktestService, DEFAULT_STRATEGIES } from "@/services/BacktestService";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

type BacktestStatus = "idle" | "configuring" | "running" | "completed" | "failed";

type SortField = "entry_time" | "exit_time" | "direction" | "pnl" | "pnl_pct" | "quantity";
type SortDir = "asc" | "desc";

/** Helper: derive a display label from a param name like "fast_period" → "Fast Period" */
function paramLabel(name: string): string {
    return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

interface BacktestState {
    /* Strategy catalogue */
    strategies: StrategyDefinition[];
    loadStrategies: () => Promise<void>;

    /* Configuration */
    selectedStrategy: string;
    parameters: Record<string, number | string | boolean>;
    symbol: string;
    startDate: string;
    endDate: string;
    resolution: string;
    initialCapital: number;
    commission: number;
    slippage: number;

    setSelectedStrategy: (id: string) => void;
    setParameter: (key: string, value: number | string | boolean) => void;
    setSymbol: (symbol: string) => void;
    setStartDate: (date: string) => void;
    setEndDate: (date: string) => void;
    setResolution: (res: string) => void;
    setInitialCapital: (cap: number) => void;
    setCommission: (c: number) => void;
    setSlippage: (s: number) => void;

    /* Run state */
    status: BacktestStatus;
    jobId: string | null;
    progress: number;
    error: string | null;

    /* Results */
    metrics: BacktestMetrics | null;
    trades: Trade[];
    equityCurve: EquityPoint[];
    bars: OHLCV[];

    /* Trade log sorting */
    sortField: SortField;
    sortDir: SortDir;
    setSortField: (field: SortField) => void;

    /* History */
    history: BacktestHistoryItem[];
    loadHistory: () => Promise<void>;

    /* Actions */
    runBacktest: () => Promise<void>;
    loadResults: (jobId: string) => Promise<void>;
    reset: () => void;
}

/* ------------------------------------------------------------------ */
/*  Defaults                                                          */
/* ------------------------------------------------------------------ */

const ONE_MONTH_AGO = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
const TODAY = new Date().toISOString().slice(0, 10);

/* ------------------------------------------------------------------ */
/*  Store                                                             */
/* ------------------------------------------------------------------ */

export const useBacktestStore = create<BacktestState>((set, get) => ({
    /* ---- Strategy catalogue ---- */
    strategies: DEFAULT_STRATEGIES,

    loadStrategies: async () => {
        try {
            const strategies = await BacktestService.getStrategies();
            set({ strategies });
        } catch {
            /* keep defaults */
        }
    },

    /* ---- Configuration ---- */
    selectedStrategy: "orb",
    parameters: {},
    symbol: "ES",
    startDate: ONE_MONTH_AGO,
    endDate: TODAY,
    resolution: "5m",
    initialCapital: 100_000,
    commission: 2.5,
    slippage: 0.25,

    setSelectedStrategy: (id) => {
        const strat = get().strategies.find((s) => s.id === id);
        const defaults: Record<string, number | string | boolean> = {};
        if (strat) {
            strat.params.forEach((p) => {
                defaults[p.name] = p.default;
            });
        }
        set({ selectedStrategy: id, parameters: defaults });
    },
    setParameter: (key, value) =>
        set((s) => ({ parameters: { ...s.parameters, [key]: value } })),
    setSymbol: (symbol) => set({ symbol }),
    setStartDate: (startDate) => set({ startDate }),
    setEndDate: (endDate) => set({ endDate }),
    setResolution: (resolution) => set({ resolution }),
    setInitialCapital: (initialCapital) => set({ initialCapital }),
    setCommission: (commission) => set({ commission }),
    setSlippage: (slippage) => set({ slippage }),

    /* ---- Run state ---- */
    status: "idle",
    jobId: null,
    progress: 0,
    error: null,

    /* ---- Results ---- */
    metrics: null,
    trades: [],
    equityCurve: [],
    bars: [],

    /* ---- Trade log sorting ---- */
    sortField: "entry_time",
    sortDir: "desc",
    setSortField: (field) =>
        set((s) => ({
            sortField: field,
            sortDir: s.sortField === field && s.sortDir === "desc" ? "asc" : "desc",
        })),

    /* ---- History ---- */
    history: [],
    loadHistory: async () => {
        try {
            const history = await BacktestService.getHistory();
            set({ history });
        } catch {
            /* silently fail */
        }
    },

    /* ---- Run Backtest ---- */
    runBacktest: async () => {
        const state = get();
        set({ status: "running", progress: 0, error: null, metrics: null, trades: [], equityCurve: [] });

        try {
            // 1. Fetch historical bars for the chart
            const bars = await BacktestService.fetchBars(
                state.symbol,
                state.resolution,
                state.startDate,
                state.endDate
            );
            set({ bars });

            // 2. Submit the backtest run
            const config: BacktestRunRequest = {
                strategy_id: state.selectedStrategy,
                parameters: state.parameters,
                symbol: state.symbol,
                start_date: state.startDate,
                end_date: state.endDate,
                resolution: state.resolution,
                initial_capital: state.initialCapital,
                commission: state.commission,
                slippage: state.slippage,
            };

            const { job_id } = await BacktestService.run(config);
            set({ jobId: job_id });

            // 3. Poll for results
            let attempts = 0;
            const MAX_ATTEMPTS = 120; // 2 minutes at 1s intervals
            const poll = async (): Promise<void> => {
                if (attempts >= MAX_ATTEMPTS) {
                    set({ status: "failed", error: "Backtest timed out" });
                    return;
                }
                attempts++;

                const result = await BacktestService.getResults(job_id);

                if (result.status === "running") {
                    set({ progress: Math.min(attempts * 2, 95) });
                    await new Promise((r) => setTimeout(r, 1000));
                    return poll();
                }

                if (result.status === "completed") {
                    set({
                        status: "completed",
                        progress: 100,
                        metrics: result.metrics || null,
                        trades: result.trades || [],
                        equityCurve: result.equity_curve || [],
                    });
                    // Refresh history
                    get().loadHistory();
                    return;
                }

                if (result.status === "failed") {
                    set({ status: "failed", error: result.error || "Backtest failed" });
                    return;
                }

                // Pending — keep polling
                await new Promise((r) => setTimeout(r, 1000));
                return poll();
            };

            await poll();
        } catch (err) {
            set({
                status: "failed",
                error: err instanceof Error ? err.message : "Unknown error",
            });
        }
    },

    /* ---- Load a previous result ---- */
    loadResults: async (jobId) => {
        set({ status: "running", progress: 0, error: null, jobId });
        try {
            const result = await BacktestService.getResults(jobId);

            // Try to load bars using current store state (symbol/resolution/dates)
            const state = get();
            if (state.symbol && state.resolution && state.startDate && state.endDate) {
                try {
                    const bars = await BacktestService.fetchBars(
                        state.symbol,
                        state.resolution,
                        state.startDate,
                        state.endDate
                    );
                    set({ bars });
                } catch {
                    /* bars fetch is best-effort */
                }
            }

            set({
                status: result.status === "completed" ? "completed" : result.status === "failed" ? "failed" : "running",
                progress: 100,
                metrics: result.metrics || null,
                trades: result.trades || [],
                equityCurve: result.equity_curve || [],
                error: result.error || null,
            });
        } catch (err) {
            set({
                status: "failed",
                error: err instanceof Error ? err.message : "Failed to load results",
            });
        }
    },

    /* ---- Reset ---- */
    reset: () =>
        set({
            status: "idle",
            jobId: null,
            progress: 0,
            error: null,
            metrics: null,
            trades: [],
            equityCurve: [],
            bars: [],
        }),
}));
