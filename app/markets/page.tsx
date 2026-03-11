"use client";

import React, { useRef } from "react";
import { TrendingUp, Zap } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function MarketsPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const tl = gsap.timeline({ defaults: { ease: "expo.out", duration: 0.6 } });
        
        tl.from(headerRef.current, { 
            y: 10, 
            opacity: 0,
            filter: "blur(4px)",
            clearProps: "all"
        })
        .from(gridRef.current, {
            opacity: 0,
            scale: 0.99,
            duration: 0.8,
            clearProps: "all",
        }, "-=0.4")
        .from(".market-card", { 
            opacity: 0, 
            y: 15,
            stagger: 0.03,
            clearProps: "all"
        }, "-=0.6");
    }, { scope: containerRef });

    const markets = [
        { symbol: "ESZ6", name: "S&P 500 E-mini", price: "4512.25", change: "+1.2%", status: "Optimal", trend: "up" },
        { symbol: "NQZ6", name: "Nasdaq 100 E-mini", price: "15234.50", change: "+0.8%", status: "High", trend: "up" },
        { symbol: "GCZ6", name: "Gold Futures", price: "2045.20", change: "-0.3%", status: "Neutral", trend: "down" },
        { symbol: "CLZ6", name: "Crude Oil", price: "78.45", change: "+2.1%", status: "Volatile", trend: "up" },
        { symbol: "RTYZ6", name: "Russell 2000", price: "1985.10", change: "-0.5%", status: "Weak", trend: "down" },
        { symbol: "YMZ6", name: "Dow Futures", price: "35420.00", change: "+0.4%", status: "Stable", trend: "up" },
    ];

    return (
        <div ref={containerRef} className="p-8 lg:p-12 overflow-y-auto h-full bg-quartz-bg">
            <div className="mx-auto max-w-[1600px] space-y-12">
                <header ref={headerRef} className="flex items-end justify-between border-b border-quartz-border pb-10">
                    <div className="space-y-2">
                        <h1 className="font-display text-4xl font-bold tracking-tight text-quartz-text">
                            Markets
                        </h1>
                        <p className="font-mono text-[10px] text-quartz-muted uppercase tracking-[0.2em]">
                            Institutional Grade Intelligence • Global Derivatives
                        </p>
                    </div>
                    <div className="flex items-center gap-8">
                        <div className="text-right">
                            <p className="font-display text-[10px] font-medium uppercase tracking-widest text-quartz-muted">Network Status</p>
                            <div className="flex items-center gap-2 justify-end">
                                <span className="h-1.5 w-1.5 rounded-full bg-quartz-up animate-pulse" />
                                <span className="font-mono text-[11px] font-bold text-quartz-up uppercase">Synchronized</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-quartz-border border border-quartz-border overflow-hidden rounded-lg">
                    {markets.map((market) => (
                        <div 
                            key={market.symbol} 
                            className="market-card group bg-quartz-bg p-8 transition-all hover:bg-white/[0.02] cursor-pointer"
                        >
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <h3 className="font-display text-xl font-bold text-quartz-text tracking-tight mb-1">{market.symbol}</h3>
                                    <p className="font-mono text-[10px] text-quartz-muted uppercase tracking-widest">{market.name}</p>
                                </div>
                                <div className={`font-mono text-xs font-bold ${market.trend === 'up' ? 'text-quartz-up' : 'text-rose-500'}`}>
                                    {market.change}
                                </div>
                            </div>
                            
                            <div className="flex items-baseline justify-between">
                                <div className="font-mono text-4xl font-light tabular-nums text-quartz-text tracking-tighter">
                                    {market.price}
                                </div>
                                <div className="flex items-center gap-2 font-mono text-[9px] font-bold text-quartz-muted uppercase tracking-[0.1em]">
                                    <span className={market.trend === 'up' ? 'text-quartz-up' : 'text-rose-500'}>
                                        {market.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
