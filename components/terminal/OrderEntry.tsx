"use client";

import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { CollapsiblePanel } from "./CollapsiblePanel";
import { apiFetch } from "@/lib/apiClient";

export function OrderEntry() {
    const [symbol, setSymbol] = useState("AAPL");
    const [quantity, setQuantity] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderStatus, setOrderStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const handleOrder = async (side: 'buy' | 'sell') => {
        if (!symbol.trim()) {
            setOrderStatus({ type: 'error', message: 'Enter a symbol' });
            return;
        }

        setIsSubmitting(true);
        setOrderStatus(null);

        try {
            const data = await apiFetch<any>(`/api/orders/${side}`, {
                method: 'POST',
                body: JSON.stringify({
                    symbol: symbol.toUpperCase().trim(),
                    quantity: quantity,
                    order_type: 'MARKET'
                }),
                signal: AbortSignal.timeout(10000)
            });

            setOrderStatus({
                type: 'success',
                message: `${side.toUpperCase()} ${quantity} ${symbol.toUpperCase()} - ${data.message || 'Submitted'}`
            });
        } catch (error) {
            console.error("Order failed", error);
            setOrderStatus({
                type: 'error',
                message: 'Connection failed - IBKR Gateway may be offline'
            });
        } finally {
            setIsSubmitting(false);
            // Clear status after 5 seconds
            setTimeout(() => setOrderStatus(null), 5000);
        }
    };

    const adjustQuantity = (delta: number) => {
        setQuantity(prev => Math.max(1, prev + delta));
    };

    return (
        <CollapsiblePanel 
            title="ORDER ENTRY" 
            className="border-none"
            maxHeight="auto"
        >
            <div className="p-4 flex flex-col gap-4 bg-[var(--bg-secondary)] min-w-[300px] select-none">
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">
                        Symbol
                    </label>
                    <input
                        type="text"
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                        placeholder="AAPL"
                        className="h-10 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded px-3 font-mono text-[var(--up)] font-bold uppercase focus:outline-none focus:border-[var(--accent)]"
                    />
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                    <button
                        onClick={() => handleOrder('sell')}
                        disabled={isSubmitting || !symbol.trim()}
                        className="h-14 bg-quartz-down hover:opacity-90 disabled:opacity-50 text-white font-bold rounded shadow-lg transition-all active:scale-95 flex flex-col items-center justify-center border border-white/10 group cursor-pointer"
                    >
                        <span className="text-xs font-semibold">SELL</span>
                        <span className="text-[10px] opacity-70 uppercase tracking-tighter group-hover:opacity-100">MARKET</span>
                    </button>
                    <button
                        onClick={() => handleOrder('buy')}
                        disabled={isSubmitting || !symbol.trim()}
                        className="h-14 bg-quartz-accent hover:opacity-90 disabled:opacity-50 text-[var(--bg-primary)] font-bold rounded shadow-[0_0_20px_var(--accent-glow)] transition-all active:scale-95 flex flex-col items-center justify-center group cursor-pointer"
                    >
                        <span className="text-xs font-semibold">BUY</span>
                        <span className="text-[10px] opacity-70 uppercase tracking-tighter text-[var(--bg-primary)]/70 group-hover:opacity-100">MARKET</span>
                    </button>
                </div>

                <div className="flex flex-col gap-2 mt-2">
                    <div className="flex justify-between text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">
                        <span>Quantity</span>
                        <span>{quantity} share{quantity !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex gap-1">
                        <button 
                            onClick={() => adjustQuantity(-1)}
                            className="w-10 h-10 flex items-center justify-center bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded hover:border-[var(--accent)] transition-colors cursor-pointer"
                        >
                            <Minus size={14} />
                        </button>
                        <input 
                            type="number" 
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                            className="flex-1 h-10 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded px-3 font-mono text-center focus:outline-none focus:border-[var(--accent)]"
                        />
                        <button 
                            onClick={() => adjustQuantity(1)}
                            className="w-10 h-10 flex items-center justify-center bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded hover:border-[var(--accent)] transition-colors cursor-pointer"
                        >
                            <Plus size={14} />
                        </button>
                    </div>
                </div>

                {isSubmitting && (
                    <div className="text-[10px] font-mono text-[var(--accent)] animate-pulse text-center tracking-widest mt-2">
                        TRANSMITTING TO IBKR...
                    </div>
                )}
                
                {orderStatus && (
                    <div className={`text-[10px] font-mono text-center tracking-wider mt-2 px-2 py-1.5 rounded ${
                        orderStatus.type === 'success' 
                            ? 'text-emerald-500 bg-emerald-500/10' 
                            : 'text-rose-500 bg-rose-500/10'
                    }`}>
                        {orderStatus.message}
                    </div>
                )}
            </div>
        </CollapsiblePanel>
    );
}
