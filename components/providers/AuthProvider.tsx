"use client";

/**
 * AuthProvider — client-side route guard for Quartz.
 *
 * Strategy:
 *  - Wait for `mounted` (client hydration of Zustand persist store).
 *  - If no token and on a protected route → redirect to /login.
 *  - If token exists and on /login → redirect to /dashboard.
 *  - Show a full-screen spinner during the hydration tick to prevent flash.
 */

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/authStore";

const PUBLIC_ROUTES = ["/login"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const token = useAuthStore((s) => s.token);
    const isPublic = PUBLIC_ROUTES.some((p) => pathname.startsWith(p));

    // Mark as mounted after first client render (localStorage is now accessible)
    useEffect(() => {
        setMounted(true);
    }, []);

    // Guard: redirect after hydration
    useEffect(() => {
        if (!mounted) return;
        if (!token && !isPublic) {
            router.replace("/login");
        }
        // Don't auto-redirect from /login → /dashboard here;
        // the login page handles that itself after successful auth.
    }, [mounted, token, isPublic, router]);

    // While hydrating, OR while redirecting an unauthenticated user, 
    // show a neutral loading screen to prevent flashing protected content.
    if (!isPublic && (!mounted || !token)) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-[var(--bg-primary)]">
                <div
                    className="w-8 h-8 rounded-full border-2 animate-spin"
                    style={{
                        borderColor: "var(--border-subtle)",
                        borderTopColor: "var(--accent)",
                    }}
                />
            </div>
        );
    }

    return <>{children}</>;
}
