"use client";

/**
 * Installer page — initial setup wizard for Quartz Desktop (Electron/Tauri).
 * On the web build this simply redirects to /dashboard.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function InstallerPage() {
    const router = useRouter();

    useEffect(() => {
        // In the browser / static export, skip the installer and go to dashboard
        router.replace("/dashboard");
    }, [router]);

    return (
        <div className="flex h-screen w-screen items-center justify-center bg-quartz-bg">
            <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-8 h-8 border-2 border-quartz-accent border-t-transparent rounded-full animate-spin" />
                <p className="font-mono text-[10px] text-quartz-muted uppercase tracking-[0.3em]">
                    Initializing Quartz…
                </p>
            </div>
        </div>
    );
}
