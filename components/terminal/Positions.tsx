"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAccountStore, useUIStore } from "@/lib/store";
import { CollapsiblePanel } from "./CollapsiblePanel";
import { RefreshCw, Wallet } from "lucide-react";
import { apiFetch } from "@/lib/apiClient";

interface Position {
    symbol: string;
    quantity: number;
    entry_price: number;
    current_price: number;
    unrealized_pl: number;
}

interface AccountSummary {
    account_id: string;
    net_liquidation: number;
    available_funds: number;
    buying_power: number;
    daily_pl: number;
    open_positions: Position[];
}

export function Positions() {
    const { positions = [], dailyPl = 0, setAccountData } = useAccountStore();
    const { positionsCollapsed, setPositionsCollapsed } = useUIStore();
    const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
    const [accountId, setAccountId] = useState<string>('');

    const fetchAccountData = useCallback(async () => {
        setStatus('loading');
        try {
            const data = await apiFetch<AccountSummary>("/api/account/summary", {
                signal: AbortSignal.timeout(10000)
            });
            
            setAccountId(data.account_id);
            setAccountData({
                positions: data.open_positions.map(p => ({
                    symbol: p.symbol,
                    quantity: p.quantity,
                    entry_price: p.entry_price,
                    current_price: p.current_price,
                    unrealized_pl: p.unrealized_pl
                })),
                dailyPl: data.daily_pl,
                netLiquidity: data.net_liquidation,
                availableFunds: data.available_funds,
                buyingPower: data.buying_power
            });
            setStatus('loaded');
        } catch (error) {
            console.error('Error fetching account:', error);
            setStatus('error');
        }
    }, [setAccountData]);

    useEffect(() => {
        fetchAccountData();
        // Refresh every 30 seconds
        const interval = setInterval(fetchAccountData, 30000);
        return () => clearInterval(interval);
    }, [fetchAccountData]);

    const totalPnl = (positions || []).reduce((acc, pos) => acc + pos.unrealized_pl, 0);

    return (
        <CollapsiblePanel 
            title="POSITIONS" 
            subtitle={accountId ? accountId.slice(-6) : 'ACCOUNT'}
            className="h-full border-none"
            maxHeight="100%"
            isExpanded={!positionsCollapsed}
            onToggle={(expanded) => setPositionsCollapsed(!expanded)}
        >
            <div className="relative flex flex-col h-full w-full text-xs font-mono select-none">
                {/* Error Overlay */}
                {status === 'error' && (
                    <div className="absolute inset-0 z-50 backdrop-blur-sm bg-[var(--bg-primary)]/70 flex flex-col items-center justify-center gap-3">
                        <Wallet className="w-6 h-6 text-[var(--text-muted)]" />
                        <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">
                            Failed to Load
                        </span>
                        <button
                            onClick={fetchAccountData}
                            className="flex items-center gap-2 px-3 py-1.5 bg-[var(--accent)] text-black text-[10px] font-semibold uppercase tracking-wider rounded hover:opacity-90 transition-opacity cursor-pointer"
                        >
                            <RefreshCw className="w-3 h-3" />
                            Retry
                        </button>
                    </div>
                )}
                
                {status === 'loading' && (
                    <div className="absolute inset-0 z-50 backdrop-blur-sm bg-[var(--bg-primary)]/70 flex flex-col items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
                        <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest">
                            Loading Account...
                        </span>
                    </div>
                )}

                <div className="grid grid-cols-4 border-b border-[var(--border-subtle)] pb-2 mb-1 px-4 text-[var(--text-muted)] mt-2 shrink-0">
                    <div>SYM</div>
                    <div className="text-center">POS</div>
                    <div className="text-center">AVG</div>
                    <div className="text-right">P&L</div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto no-scrollbar">
                    {positions.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-[var(--text-muted)] opacity-30 italic">
                            No active positions
                        </div>
                    ) : (
                        positions.map((pos, i) => {
                            const pnlColor = pos.unrealized_pl >= 0 ? "text-emerald-500" : "text-rose-500";
                            const sideColor = pos.quantity > 0 ? "text-emerald-500" : "text-rose-500";
                            
                            return (
                                <div key={pos.symbol + i} className="grid grid-cols-4 px-4 py-2 hover:bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)] transition-colors">
                                    <span className="font-bold text-[var(--text-primary)]">{pos.symbol}</span>
                                    <div className="text-center">
                                        <span className={sideColor}>{pos.quantity > 0 ? '+' : ''}{pos.quantity}</span>
                                    </div>
                                    <span className="text-center text-[var(--text-muted)]">{pos.entry_price.toFixed(2)}</span>
                                    <span className={`text-right font-bold ${pnlColor}`}>
                                        {pos.unrealized_pl >= 0 ? '+' : ''}{pos.unrealized_pl.toFixed(2)}
                                    </span>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Total */}
                <div className="bg-[var(--bg-secondary)] border-t border-[var(--border-subtle)] px-4 py-3 flex justify-between font-bold shrink-0">
                    <div className="flex gap-4">
                        <span className="text-[var(--text-muted)]">NET P&L</span>
                        <span className={totalPnl >= 0 ? "text-emerald-500" : "text-rose-500"}>
                            {totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(2)}
                        </span>
                    </div>
                    <div className="flex gap-4">
                        <span className="text-[var(--text-muted)]">DAILY</span>
                        <span className={dailyPl >= 0 ? "text-emerald-500" : "text-rose-500"}>
                            {dailyPl >= 0 ? '+' : ''}{dailyPl.toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>
        </CollapsiblePanel>
    );
}
