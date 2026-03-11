"use client";

const profiles = [
    {
        id: "conservative",
        label: "Conservative",
        desc: "Lower leverage, tighter stops, max drawdown < 5%.",
        accent: "border-zinc-800",
    },
    {
        id: "balanced",
        label: "Balanced",
        desc: "Default mode, drawdown target < 10%.",
        accent: "border-amber-500/50",
    },
    {
        id: "aggressive",
        label: "Aggressive",
        desc: "Looser stops, faster scaling, monitored by risk caps.",
        accent: "border-rose-500/50",
    },
];

export function RiskProfileCard() {
    return (
        <section className="flex flex-col h-full p-8">
            <header className="mb-8 flex flex-col gap-1.5">
                <h3 className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-quartz-muted">
                    Risk Profile
                </h3>
                <p className="text-[11px] font-mono text-quartz-muted/60 uppercase tracking-widest">
                    Execution Mode
                </p>
            </header>

            <div className="flex flex-col gap-3">
                {profiles.map((p) => {
                    const selected = p.id === "balanced";
                    return (
                        <button
                            key={p.id}
                            className={`group relative flex flex-col items-start overflow-hidden rounded-lg border p-4 text-left transition-all ${
                                selected
                                    ? "bg-quartz-accent/[0.03] border-quartz-accent/30 shadow-[0_0_20px_var(--accent-glow)]"
                                    : "bg-quartz-bg/50 border-quartz-border hover:border-quartz-accent/20 hover:bg-quartz-accent/[0.02]"
                            }`}
                        >
                            <div className="flex w-full items-center justify-between mb-1">
                                <span className={`font-display text-xs font-semibold tracking-wide ${
                                    selected ? "text-quartz-accent" : "text-quartz-text/80"
                                }`}>
                                    {p.label}
                                </span>
                                {selected && (
                                    <span className="h-1.5 w-1.5 rounded-full bg-quartz-accent animate-pulse" />
                                )}
                            </div>
                            <span className="font-mono text-[10px] leading-relaxed text-quartz-muted group-hover:text-quartz-text/60 transition-colors">
                                {p.desc}
                            </span>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
