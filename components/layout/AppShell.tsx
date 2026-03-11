"use client";

import React, { useRef } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "@/components/terminal/TopBar";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { AlertTriangle } from "lucide-react";

function DemoBanner() {
    return (
        <div
            className="flex items-center justify-center gap-2 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.25em] select-none shrink-0"
            style={{
                background: "linear-gradient(90deg, #d97706 0%, #f59e0b 50%, #d97706 100%)",
                color: "#1a1a1a",
            }}
        >
            <AlertTriangle size={12} strokeWidth={3} />
            <span>Demo Mode — All data is simulated &bull; No backend connection</span>
            <AlertTriangle size={12} strokeWidth={3} />
        </div>
    );
}

export function AppShell({ children }: { children: React.ReactNode }) {
    const mainRef = useRef<HTMLElement>(null);
    const pathname = usePathname();
    const isLoginPage = pathname === "/login";

    useGSAP(() => {
        gsap.from(mainRef.current, {
            opacity: 0,
            duration: 0.8,
            ease: "power2.out",
            clearProps: "all"
        });
    }, [children]);

    if (isLoginPage) {
        return (
            <div className="h-screen overflow-hidden flex flex-col">
                <DemoBanner />
                <div className="flex-1 overflow-hidden">{children}</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans selection:bg-[var(--accent)] selection:text-white">
            <DemoBanner />
            <TopBar />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main ref={mainRef} className="flex-1 relative overflow-hidden bg-[var(--bg-primary)]">
                    {children}
                </main>
            </div>
        </div>
    );
}
