"use client";

import React, { useEffect } from "react";
import { useBacktestStore } from "@/lib/backtestStore";
import { QuartzSelect } from "@/components/ui/QuartzSelect";
import { QuartzInput } from "@/components/ui/QuartzInput";
import { cn } from "@/lib/utils";
import { Play, Loader2 } from "lucide-react";
import type { StrategyParam } from "@/services/BacktestService";

/**
 * BacktestConfig — the configuration panel for setting up a backtest run.
 *
 * Includes:
 *   - Strategy selector (dropdown)
 *   - Dynamic parameter inputs (driven by strategy.parameters schema)
 *   - Market symbol, date range, resolution
 *   - Capital, commission, slippage
 *   - Run button with status feedback
 *
 * The dynamic parameter form is driven by the StrategyDefinition.parameters
 * array from BacktestService — this means when Jake/Richard add new strategies
 * or parameters on the backend, the UI adapts automatically.
 */
export function BacktestConfig() {
    const strategies = useBacktestStore((s) => s.strategies);
    const selectedStrategy = useBacktestStore((s) => s.selectedStrategy);
    const parameters = useBacktestStore((s) => s.parameters);
    const symbol = useBacktestStore((s) => s.symbol);
    const startDate = useBacktestStore((s) => s.startDate);
    const endDate = useBacktestStore((s) => s.endDate);
    const resolution = useBacktestStore((s) => s.resolution);
    const initialCapital = useBacktestStore((s) => s.initialCapital);
    const commission = useBacktestStore((s) => s.commission);
    const slippage = useBacktestStore((s) => s.slippage);
    const status = useBacktestStore((s) => s.status);
    const progress = useBacktestStore((s) => s.progress);
    const error = useBacktestStore((s) => s.error);

    const setSelectedStrategy = useBacktestStore((s) => s.setSelectedStrategy);
    const setParameter = useBacktestStore((s) => s.setParameter);
    const setSymbol = useBacktestStore((s) => s.setSymbol);
    const setStartDate = useBacktestStore((s) => s.setStartDate);
    const setEndDate = useBacktestStore((s) => s.setEndDate);
    const setResolution = useBacktestStore((s) => s.setResolution);
    const setInitialCapital = useBacktestStore((s) => s.setInitialCapital);
    const setCommission = useBacktestStore((s) => s.setCommission);
    const setSlippage = useBacktestStore((s) => s.setSlippage);
    const runBacktest = useBacktestStore((s) => s.runBacktest);
    const loadStrategies = useBacktestStore((s) => s.loadStrategies);
    const reset = useBacktestStore((s) => s.reset);

    const activeStrategy = strategies.find((s) => s.id === selectedStrategy);
    const isRunning = status === "running";

    /** Derive a label from a param name like "fast_period" → "Fast Period" */
    const toLabel = (name: string) =>
        name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

    /* ---- Load strategy catalogue on mount ---- */
    useEffect(() => {
        loadStrategies();
    }, [loadStrategies]);

    /* ---- Initialize default parameters when strategy changes ---- */
    useEffect(() => {
        if (activeStrategy && Object.keys(parameters).length === 0) {
            activeStrategy.params.forEach((p) => {
                setParameter(p.name, p.default);
            });
        }
    }, [activeStrategy, parameters, setParameter]);

    /* ---- Render a single parameter input ---- */
    const renderParam = (param: StrategyParam) => {
        const value = parameters[param.name] ?? param.default;
        const label = param.description || toLabel(param.name);

        if (param.type === "string" && param.options) {
            return (
                <QuartzSelect
                    key={param.name}
                    label={label}
                    value={String(value)}
                    onChange={(v) => setParameter(param.name, v)}
                    options={param.options.map((o) => ({ value: o, label: toLabel(o) }))}
                />
            );
        }

        if (param.type === "bool") {
            return (
                <div key={param.name} className="space-y-4 w-full">
                    <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-quartz-muted font-bold block">
                        {label}
                    </label>
                    <button
                        type="button"
                        onClick={() => setParameter(param.name, !value)}
                        className={cn(
                            "w-full h-12 border rounded-sm px-4 font-mono text-xs transition-all",
                            value
                                ? "bg-quartz-accent/10 border-quartz-accent/30 text-quartz-accent"
                                : "bg-quartz-bg border-quartz-border text-quartz-muted hover:bg-white/[0.02]"
                        )}
                    >
                        {value ? "Enabled" : "Disabled"}
                    </button>
                </div>
            );
        }

        // int or float
        const step = param.type === "int" ? 1 : 0.1;
        return (
            <QuartzInput
                key={param.name}
                label={label}
                type="number"
                value={String(value)}
                onChange={(e) => {
                    const v = param.type === "int" ? parseInt(e.target.value, 10) : Number(e.target.value);
                    setParameter(param.name, isNaN(v) ? 0 : v);
                }}
                min={param.min}
                max={param.max}
                step={step}
            />
        );
    };

    return (
        <div className="border border-quartz-border rounded-lg overflow-hidden bg-quartz-bg">
            {/* Section: Strategy Selection */}
            <div className="px-6 py-5 border-b border-quartz-border">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-quartz-muted">
                        Strategy Configuration
                    </h3>
                    <span className="font-mono text-[8px] text-quartz-muted/50 uppercase tracking-widest">
                        Step 01
                    </span>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <QuartzSelect
                        label="Strategy"
                        value={selectedStrategy}
                        onChange={(id) => setSelectedStrategy(id)}
                        options={strategies.map((s) => ({ value: s.id, label: s.name }))}
                    />
                    <QuartzSelect
                        label="Market"
                        value={symbol}
                        onChange={setSymbol}
                        options={[
                            { value: "ES", label: "ES (S&P 500 E-mini)" },
                            { value: "NQ", label: "NQ (Nasdaq 100 E-mini)" },
                            { value: "GC", label: "GC (Gold Futures)" },
                            { value: "CL", label: "CL (Crude Oil)" },
                            { value: "RTY", label: "RTY (Russell 2000)" },
                        ]}
                    />
                </div>

                {/* Strategy description */}
                {activeStrategy && (
                    <p className="mt-4 font-mono text-[9px] text-quartz-muted/60 leading-relaxed">
                        {activeStrategy.description}
                    </p>
                )}
            </div>

            {/* Section: Strategy Parameters (dynamic) */}
            {activeStrategy && activeStrategy.params.length > 0 && (
                <div className="px-6 py-5 border-b border-quartz-border">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-quartz-muted">
                            Parameters
                        </h3>
                        <button
                            type="button"
                            onClick={() => {
                                activeStrategy.params.forEach((p) => setParameter(p.name, p.default));
                            }}
                            className="font-mono text-[8px] text-quartz-accent/60 hover:text-quartz-accent uppercase tracking-widest transition-colors"
                        >
                            Reset Defaults
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {activeStrategy.params.map(renderParam)}
                    </div>
                </div>
            )}

            {/* Section: Date Range & Resolution */}
            <div className="px-6 py-5 border-b border-quartz-border">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-quartz-muted">
                        Data Range
                    </h3>
                    <span className="font-mono text-[8px] text-quartz-muted/50 uppercase tracking-widest">
                        Step 02
                    </span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <QuartzInput
                        label="Start Date"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                    <QuartzInput
                        label="End Date"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                    <QuartzSelect
                        label="Resolution"
                        value={resolution}
                        onChange={setResolution}
                        options={[
                            { value: "1m", label: "1 Minute" },
                            { value: "5m", label: "5 Minutes" },
                            { value: "15m", label: "15 Minutes" },
                            { value: "1H", label: "1 Hour" },
                            { value: "1D", label: "1 Day" },
                        ]}
                    />
                </div>
            </div>

            {/* Section: Capital & Costs */}
            <div className="px-6 py-5 border-b border-quartz-border">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-quartz-muted">
                        Execution Parameters
                    </h3>
                    <span className="font-mono text-[8px] text-quartz-muted/50 uppercase tracking-widest">
                        Step 03
                    </span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <QuartzInput
                        label="Initial Capital ($)"
                        type="number"
                        value={String(initialCapital)}
                        onChange={(e) => setInitialCapital(Number(e.target.value))}
                        min={1000}
                        step={1000}
                    />
                    <QuartzInput
                        label="Commission ($/trade)"
                        type="number"
                        value={String(commission)}
                        onChange={(e) => setCommission(Number(e.target.value))}
                        min={0}
                        step={0.5}
                    />
                    <QuartzInput
                        label="Slippage (ticks)"
                        type="number"
                        value={String(slippage)}
                        onChange={(e) => setSlippage(Number(e.target.value))}
                        min={0}
                        step={0.25}
                    />
                </div>
            </div>

            {/* Run Button */}
            <div className="px-6 py-5">
                {error && (
                    <div className="mb-4 px-4 py-3 rounded-sm bg-rose-500/10 border border-rose-500/20">
                        <p className="font-mono text-[10px] text-rose-500">{error}</p>
                    </div>
                )}

                <button
                    type="button"
                    onClick={isRunning ? undefined : runBacktest}
                    disabled={isRunning}
                    className={cn(
                        "w-full h-14 font-mono font-bold text-[10px] uppercase tracking-[0.3em] rounded-sm relative overflow-hidden transition-all duration-500",
                        isRunning
                            ? "bg-quartz-border text-quartz-muted cursor-wait"
                            : "bg-quartz-text text-quartz-bg hover:bg-quartz-accent hover:text-white active:scale-[0.99]"
                    )}
                >
                    {/* Progress bar fill */}
                    {isRunning && (
                        <div
                            className="absolute left-0 top-0 bottom-0 bg-quartz-accent/20 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    )}

                    <span className="relative z-10 flex items-center justify-center gap-3">
                        {isRunning ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Running Backtest — {progress}%
                            </>
                        ) : status === "completed" ? (
                            <>
                                <Play className="w-3.5 h-3.5" />
                                Run New Backtest
                            </>
                        ) : (
                            <>
                                <Play className="w-3.5 h-3.5" />
                                Initiate Backtest Sequence
                            </>
                        )}
                    </span>
                </button>

                {status === "completed" && (
                    <button
                        type="button"
                        onClick={reset}
                        className="w-full mt-2 py-3 font-mono text-[9px] text-quartz-muted/60 hover:text-quartz-muted uppercase tracking-widest transition-colors"
                    >
                        Reset Configuration
                    </button>
                )}
            </div>
        </div>
    );
}
