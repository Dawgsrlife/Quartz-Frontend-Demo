"use client";

export function StrategyPerfCard() {
    return (
        <section className="flex flex-col h-full p-8">
            <header className="mb-8 flex items-center justify-between">
                <div className="flex flex-col gap-1.5">
                    <h3 className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-quartz-muted">
                        Analysis
                    </h3>
                    <p className="text-[11px] font-mono text-quartz-muted/60 uppercase tracking-widest">
                        Performance
                    </p>
                </div>
                <div className="inline-flex items-center rounded-sm bg-quartz-border/30 p-1">
                    {["RSI", "MACD", "Trend"].map((tab, idx) => (
                        <button
                            key={tab}
                            className={`rounded-sm px-3 py-1 text-[9px] font-mono font-bold uppercase tracking-widest transition-all ${
                                idx === 2
                                    ? "bg-quartz-text text-quartz-bg shadow-sm"
                                    : "text-quartz-muted hover:text-quartz-text"
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </header>

            <div className="grid gap-px bg-quartz-border rounded-sm overflow-hidden border border-quartz-border">
                <div className="group relative bg-quartz-bg p-4 transition-all hover:bg-white/[0.02]">
                    <p className="mb-4 font-mono text-[9px] uppercase tracking-[0.15em] text-quartz-muted">Equity curve</p>
                    <div className="h-24 bg-gradient-to-t from-quartz-accent/10 via-quartz-accent/[0.02] to-transparent border-b border-quartz-accent/20" />
                </div>
                <div className="group relative bg-quartz-bg p-4 transition-all hover:bg-white/[0.02]">
                    <p className="mb-4 font-mono text-[9px] uppercase tracking-[0.15em] text-quartz-muted">Drawdown</p>
                    <div className="h-24 bg-gradient-to-t from-quartz-up/10 via-quartz-up/[0.02] to-transparent border-b border-quartz-up/20" />
                </div>
            </div>
        </section>
    );
}
