"use client";

import React, { useRef } from "react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { RiskProfileCard } from "@/components/dashboard/RiskProfileCard";
import { SignalsCard } from "@/components/dashboard/SignalsCard";
import { StrategyPerfCard } from "@/components/dashboard/StrategyPerfCard";
import TradingViewWidget from "@/components/charts/TradingViewWidget";
import { useAccountStore } from "@/lib/store";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function DashboardPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);

    const { balance, dailyPl, positions } = useAccountStore();
    
    const formattedBalance = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(balance);
    const formattedDailyPl = (dailyPl >= 0 ? "+" : "") + new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(dailyPl);
    const dailyPlPercent = ((dailyPl / (balance - dailyPl)) * 100).toFixed(2);

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
        .from(".metric-card-anim", { 
            opacity: 0, 
            y: 15,
            stagger: 0.03,
            clearProps: "all"
        }, "-=0.6")
        .from(".dashboard-section", {
            y: 15,
            opacity: 0,
            stagger: 0.05,
            clearProps: "all"
        }, "-=0.4");
    }, { scope: containerRef });

    return (
        <div ref={containerRef} className="p-8 lg:p-12 overflow-y-auto h-full bg-quartz-bg">
            <div className="mx-auto max-w-[1600px] space-y-12">
                <header ref={headerRef} className="flex items-end justify-between border-b border-quartz-border pb-10">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-quartz-accent" />
                            <span className="font-mono text-[9px] text-quartz-accent uppercase tracking-[0.3em] font-bold">Live Execution Environment</span>
                        </div>
                        <h1 className="font-display text-4xl font-bold tracking-tight text-quartz-text uppercase">
                            Terminal Dashboard
                        </h1>
                        <p className="font-mono text-[10px] text-quartz-muted uppercase tracking-[0.2em] max-w-xl">
                            Real-time synchronization with production exchange nodes and risk management protocols.
                        </p>
                    </div>
                    <div className="flex items-center gap-8 text-right">
                        <div>
                            <p className="font-display text-[10px] font-medium uppercase tracking-widest text-quartz-muted">Market Status</p>
                            <div className="flex items-center gap-2 justify-end">
                                <span className="h-1.5 w-1.5 rounded-full bg-quartz-up animate-pulse" />
                                <span className="font-mono text-[11px] font-bold text-quartz-up uppercase">Session Active</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Metric row */}
                <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-quartz-border border border-quartz-border overflow-hidden rounded-lg">
                    <div className="metric-card-anim bg-quartz-bg">
                        <MetricCard
                            label="Portfolio value"
                            value={formattedBalance}
                            sub="Live Account"
                            subTone="gold"
                        />
                    </div>
                    <div className="metric-card-anim bg-quartz-bg">
                        <MetricCard
                            label="Daily P&L"
                            value={formattedDailyPl}
                            sub={`${dailyPlPercent}% daily`}
                            subTone={dailyPl >= 0 ? "gold" : "rose"}
                        />
                    </div>
                    <div className="metric-card-anim bg-quartz-bg">
                        <MetricCard 
                            label="Open positions" 
                            value={positions.length.toString()} 
                            sub={positions.length > 0 ? `${positions.length} active symbols` : "No active trades"} 
                        />
                    </div>
                    <div className="metric-card-anim bg-quartz-bg">
                        <MetricCard
                            label="Win rate (30d)"
                            value="68%"
                            sub="Average performance"
                            subTone="gold"
                        />
                    </div>
                </div>

                {/* Middle row */}
                <div className="grid gap-px bg-quartz-border border border-quartz-border overflow-hidden rounded-lg lg:grid-cols-[minmax(0,1fr)_400px]">
                    <section className="dashboard-section flex flex-col bg-quartz-bg overflow-hidden">
                        <header className="flex items-center justify-between border-b border-quartz-border bg-quartz-bg/50 px-8 py-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-6 items-center rounded-sm bg-quartz-text px-2 font-display text-[10px] font-bold text-quartz-bg uppercase tracking-tighter">
                                    ES
                                </div>
                                <span className="font-mono text-[10px] text-quartz-muted uppercase tracking-widest">
                                    S&P 500 E-mini • 5m
                                </span>
                            </div>
                            <div className="flex items-center gap-2 rounded-full border border-quartz-gold/20 bg-quartz-gold/5 px-3 py-1">
                                <span className="h-1 w-1 rounded-full bg-quartz-gold" />
                                <span className="font-display text-[9px] font-bold uppercase tracking-widest text-quartz-gold">
                                    Active
                                </span>
                            </div>
                        </header>
                        <div className="h-[500px] w-full bg-quartz-bg">
                            <TradingViewWidget />
                        </div>
                    </section>

                    <div className="dashboard-section bg-quartz-bg">
                        <RiskProfileCard />
                    </div>
                </div>

                {/* Bottom row */}
                <div className="grid gap-px bg-quartz-border border border-quartz-border overflow-hidden rounded-lg lg:grid-cols-[1fr_1.2fr]">
                    <div className="dashboard-section bg-quartz-bg">
                        <SignalsCard />
                    </div>
                    <div className="dashboard-section bg-quartz-bg">
                        <StrategyPerfCard />
                    </div>
                </div>
            </div>
        </div>
    );
}
