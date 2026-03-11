"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Cpu, Zap, Activity, Shield, BarChart3, ChevronDown, ArrowRight } from "lucide-react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

export default function StrategiesPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const galleryRef = useRef<HTMLDivElement>(null);
    const scrollerRef = useRef<HTMLDivElement>(null);

    const strategies = [
        { 
            id: "STRAT-ORB",
            name: "Opening Range Breakout", 
            type: "Breakout", 
            timeframe: "Intraday (5-30m)",
            status: "IMPLEMENTED",
            description: "Institutional strategy capturing the volatility expansion following the market open. Analyzes the opening range highs and lows for high-probability breakouts.",
            icon: <Zap className="w-8 h-8" />,
            metrics: { win_rate: "62%", pf: "2.3", vol: "18.5%" },
            color: "var(--accent)"
        },
    ];


    useGSAP(() => {
        if (!containerRef.current || !galleryRef.current || !scrollerRef.current) return;

        // Intro Animation
        gsap.from(".intro-content > *", {
            y: 40,
            opacity: 0,
            duration: 1.2,
            stagger: 0.1,
            ease: "expo.out",
            clearProps: "all"
        });

        // Gallery Pinned Timeline
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: galleryRef.current,
                scroller: scrollerRef.current,
                start: "top top",
                end: "+=4000",
                pin: true,
                scrub: 1,
            }
        });

        // Set initial state for cards
        gsap.set(".strategy-slide", { 
            opacity: 0, 
            scale: 0.8, 
            z: -1000,
            rotateX: 15,
            visibility: "hidden"
        });

        strategies.forEach((_, index) => {
            const slide = `.slide-${index}`;
            const isLast = index === strategies.length - 1;

            // Appearance
            tl.to(slide, {
                opacity: 1,
                scale: 1,
                z: 0,
                rotateX: 0,
                visibility: "visible",
                duration: 1,
                ease: "power2.inOut"
            });

            // If not last, move it out
            if (!isLast) {
                tl.to(slide, {
                    opacity: 0,
                    scale: 1.2,
                    z: 500,
                    rotateX: -15,
                    duration: 1,
                    ease: "power2.inOut"
                }, "+=0.5");
            } else {
                // Hold last one
                tl.to(slide, { duration: 1 });
            }
        });

        // Progress bar
        tl.to(".scroll-progress-fill", {
            scaleX: 1,
            ease: "none"
        }, 0);

    }, { scope: containerRef });

    return (
        <div ref={containerRef} className="h-full bg-quartz-bg relative overflow-hidden">
            {/* Custom Scroller to avoid layout issues */}
            <div ref={scrollerRef} className="h-full overflow-y-auto overflow-x-hidden scroll-smooth hide-scrollbar">
                
                {/* 1. Hero / Intro Section */}
                <section className="h-screen flex flex-col items-center justify-center p-8 relative intro-content">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="h-2 w-2 rounded-full bg-quartz-accent animate-pulse" />
                        <span className="font-mono text-[10px] text-quartz-accent uppercase tracking-[0.4em] font-bold">
                            Institutional Engine v4.0
                        </span>
                    </div>
                    <h1 className="font-display text-7xl md:text-9xl font-bold tracking-tighter text-quartz-text uppercase text-center leading-none mb-8">
                        Strategy<br/><span className="text-transparent border-text-quartz-text" style={{ WebkitTextStroke: '1px var(--text-muted)' }}>Manifest</span>
                    </h1>
                    <p className="font-mono text-xs text-quartz-muted uppercase tracking-[0.3em] max-w-2xl text-center leading-relaxed opacity-60">
                        A curated collection of algorithmic architectures executing on high-performance EC2 clusters. Purity in logic. Precision in execution.
                    </p>
                    
                    <div className="absolute bottom-12 flex flex-col items-center gap-4 opacity-40">
                        <span className="font-mono text-[9px] uppercase tracking-widest">Scroll to explore</span>
                        <ChevronDown className="w-4 h-4 animate-bounce" />
                    </div>
                </section>

                {/* 2. Gallery Section (Pinned) */}
                <section ref={galleryRef} className="h-screen relative flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,139,83,0.05)_0%,transparent_70%)] pointer-events-none" />
                    
                    {/* Progress Bar */}
                    <div className="absolute top-0 left-0 w-full h-px bg-quartz-border z-50">
                        <div className="scroll-progress-fill h-full bg-quartz-accent origin-left scale-x-0" />
                    </div>

                    {/* Slides Container */}
                    <div className="relative w-full max-w-5xl h-[600px] perspective-2000">
                        {strategies.map((strat, index) => (
                            <div 
                                key={strat.id}
                                className={`slide-${index} strategy-slide absolute inset-0 flex items-center justify-center pointer-events-none`}
                            >
                                <div className="w-full bg-quartz-bg/80 backdrop-blur-xl border border-quartz-border rounded-2xl p-12 shadow-2xl flex flex-col md:flex-row gap-12 pointer-events-auto group">
                                    {/* Left Side: Visuals */}
                                    <div className="w-full md:w-1/3 flex flex-col justify-between border-r border-quartz-border/30 pr-12">
                                        <div className="space-y-8">
                                            <div className="p-4 rounded-xl bg-quartz-accent/5 border border-quartz-accent/20 text-quartz-accent w-fit">
                                                {strat.icon}
                                            </div>
                                            <div className="space-y-2">
                                                <div className="font-mono text-[10px] text-quartz-muted uppercase tracking-widest flex items-center gap-2">
                                                    <span>{strat.id}</span>
                                                    <span className="h-1 w-1 rounded-full bg-quartz-border" />
                                                    <span>{strat.type}</span>
                                                </div>
                                                <h2 className="font-display text-4xl font-bold text-quartz-text uppercase tracking-tight">
                                                    {strat.name}
                                                </h2>
                                            </div>
                                        </div>
                                        
                                        <div className="pt-8 space-y-4">
                                            <div className="flex items-center gap-2">
                                                <div className="h-1 w-8 bg-quartz-accent rounded-full" />
                                                <span className="font-mono text-[9px] text-quartz-accent uppercase tracking-widest font-bold">Live Status</span>
                                            </div>
                                            <div className="text-3xl font-display font-bold text-quartz-text uppercase tracking-tighter">
                                                {strat.status}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Side: Data */}
                                    <div className="flex-1 flex flex-col justify-between py-4">
                                        <div className="space-y-8">
                                            <p className="font-display text-xl text-quartz-text leading-tight uppercase opacity-80">
                                                {strat.description}
                                            </p>
                                            
                                            <div className="grid grid-cols-3 gap-8 pt-8">
                                                <div className="space-y-1">
                                                    <p className="font-mono text-[9px] text-quartz-muted uppercase tracking-widest">Win Rate</p>
                                                    <p className="font-display text-2xl font-bold text-quartz-up">{strat.metrics.win_rate}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="font-mono text-[9px] text-quartz-muted uppercase tracking-widest">Profit Factor</p>
                                                    <p className="font-display text-2xl font-bold text-quartz-text">{strat.metrics.pf}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="font-mono text-[9px] text-quartz-muted uppercase tracking-widest">Volatility</p>
                                                    <p className="font-display text-2xl font-bold text-quartz-muted">{strat.metrics.vol}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between border-t border-quartz-border/30 pt-12">
                                            <div className="flex items-center gap-8">
                                                <div>
                                                    <p className="font-mono text-[8px] text-quartz-muted uppercase tracking-widest mb-1">Horizon</p>
                                                    <p className="font-display text-xs font-bold text-quartz-text uppercase">{strat.timeframe}</p>
                                                </div>
                                                <div>
                                                    <p className="font-mono text-[8px] text-quartz-muted uppercase tracking-widest mb-1">Asset Class</p>
                                                    <p className="font-display text-xs font-bold text-quartz-text uppercase">Multi-Asset</p>
                                                </div>
                                            </div>
                                            <button className="flex items-center gap-3 px-6 py-3 bg-quartz-accent/10 border border-quartz-accent/20 rounded-full group-hover:bg-quartz-accent group-hover:text-quartz-bg transition-all duration-500 font-mono text-[10px] uppercase tracking-widest font-bold">
                                                View Backtest
                                                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Background Indexing */}
                    <div className="absolute left-12 bottom-12 flex flex-col gap-2">
                        {strategies.map((_, i) => (
                            <div key={i} className="flex items-center gap-4 group">
                                <span className="font-mono text-[10px] text-quartz-muted group-hover:text-quartz-accent transition-colors">0{i+1}</span>
                                <div className="w-12 h-px bg-quartz-border group-hover:w-16 group-hover:bg-quartz-accent transition-all" />
                            </div>
                        ))}
                    </div>
                </section>

                {/* 3. Outro / Footer Section */}
                <section className="min-h-screen p-24 flex flex-col justify-between border-t border-quartz-border bg-quartz-bg">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
                        <div className="space-y-8">
                            <h3 className="font-display text-3xl font-bold text-quartz-text uppercase tracking-tight">Technical Constraints</h3>
                            <div className="space-y-6">
                                <p className="font-mono text-xs text-quartz-muted leading-relaxed uppercase opacity-60">
                                    Each strategy operates as an independent actor within our managed cluster. Output signals are delivered via JSON payloads containing confidence scores and trade direction.
                                </p>
                                <p className="font-mono text-xs text-quartz-muted leading-relaxed uppercase opacity-60">
                                    Historical performance is derived from 10-year rolling windows with realistic slippage (0.5 ticks) and tiered commission models. Execution occurs via high-priority FIX gateways.
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col justify-center border-l border-quartz-border pl-24 space-y-12">
                            <div className="space-y-2">
                                <p className="font-mono text-[10px] text-quartz-muted uppercase tracking-widest">Server Uptime</p>
                                <p className="font-display text-5xl font-bold text-quartz-up tracking-tighter">99.998%</p>
                            </div>
                            <div className="space-y-2">
                                <p className="font-mono text-[10px] text-quartz-muted uppercase tracking-widest">Latency (P99)</p>
                                <p className="font-display text-5xl font-bold text-quartz-accent tracking-tighter">1.2ms</p>
                            </div>
                        </div>
                    </div>

                    <footer className="pt-24 flex justify-between items-end border-t border-quartz-border/30">
                        <div className="flex items-center gap-12 font-mono text-[9px] text-quartz-muted uppercase tracking-widest">
                            <span>Quartz Protocol © 2026</span>
                            <span>All Intellectual Property Reserved</span>
                        </div>
                        <div className="text-right">
                            <p className="font-mono text-[9px] text-quartz-muted uppercase tracking-widest mb-2 opacity-40">Network Status</p>
                            <div className="flex items-center gap-3 justify-end">
                                <span className="h-1.5 w-1.5 rounded-full bg-quartz-up shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                                <span className="font-mono text-[10px] font-bold text-quartz-up uppercase tracking-widest">Secure Link Established</span>
                            </div>
                        </div>
                    </footer>
                </section>

                {/* Spacer for ending the scroll */}
                <div className="h-20" />
            </div>

            <style jsx global>{`
                .perspective-2000 {
                    perspective: 2000px;
                }
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .border-text-quartz-text {
                    color: transparent;
                }
            `}</style>
        </div>
    );
}
