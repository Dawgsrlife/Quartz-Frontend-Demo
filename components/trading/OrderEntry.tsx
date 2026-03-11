"use client";

import { useState, useEffect } from "react";
import { OrderService, OrderRequest, OrderResponse, IBKRStatus } from "@/services/OrderSerivce";
import { MARKET_DATA_WS } from "@/lib/MarketDataClient";

interface OrderEntryProps {
    symbol?: string;
}

export function OrderEntry({ symbol = "ES" }: OrderEntryProps) {
    const [quantity, setQuantity] = useState<number>(1);
    const [orderType, setOrderType] = useState<"MARKET" | "LIMIT">("MARKET");
    const [limitPrice, setLimitPrice] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lastOrder, setLastOrder] = useState<OrderResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [ibkrStatus, setIbkrStatus] = useState<IBKRStatus | null>(null);
    const [currentPrice, setCurrentPrice] = useState<number | null>(null);

    // Fetch IBKR status on mount
    useEffect(() => {
        const checkStatus = async () => {
            try {
                const status = await OrderService.getIBKRStatus();
                setIbkrStatus(status);
            } catch (err) {
                console.error("Failed to fetch IBKR status:", err);
            }
        };
        checkStatus();
        
        // Refresh status every 30 seconds
        const interval = setInterval(checkStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    // Subscribe to price updates via WebSocket proxy
    useEffect(() => {
        if (!MARKET_DATA_WS) return;
        
        let ws: WebSocket | null = null;
        try {
            ws = new WebSocket(MARKET_DATA_WS);
            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.price) {
                        setCurrentPrice(data.price);
                    }
                } catch {
                    // ignore parse errors
                }
            };
        } catch {
            // WebSocket unavailable
        }
        
        return () => { ws?.close(); };
    }, []);

    const handleOrder = async (side: "BUY" | "SELL") => {
        setIsSubmitting(true);
        setError(null);
        setLastOrder(null);

        const orderRequest: OrderRequest = {
            symbol,
            quantity,
            order_type: orderType,
            limit_price: orderType === "LIMIT" ? parseFloat(limitPrice) : undefined,
        };

        try {
            const response = side === "BUY" 
                ? await OrderService.buyOrder(orderRequest)
                : await OrderService.sellOrder(orderRequest);
            
            setLastOrder(response);
            
            // Flash success briefly
            setTimeout(() => setLastOrder(null), 5000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Order failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePanic = async () => {
        if (!confirm("⚠️ PANIC BUTTON: Cancel ALL open orders?\n\nThis action cannot be undone.")) {
            return;
        }

        setIsSubmitting(true);
        try {
            await OrderService.panicButton();
            setError(null);
            alert("✅ All orders cancelled");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Panic failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const contractValue = currentPrice ? currentPrice * 50 : 0; // ES multiplier is $50
    const notionalValue = contractValue * quantity;

    return (
        <div className="flex flex-col gap-4 p-6 bg-[#0a0a0f] border border-white/5 rounded-lg">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-7 items-center rounded bg-white/90 px-2.5 font-display text-[11px] font-bold text-[#0a0a0f] uppercase tracking-tight">
                        {symbol}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest">
                            Order Entry
                        </span>
                        {currentPrice && (
                            <span className="font-mono text-sm font-bold text-white">
                                {currentPrice.toFixed(2)}
                            </span>
                        )}
                    </div>
                </div>
                
                {/* IBKR Status */}
                <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${
                        ibkrStatus?.connected ? "bg-green-400" : "bg-red-400"
                    }`} />
                    <span className="font-mono text-[9px] text-white/50 uppercase">
                        {ibkrStatus?.connected ? "IBKR CONNECTED" : "IBKR OFFLINE"}
                    </span>
                </div>
            </div>

            {/* Order Type Toggle */}
            <div className="flex gap-1 p-1 bg-white/5 rounded">
                <button
                    onClick={() => setOrderType("MARKET")}
                    className={`flex-1 py-2 font-mono text-[10px] uppercase tracking-wider transition-all rounded ${
                        orderType === "MARKET"
                            ? "bg-white/10 text-white font-bold"
                            : "text-white/40 hover:text-white/60"
                    }`}
                >
                    Market
                </button>
                <button
                    onClick={() => setOrderType("LIMIT")}
                    className={`flex-1 py-2 font-mono text-[10px] uppercase tracking-wider transition-all rounded ${
                        orderType === "LIMIT"
                            ? "bg-white/10 text-white font-bold"
                            : "text-white/40 hover:text-white/60"
                    }`}
                >
                    Limit
                </button>
            </div>

            {/* Quantity */}
            <div className="flex flex-col gap-2">
                <label className="font-mono text-[9px] text-white/40 uppercase tracking-widest">
                    Quantity (Contracts)
                </label>
                <div className="flex gap-2">
                    <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded font-mono text-lg text-white/60 transition-colors"
                    >
                        -
                    </button>
                    <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                        className="flex-1 h-10 bg-white/5 border border-white/10 rounded text-center font-mono text-lg text-white focus:outline-none focus:border-white/30"
                        min={1}
                        max={100}
                    />
                    <button
                        onClick={() => setQuantity(Math.min(100, quantity + 1))}
                        className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded font-mono text-lg text-white/60 transition-colors"
                    >
                        +
                    </button>
                </div>
                {notionalValue > 0 && (
                    <span className="font-mono text-[9px] text-white/30">
                        Notional: ${notionalValue.toLocaleString()} ({quantity} × $50 × {currentPrice?.toFixed(2)})
                    </span>
                )}
            </div>

            {/* Limit Price (conditional) */}
            {orderType === "LIMIT" && (
                <div className="flex flex-col gap-2">
                    <label className="font-mono text-[9px] text-white/40 uppercase tracking-widest">
                        Limit Price
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            step="0.25"
                            value={limitPrice}
                            onChange={(e) => setLimitPrice(e.target.value)}
                            placeholder={currentPrice?.toFixed(2) || "0.00"}
                            className="flex-1 h-10 px-3 bg-white/5 border border-white/10 rounded font-mono text-lg text-white focus:outline-none focus:border-white/30"
                        />
                        {currentPrice && (
                            <button
                                onClick={() => setLimitPrice(currentPrice.toFixed(2))}
                                className="px-3 h-10 bg-white/5 hover:bg-white/10 rounded font-mono text-[10px] text-white/60 uppercase tracking-wider transition-colors"
                            >
                                Last
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Buy/Sell Buttons */}
            <div className="flex gap-2 pt-2">
                <button
                    onClick={() => handleOrder("BUY")}
                    disabled={isSubmitting || !ibkrStatus?.connected}
                    className="flex-1 py-3 bg-green-500 hover:bg-green-400 disabled:bg-green-500/30 disabled:cursor-not-allowed rounded font-display text-sm font-bold text-black uppercase tracking-wider transition-colors"
                >
                    {isSubmitting ? "..." : "Buy"}
                </button>
                <button
                    onClick={() => handleOrder("SELL")}
                    disabled={isSubmitting || !ibkrStatus?.connected}
                    className="flex-1 py-3 bg-red-500 hover:bg-red-400 disabled:bg-red-500/30 disabled:cursor-not-allowed rounded font-display text-sm font-bold text-black uppercase tracking-wider transition-colors"
                >
                    {isSubmitting ? "..." : "Sell"}
                </button>
            </div>

            {/* Panic Button */}
            <button
                onClick={handlePanic}
                disabled={isSubmitting}
                className="w-full py-2 border-2 border-red-500/50 hover:border-red-500 hover:bg-red-500/10 rounded font-mono text-[10px] text-red-400 uppercase tracking-widest transition-colors"
            >
                🚨 Cancel All Orders
            </button>

            {/* Success Message */}
            {lastOrder && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded">
                    <div className="font-mono text-[10px] text-green-400 uppercase tracking-wider">
                        ✓ {lastOrder.side} {lastOrder.quantity} {lastOrder.symbol} @ {lastOrder.order_type}
                    </div>
                    <div className="font-mono text-[9px] text-green-400/60 mt-1">
                        Order ID: {lastOrder.order_id}
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded">
                    <div className="font-mono text-[10px] text-red-400 uppercase tracking-wider">
                        ✗ {error}
                    </div>
                </div>
            )}

            {/* Account Info */}
            {ibkrStatus?.accounts && ibkrStatus.accounts.length > 0 && (
                <div className="pt-2 border-t border-white/5">
                    <div className="font-mono text-[9px] text-white/30">
                        Account: {ibkrStatus.accounts[0]} • {ibkrStatus.contract?.symbol || "No contract"}
                    </div>
                </div>
            )}
        </div>
    );
}

export default OrderEntry;
