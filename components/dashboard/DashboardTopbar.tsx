export function DashboardTopbar() {
    return (
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-quartz-border bg-quartz-bg/80 px-6 backdrop-blur-md">
            <div className="flex items-center gap-4">
                {/* Breadcrumbs or Title could go here */}
                <span className="text-sm font-medium text-quartz-text">Overview</span>
            </div>

            <div className="flex items-center gap-4">
                {/* Environment Toggle */}
                <div className="flex items-center rounded-full border border-quartz-border bg-quartz-panel p-1">
                    <button className="rounded-full bg-quartz-accent px-3 py-1 text-[10px] font-medium text-[var(--bg-primary)] shadow-sm">
                        Paper
                    </button>
                    <button className="px-3 py-1 text-[10px] font-medium text-quartz-muted hover:text-quartz-text">
                        Live
                    </button>
                </div>

                {/* Connection Status */}
                <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                    <span className="text-[10px] font-medium text-emerald-500">Connected</span>
                </div>

                {/* User Menu */}
                <div className="h-8 w-8 rounded-full bg-quartz-panel border border-quartz-border" />
            </div>
        </header>
    );
}
