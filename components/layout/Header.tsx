"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
    const pathname = usePathname();
    const isDashboard = pathname === "/dashboard";

    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-quartz-border bg-quartz-bg/50 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
                <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-quartz-accent" />
                    <span className="font-semibold tracking-tight text-quartz-text">Quartz</span>
                </div>

                <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-quartz-muted">
                    <a href="#architecture" className="hover:text-quartz-text transition-colors">Architecture</a>
                    <a href="#strategies" className="hover:text-quartz-text transition-colors">Strategies</a>
                    <a href="#docs" className="hover:text-quartz-text transition-colors">Docs</a>
                </nav>

                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard"
                        className="rounded-full bg-quartz-accent px-4 py-1.5 text-xs font-medium text-[var(--bg-primary)] transition hover:opacity-90 shadow-[0_0_15px_var(--accent-glow)]"
                    >
                        Launch App
                    </Link>
                </div>
            </div>
        </header>
    );
}
