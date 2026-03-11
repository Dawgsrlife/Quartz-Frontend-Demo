"use client";

import { useState, useEffect, useCallback } from "react";
import { OrderService } from "@/services/OrderSerivce";

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
    source: string;
}

interface OpenOrder {
    order_id: string;
    symbol: string;
    action: string;
    quantity: number;
    order_type: string;
    limit_price: number | null;
    status: string;
}

export function TradeHistory() {
    const [trades, setTrades] = useState<Trade[]>([]);
    const [openOrders, setOpenOrders] = useState<OpenOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"trades" | "orders">("trades");

    const fetchData = useCallback(async () => {
        try {
            const [tradesRes, ordersRes] = await Promise.all([
                OrderService.getTrades(20),
                OrderService.getOpenOrders(),
            ]);
            setTrades(tradesRes.trades || []);
            setOpenOrders(ordersRes.orders || []);
        } catch (err) {
            console.error("Failed to fetch trade data:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        
        // Refresh every 5 seconds
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const formatTime = (timeStr: string) => {
        const date = new Date(timeStr);
        return date.toLocaleTimeString("en-US", { 
            hour: "2-digit", 
            minute: "2-digit", 
            second: "2-digit" 
        });
    };

    return (
        <div className="flex flex-col h-full bg-[#0a0a0f] border border-white/5 rounded-lg overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-white/5">
                <button
                    onClick={() => setActiveTab("trades")}
                    className={`flex-1 py-3 font-mono text-[10px] uppercase tracking-widest transition-colors ${
                        activeTab === "trades"
                            ? "text-white border-b-2 border-green-500"
                            : "text-white/40 hover:text-white/60"
                    }`}
                >
                    Trades ({trades.length})
                </button>
                <button
                    onClick={() => setActiveTab("orders")}
                    className={`flex-1 py-3 font-mono text-[10px] uppercase tracking-widest transition-colors ${
                        activeTab === "orders"
                            ? "text-white border-b-2 border-yellow-500"
                            : "text-white/40 hover:text-white/60"
                    }`}
                >
                    Open Orders ({openOrders.length})
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="w-6 h-6 border-2 border-green-500/20 border-t-green-500 rounded-full animate-spin" />
                    </div>
                ) : activeTab === "trades" ? (
                    /* Trades List */
                    <div className="divide-y divide-white/5">
                        {trades.length === 0 ? (
                            <div className="p-6 text-center">
                                <span className="font-mono text-[10px] text-white/30 uppercase tracking-widest">
                                    No trades yet
                                </span>
                            </div>
                        ) : (
                            trades.map((trade, idx) => (
                                <div key={trade.trade_id || idx} className="flex items-center justify-between p-3 hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                                            trade.side === "BUY" || trade.side === "BOT"
                                                ? "bg-green-500/20 text-green-400"
                                                : "bg-red-500/20 text-red-400"
                                        }`}>
                                            {trade.side === "BOT" ? "BUY" : trade.side === "SLD" ? "SELL" : trade.side}
                                        </span>
                                        <div className="flex flex-col">
                                            <span className="font-mono text-[11px] text-white">
                                                {trade.quantity} {trade.symbol}
                                            </span>
                                            <span className="font-mono text-[9px] text-white/40">
                                                {formatTime(trade.time)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="font-mono text-[11px] text-white">
                                            ${trade.price.toFixed(2)}
                                        </span>
                                        {trade.realized_pnl !== 0 && (
                                            <span className={`font-mono text-[9px] ${
                                                trade.realized_pnl >= 0 ? "text-green-400" : "text-red-400"
                                            }`}>
                                                {trade.realized_pnl >= 0 ? "+" : ""}${trade.realized_pnl.toFixed(2)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    /* Open Orders List */
                    <div className="divide-y divide-white/5">
                        {openOrders.length === 0 ? (
                            <div className="p-6 text-center">
                                <span className="font-mono text-[10px] text-white/30 uppercase tracking-widest">
                                    No open orders
                                </span>
                            </div>
                        ) : (
                            openOrders.map((order, idx) => (
                                <div key={order.order_id || idx} className="flex items-center justify-between p-3 hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                                            order.action === "BUY"
                                                ? "bg-green-500/20 text-green-400"
                                                : "bg-red-500/20 text-red-400"
                                        }`}>
                                            {order.action}
                                        </span>
                                        <div className="flex flex-col">
                                            <span className="font-mono text-[11px] text-white">
                                                {order.quantity} {order.symbol}
                                            </span>
                                            <span className="font-mono text-[9px] text-white/40">
                                                {order.order_type} {order.limit_price ? `@ ${order.limit_price}` : ""}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-[9px] text-yellow-400 uppercase">
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/5 p-2">
                <button
                    onClick={fetchData}
                    className="w-full py-1.5 font-mono text-[9px] text-white/40 hover:text-white/60 uppercase tracking-widest transition-colors"
                >
                    ↻ Refresh
                </button>
            </div>
        </div>
    );
}

export default TradeHistory;
