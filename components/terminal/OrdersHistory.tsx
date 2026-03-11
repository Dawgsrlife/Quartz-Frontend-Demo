"use client";

import React, { useEffect, useState, useCallback } from "react";
import { CollapsiblePanel } from "./CollapsiblePanel";
import { RefreshCw, Receipt, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { apiFetch } from "@/lib/apiClient";

interface Order {
    time: string;
    order_id: string;
    strategy_id: number | null;
    symbol: string;
    side: string;
    quantity: number;
    limit_price: number | null;
    status: string;
}

interface Trade {
    time: string;
    trade_id: string;
    order_id: string;
    symbol: string;
    side: string;
    quantity: number;
    price: number;
    commission: number;
    realized_pnl: number;
    source?: string;
}

type TabType = 'orders' | 'trades';

export function OrdersHistory() {
    const [activeTab, setActiveTab] = useState<TabType>('orders');
    const [orders, setOrders] = useState<Order[]>([]);
    const [trades, setTrades] = useState<Trade[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchOrders = useCallback(async () => {
        try {
            const data = await apiFetch<any>("/api/orders?limit=50", {
                signal: AbortSignal.timeout(10000)
            });
            setOrders(data.orders || []);
        } catch (err) {
            console.error('Error fetching orders:', err);
        }
    }, []);

    const fetchTrades = useCallback(async () => {
        try {
            const data = await apiFetch<any>("/api/trades?limit=50&source=all", {
                signal: AbortSignal.timeout(10000)
            });
            setTrades(data.trades || []);
        } catch (err) {
            console.error('Error fetching trades:', err);
        }
    }, []);

    const refresh = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            await Promise.all([fetchOrders(), fetchTrades()]);
        } catch (err) {
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    }, [fetchOrders, fetchTrades]);

    useEffect(() => {
        refresh();
        const interval = setInterval(refresh, 15000);
        return () => clearInterval(interval);
    }, [refresh]);

    const formatTime = (isoString: string) => {
        try {
            const date = new Date(isoString);
            return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        } catch {
            return '--:--:--';
        }
    };

    const formatDate = (isoString: string) => {
        try {
            const date = new Date(isoString);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } catch {
            return '---';
        }
    };

    const getStatusIcon = (status: string) => {
        const s = status.toUpperCase();
        if (s.includes('FILL') || s === 'SUBMITTED' || s === 'ACTIVE') {
            return <CheckCircle className="w-3 h-3 text-emerald-500" />;
        }
        if (s.includes('CANCEL') || s === 'FAILED' || s === 'REJECTED') {
            return <XCircle className="w-3 h-3 text-rose-500" />;
        }
        if (s.includes('PEND') || s === 'PRESUBMITTED') {
            return <Clock className="w-3 h-3 text-yellow-500" />;
        }
        return <AlertCircle className="w-3 h-3 text-[var(--text-muted)]" />;
    };

    return (
        <CollapsiblePanel
            title="HISTORY"
            subtitle={activeTab === 'orders' ? `${orders.length} ORDERS` : `${trades.length} FILLS`}
            className="h-full border-none"
            maxHeight="100%"
        >
            <div className="flex flex-col h-full w-full text-[10px] font-mono select-none">
                {/* Tabs */}
                <div className="flex items-center gap-1 px-3 py-2 border-b border-[var(--border-subtle)] shrink-0">
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`px-2 py-1 rounded text-[10px] uppercase font-semibold tracking-wider transition-colors cursor-pointer ${
                            activeTab === 'orders'
                                ? 'bg-[var(--accent)] text-black'
                                : 'bg-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                        }`}
                    >
                        Orders
                    </button>
                    <button
                        onClick={() => setActiveTab('trades')}
                        className={`px-2 py-1 rounded text-[10px] uppercase font-semibold tracking-wider transition-colors cursor-pointer ${
                            activeTab === 'trades'
                                ? 'bg-[var(--accent)] text-black'
                                : 'bg-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                        }`}
                    >
                        Fills
                    </button>
                    <div className="flex-1" />
                    <button
                        onClick={refresh}
                        disabled={loading}
                        className="p-1 rounded hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer"
                    >
                        <RefreshCw className={`w-3 h-3 text-[var(--text-muted)] ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden">
                    {activeTab === 'orders' ? (
                        <div className="h-full flex flex-col">
                            {/* Orders Header */}
                            <div className="grid grid-cols-7 gap-1 px-3 py-2 border-b border-[var(--border-subtle)] text-[var(--text-muted)] shrink-0">
                                <div>TIME</div>
                                <div>SYMBOL</div>
                                <div className="text-center">SIDE</div>
                                <div className="text-right">QTY</div>
                                <div className="text-right">PRICE</div>
                                <div className="text-center">STATUS</div>
                                <div className="text-right">ID</div>
                            </div>
                            
                            {/* Orders List */}
                            <div className="flex-1 overflow-y-auto no-scrollbar">
                                {orders.length > 0 ? (
                                    orders.map((order, i) => (
                                        <div
                                            key={`${order.order_id}-${order.time}-${i}`}
                                            className={`grid grid-cols-7 gap-1 py-1.5 px-3 border-b border-[var(--border-subtle)]/30 hover:bg-[var(--bg-tertiary)]/50 ${
                                                order.side === 'BUY' ? 'bg-emerald-500/5' : 'bg-rose-500/5'
                                            }`}
                                        >
                                            <span className="text-[var(--text-muted)]">{formatTime(order.time)}</span>
                                            <span className="text-[var(--text-primary)] font-semibold">{order.symbol}</span>
                                            <span className={`text-center font-bold ${order.side === 'BUY' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {order.side}
                                            </span>
                                            <span className="text-right text-[var(--text-primary)]">{order.quantity}</span>
                                            <span className="text-right text-[var(--text-muted)]">
                                                {order.limit_price ? order.limit_price.toFixed(2) : 'MKT'}
                                            </span>
                                            <span className="flex items-center justify-center gap-1">
                                                {getStatusIcon(order.status)}
                                            </span>
                                            <span className="text-right text-[var(--text-muted)] opacity-60 truncate">
                                                {order.order_id?.slice(-6) || '---'}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex items-center justify-center h-full text-[var(--text-muted)] opacity-30 italic">
                                        {loading ? 'Loading...' : 'No orders'}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col">
                            {/* Trades Header */}
                            <div className="grid grid-cols-7 gap-1 px-3 py-2 border-b border-[var(--border-subtle)] text-[var(--text-muted)] shrink-0">
                                <div>TIME</div>
                                <div>SYMBOL</div>
                                <div className="text-center">SIDE</div>
                                <div className="text-right">QTY</div>
                                <div className="text-right">PRICE</div>
                                <div className="text-right">P&L</div>
                                <div className="text-right">COMM</div>
                            </div>
                            
                            {/* Trades List */}
                            <div className="flex-1 overflow-y-auto no-scrollbar">
                                {trades.length > 0 ? (
                                    trades.map((trade, i) => (
                                        <div
                                            key={`${trade.trade_id}-${i}`}
                                            className={`grid grid-cols-7 gap-1 py-1.5 px-3 border-b border-[var(--border-subtle)]/30 hover:bg-[var(--bg-tertiary)]/50 ${
                                                trade.side?.toUpperCase() === 'BOT' || trade.side?.toUpperCase() === 'BUY' 
                                                    ? 'bg-emerald-500/5' 
                                                    : 'bg-rose-500/5'
                                            }`}
                                        >
                                            <span className="text-[var(--text-muted)]">{formatTime(trade.time)}</span>
                                            <span className="text-[var(--text-primary)] font-semibold">{trade.symbol}</span>
                                            <span className={`text-center font-bold ${
                                                trade.side?.toUpperCase() === 'BOT' || trade.side?.toUpperCase() === 'BUY'
                                                    ? 'text-emerald-500' 
                                                    : 'text-rose-500'
                                            }`}>
                                                {trade.side?.toUpperCase() === 'BOT' ? 'BUY' : trade.side?.toUpperCase() === 'SLD' ? 'SELL' : trade.side}
                                            </span>
                                            <span className="text-right text-[var(--text-primary)]">{trade.quantity}</span>
                                            <span className="text-right text-[var(--text-primary)] font-semibold">
                                                {trade.price.toFixed(2)}
                                            </span>
                                            <span className={`text-right font-semibold ${
                                                trade.realized_pnl > 0 
                                                    ? 'text-emerald-500' 
                                                    : trade.realized_pnl < 0 
                                                        ? 'text-rose-500' 
                                                        : 'text-[var(--text-muted)]'
                                            }`}>
                                                {trade.realized_pnl !== 0 
                                                    ? (trade.realized_pnl > 0 ? '+' : '') + trade.realized_pnl.toFixed(2)
                                                    : '---'
                                                }
                                            </span>
                                            <span className="text-right text-[var(--text-muted)]">
                                                {trade.commission > 0 ? `-${trade.commission.toFixed(2)}` : '---'}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex items-center justify-center h-full text-[var(--text-muted)] opacity-30 italic">
                                        {loading ? 'Loading...' : 'No trade fills'}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="shrink-0 border-t border-[var(--border-subtle)] py-1.5 px-3 flex justify-between text-[var(--text-muted)] bg-[var(--bg-secondary)]/50">
                    <span className="flex items-center gap-2">
                        <Receipt className="w-3 h-3" />
                        {activeTab === 'orders' ? `${orders.length} orders` : `${trades.length} fills`}
                    </span>
                    <span className="text-[9px] opacity-60">
                        Auto-refresh: 15s
                    </span>
                </div>
            </div>
        </CollapsiblePanel>
    );
}
