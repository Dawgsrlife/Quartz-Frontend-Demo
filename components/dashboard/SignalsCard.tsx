"use client";

const signals = [
    { id: 1, side: "LONG", symbol: "ES", ago: "2m ago", type: "Order Filled" },
    { id: 2, side: "LONG", symbol: "MES", ago: "7m ago", type: "Signal Alert" },
    { id: 3, side: "SHORT", symbol: "SPX 0DTE", ago: "12m ago", type: "Risk Trigger" },
];

export function SignalsCard() {
    return (
        <section className="flex flex-col h-full p-8">
            <header className="mb-8 flex flex-col gap-1.5">
                <h3 className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-quartz-muted">
                    Activity
                </h3>
                <p className="text-[11px] font-mono text-quartz-muted/60 uppercase tracking-widest">
                    Execution Log
                </p>
            </header>

            <div className="space-y-2">
                {signals.map((s) => {
                    const isLong = s.side === "LONG";
                    return (
                        <div
                            key={s.id}
                            className="group flex items-center justify-between rounded-lg border border-quartz-border bg-quartz-bg/50 p-4 transition-all hover:border-quartz-accent/20 hover:bg-quartz-accent/[0.02]"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`h-8 w-[2px] rounded-full ${
                                    isLong ? "bg-quartz-up/50 shadow-[0_0_10px_var(--accent-glow)]" : "bg-quartz-down/50"
                                }`} />
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className={`font-display text-xs font-bold tracking-tight ${
                                            isLong ? "text-quartz-up" : "text-quartz-down"
                                        }`}>
                                            {s.side}
                                        </p>
                                        <p className="font-display text-xs font-semibold text-quartz-text">
                                            {s.symbol}
                                        </p>
                                    </div>
                                    <p className="font-mono text-[10px] text-quartz-muted uppercase tracking-tighter mt-0.5">
                                        {s.type}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="font-mono text-[10px] text-quartz-muted tabular-nums">
                                    {s.ago}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
