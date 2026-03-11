"use client";

type Tone = "rose" | "gold" | "neutral";

export function MetricCard({
    label,
    value,
    sub,
    subTone = "neutral",
}: {
    label: string;
    value: string;
    sub?: string;
    subTone?: Tone;
}) {
    const toneMap: Record<Tone, string> = {
        rose: "text-quartz-up/90",
        gold: "text-quartz-gold/90",
        neutral: "text-quartz-muted",
    };

    return (
        <section className="group relative flex flex-col justify-between h-full p-8 transition-all hover:bg-white/[0.02]">
            <div className="flex flex-col gap-1.5">
                <p className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-quartz-muted">
                    {label}
                </p>
                <p className="font-display text-3xl font-bold tracking-tight text-quartz-text">
                    {value}
                </p>
            </div>
            
            {sub && (
                <div className="mt-8 flex items-center gap-2">
                    <span className={`font-mono text-[9px] font-bold uppercase tracking-[0.15em] ${toneMap[subTone]}`}>
                        {sub}
                    </span>
                    <div className="h-[1px] flex-1 bg-quartz-border/30" />
                </div>
            )}

            {/* Subtle corner accent */}
            <div className="absolute right-0 top-0 h-16 w-16 bg-gradient-to-bl from-quartz-accent/[0.03] to-transparent pointer-events-none" />
        </section>
    );
}
