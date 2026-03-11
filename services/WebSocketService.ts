/**
 * WebSocketService — MOCK VERSION for frontend demo.
 *
 * Simulates live market ticks using setInterval instead of real WebSocket.
 */

import { useMarketStore } from "@/lib/store";

export interface Tick {
    symbol: string;
    price: number;
    size: number;
    side: 'buy' | 'sell';
    time: number;
    signal?: string | null;
}

export interface Candle {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface Trade {
    time: number;
    price: number;
    size: number;
    side: 'buy' | 'sell';
}

class WebSocketService {
    private subscribers: ((data: any) => void)[] = [];
    private currentCandle: Candle | null = null;
    private intervalId: ReturnType<typeof setInterval> | null = null;
    private basePrice = 5905.50;

    connect() {
        if (this.intervalId) return;

        console.log("🔌 DEMO MODE: Simulating market data stream...");

        // Simulate ticks every 500ms
        this.intervalId = setInterval(() => {
            this.basePrice += (Math.random() - 0.5) * 1.5;

            const tick: Tick = {
                symbol: "ES",
                price: +this.basePrice.toFixed(2),
                size: Math.floor(Math.random() * 10) + 1,
                side: Math.random() > 0.5 ? 'buy' : 'sell',
                time: Date.now(),
                signal: Math.random() > 0.95 ? "ORB_BREAKOUT" : null,
            };

            // Update Global Store
            useMarketStore.getState().updateTick({
                symbol: tick.symbol,
                price: tick.price,
                timestamp: tick.time,
                signal: tick.signal || undefined,
            });

            this.notify({ type: 'TICK', data: tick });
            this.updateCandle(tick);
        }, 500);
    }

    subscribe(callback: (data: any) => void) {
        this.subscribers.push(callback);
    }

    unsubscribe(callback: (data: any) => void) {
        this.subscribers = this.subscribers.filter(cb => cb !== callback);
    }

    private updateCandle(tick: Tick) {
        const coeff = 1000 * 60;
        const candleTime = Math.floor(tick.time / coeff) * coeff / 1000;

        if (!this.currentCandle || this.currentCandle.time !== candleTime) {
            this.currentCandle = {
                time: candleTime,
                open: tick.price,
                high: tick.price,
                low: tick.price,
                close: tick.price,
                volume: tick.size
            };
        } else {
            this.currentCandle.close = tick.price;
            this.currentCandle.high = Math.max(this.currentCandle.high, tick.price);
            this.currentCandle.low = Math.min(this.currentCandle.low, tick.price);
            this.currentCandle.volume += tick.size;
        }

        this.notify({ type: 'CANDLE_UPDATE', data: this.currentCandle });
    }

    private notify(message: any) {
        this.subscribers.forEach(cb => cb(message));
    }

    triggerPanic() {
        console.warn("🚨 DEMO: Emergency stop triggered (simulated)");
    }
}

export const wsService = new WebSocketService();