"use client";

import React, { useState } from 'react';
import { Play, Square, Settings2, ShieldAlert } from 'lucide-react';
import { CollapsiblePanel } from "./CollapsiblePanel";
import { useUIStore } from "@/lib/store";

export default function StrategyPanel() {
    const [isActive, setIsActive] = useState(false);
    const [strategy, setStrategy] = useState('Gap Logic');
    const [risk, setRisk] = useState('100');
    const { strategyPanelCollapsed, setStrategyPanelCollapsed } = useUIStore();

    return (
        <CollapsiblePanel 
            title="Strategy Engine" 
            icon={<Settings2 size={12} />}
            className="h-full border-none bg-[var(--bg-primary)]"
            maxHeight="100%"
            isExpanded={!strategyPanelCollapsed}
            onToggle={(expanded) => setStrategyPanelCollapsed(!expanded)}
        >
            <div className="flex flex-col h-full select-none">
                {/* Content */}
                <div className="px-5 py-4 flex flex-col gap-4 flex-1 overflow-y-auto no-scrollbar">
                    {/* Status Indicator inside content for visibility when expanded */}
                    <div className="flex items-center justify-between mb-1">
                         <span className="text-[9px] uppercase text-[var(--text-muted)] font-mono font-bold tracking-tight">System Status</span>
                         {isActive ? (
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[9px] text-emerald-500 font-mono font-bold tracking-tighter">LIVE EXECUTION</span>
                            </div>
                        ) : (
                            <span className="text-[9px] text-[var(--text-muted)] font-mono font-bold tracking-tighter uppercase opacity-50">Standby</span>
                        )}
                    </div>

                    {/* Selector */}
                    <div className="space-y-1.5">
                        <label className="text-[9px] uppercase text-[var(--text-muted)] font-mono font-bold tracking-tight">Active Strategy</label>
                        <select 
                            value={strategy}
                            onChange={(e) => setStrategy(e.target.value)}
                            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] px-2 py-1.5 rounded-sm focus:outline-none focus:border-[var(--accent)] cursor-pointer hover:bg-[var(--bg-primary)] transition-colors"
                        >
                            <option>Gap Logic</option>
                            <option>Trend Execution</option>
                            <option>Liquidity Flow</option>
                            <option>Market Arbitrage</option>
                        </select>
                    </div>

                    {/* Risk Input */}
                    <div className="space-y-1.5">
                        <label className="text-[9px] uppercase text-[var(--text-muted)] font-mono font-bold tracking-tight">Risk Per Trade ($)</label>
                        <div className="relative">
                            <span className="absolute left-2.5 top-1.5 text-[var(--text-muted)] text-xs">$</span>
                            <input 
                                type="number"
                                value={risk}
                                onChange={(e) => setRisk(e.target.value)}
                                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] pl-6 pr-2 py-1.5 rounded-sm focus:outline-none focus:border-[var(--accent)] font-mono"
                            />
                        </div>
                    </div>

                    {/* Safety Check */}
                    <div className="mt-auto p-3 bg-[var(--bg-secondary)]/80 border border-[var(--border-subtle)] rounded-sm flex items-start gap-3 shadow-sm">
                        <ShieldAlert size={14} className="text-[var(--accent)] shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="text-[10px] text-[var(--text-primary)] leading-tight font-bold">Safety Engine Active: <span className="text-[var(--accent)] font-mono">$500</span></p>
                            <p className="text-[9px] text-[var(--text-muted)] leading-tight">Stop-loss active for daily protection.</p>
                        </div>
                    </div>
                </div>

                {/* Action Bar */}
                <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] shrink-0">
                    <button 
                        onClick={() => setIsActive(!isActive)}
                        className={`w-full py-2.5 rounded-sm flex items-center justify-center gap-2 transition-all font-mono text-xs uppercase tracking-widest font-bold no-drag
                            ${isActive 
                                ? 'bg-rose-500/10 border border-rose-500/50 text-rose-500 hover:bg-rose-500/20 shadow-inner' 
                                : 'bg-[var(--accent)] text-white hover:opacity-90 shadow-[0_0_15px_var(--accent-glow)]'
                            }`}
                    >
                        {isActive ? (
                            <>
                                <Square size={14} fill="currentColor" />
                                <span>Stop Strategy</span>
                            </>
                        ) : (
                            <>
                                <Play size={14} fill="currentColor" />
                                <span>Run Strategy</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </CollapsiblePanel>
    );
}
