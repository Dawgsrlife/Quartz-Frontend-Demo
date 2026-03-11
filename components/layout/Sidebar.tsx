"use client";

import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutGrid,
    Activity,
    BarChart3,
    Zap,
    BookOpen,
    Settings,
    ChevronLeft,
    ChevronRight,
    LogOut,
    TrendingUp
} from "lucide-react";
import { useUIStore } from "@/lib/store";
import { useAuthStore } from "@/lib/authStore";
import { QuartzLogo } from "./QuartzLogo";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface NavItemProps {
    href: string;
    icon: React.ReactNode;
    label: string;
    collapsed: boolean;
}

function NavItem({ href, icon, label, collapsed }: NavItemProps) {
    const pathname = usePathname();
    const active = pathname === href || (href === "/" && pathname === "");
    const itemRef = useRef<HTMLAnchorElement>(null);

    // Clear GSAP inline styles whenever active changes so Tailwind classes take over
    useEffect(() => {
        if (!itemRef.current) return;
        const bg = itemRef.current.querySelector(".nav-icon-bg");
        const indicator = itemRef.current.querySelector(".active-indicator");
        if (bg) gsap.set(bg, { clearProps: "backgroundColor,scale" });
        if (indicator) gsap.set(indicator, { clearProps: "height,opacity" });
    }, [active]);

    const handleMouseEnter = () => {
        if (!itemRef.current) return;
        const bg = itemRef.current.querySelector(".nav-icon-bg");
        const indicator = itemRef.current.querySelector(".active-indicator");

        if (bg) {
            gsap.to(bg, {
                scale: 1.02,
                backgroundColor: active ? "var(--accent)" : "rgba(var(--accent-rgb), 0.1)",
                duration: 0.3,
                ease: "power2.out"
            });
        }
        if (indicator) {
            gsap.to(indicator, {
                height: active ? "32px" : "12px",
                opacity: 1,
                duration: 0.3,
                ease: "power2.out"
            });
        }
    };

    const handleMouseLeave = () => {
        if (!itemRef.current) return;
        const bg = itemRef.current.querySelector(".nav-icon-bg");
        const indicator = itemRef.current.querySelector(".active-indicator");

        if (bg) {
            gsap.to(bg, {
                scale: 1,
                backgroundColor: active ? "var(--accent)" : "transparent",
                duration: 0.3,
                ease: "power2.out"
            });
        }
        if (indicator) {
            gsap.to(indicator, {
                height: active ? "24px" : "0px",
                opacity: active ? 1 : 0,
                duration: 0.3,
                ease: "power2.out"
            });
        }
    };

    return (
        <Link
            ref={itemRef}
            href={href}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`group relative flex items-center justify-center w-full h-16 transition-opacity duration-300 ${collapsed ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        >
            {/* Active Indicator Bar */}
            <div
                className={`active-indicator absolute left-0 w-1 bg-[var(--accent)] rounded-r-full transition-all duration-300 shadow-[0_0_12px_var(--accent)] ${active ? "h-6 opacity-100" : "h-0 opacity-0"
                    }`}
            />

            <div
                className={`nav-icon-bg w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${active
                        ? "bg-[var(--accent)] text-white shadow-[0_0_25px_var(--accent-glow)] ring-1 ring-[var(--accent)]/30"
                        : "text-[var(--text-primary)] opacity-40 group-hover:opacity-100"
                    }`}
            >
                {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 20, strokeWidth: active ? 2.5 : 2 }) : icon}
            </div>

            {/* Tooltip */}
            {/* Bridge div: pl-4 keeps hitbox continuous */}
            <div className="absolute top-1/2 -translate-y-1/2 left-full pl-4 h-full pointer-events-none group-hover:pointer-events-auto flex items-center">
                <div className="px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-[10px] font-black uppercase tracking-[0.25em] rounded-xl opacity-0 group-hover:opacity-100 transition-all -translate-x-3 group-hover:translate-x-0 shadow-2xl backdrop-blur-2xl whitespace-nowrap">
                    {label}
                </div>
            </div>
        </Link>
    );
}

function UserAvatar({ collapsed }: { collapsed: boolean }) {
    const avatarRef  = useRef<HTMLDivElement>(null);
    const panelRef   = useRef<HTMLDivElement>(null);
    const router     = useRouter();
    const { user, logout } = useAuthStore();
    const [open, setOpen] = useState(false);

    const initials = user?.name
        ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        : "OP";

    const handleLogout = async () => {
        await logout();
        router.replace("/login");
    };

    // Close panel when clicking outside
    useEffect(() => {
        if (!open) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (
                avatarRef.current && !avatarRef.current.contains(e.target as Node) &&
                panelRef.current && !panelRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    return (
        <div
            className={`relative flex items-center justify-center w-full h-16 transition-opacity duration-300 ${collapsed ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        >
            {/* Avatar badge */}
            <div ref={avatarRef} className="relative">
                <div
                    onClick={() => setOpen((v) => !v)}
                    className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[var(--up)]/5 border border-[var(--up)]/15 text-[var(--up)] hover:bg-[var(--up)]/15 transition-all duration-300 cursor-pointer ring-1 ring-[var(--up)]/5 font-black text-[13px] font-mono select-none"
                >
                    {initials}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[var(--bg-secondary)] shadow-sm" />
            </div>

            {/* Popout panel — click-toggled, click-outside to close */}
            {open && (
                <div
                    ref={panelRef}
                    className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-5 py-4 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl z-50 shadow-2xl backdrop-blur-2xl min-w-[230px]"
                >
                    <div className="flex flex-col gap-1.5">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--accent)] opacity-75">Operator</span>
                        <span className="text-[13px] tracking-tight font-black text-[var(--text-primary)] truncate">
                            {user?.name || "Quartz Operator"}
                        </span>
                        {user?.email && (
                            <span className="text-[11px] font-mono text-[var(--text-muted)] truncate">{user.email}</span>
                        )}
                        <div className="h-px bg-[var(--border-subtle)] my-1.5" />
                        <div className="flex items-center gap-2 text-emerald-500/90 text-[9px] font-black uppercase tracking-widest">
                            <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse shadow-[0_0_6px_currentColor]" />
                            Secure Session Active
                        </div>
                        <button
                            onClick={handleLogout}
                            className="mt-2 w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:border-rose-500/40 hover:text-rose-400 transition-all duration-200"
                        >
                            <LogOut size={11} />
                            Log Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function GroupSeparator({ collapsed }: { collapsed: boolean }) {
    return (
        <div className={`w-8 h-[1px] bg-[var(--border-subtle)]/30 my-2 self-center transition-all duration-300 ${collapsed ? "opacity-0" : "opacity-100"}`} />
    );
}

export function Sidebar() {
    const { sidebarCollapsed, toggleSidebar } = useUIStore();
    const sidebarRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        gsap.to(sidebarRef.current, {
            width: sidebarCollapsed ? 0 : 84,
            borderRightWidth: sidebarCollapsed ? 0 : 1,
            paddingLeft: sidebarCollapsed ? 0 : 18,
            paddingRight: sidebarCollapsed ? 0 : 18,
            duration: 0.6,
            ease: "expo.inOut"
        });
    }, [sidebarCollapsed]);

    useGSAP(() => {
        const tl = gsap.timeline();
        tl.from(".nav-item-container > *", {
            x: -20,
            opacity: 0,
            stagger: 0.05,
            duration: 0.8,
            ease: "power4.out",
            clearProps: "all"
        });
    }, { scope: containerRef });

    return (
        <aside
            ref={sidebarRef}
            className="border-r border-[var(--border-subtle)] flex flex-col items-center py-6 bg-[var(--bg-secondary)] z-[100] shrink-0 relative group/sidebar overflow-visible shadow-[8px_0_32px_rgba(0,0,0,0.15)]"
            style={{ width: sidebarCollapsed ? 0 : 84, paddingLeft: sidebarCollapsed ? 0 : 18, paddingRight: sidebarCollapsed ? 0 : 18 }}
        >
            {/* Sidebar toggle tab — always visible, positioned on the right edge regardless of collapsed state */}
            <button
                onClick={toggleSidebar}
                aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                className="absolute top-1/2 -translate-y-1/2 -right-[13px] z-50 w-[13px] h-10 flex items-center justify-center bg-[var(--bg-secondary)] border border-l-0 border-[var(--border-subtle)] rounded-r-lg hover:border-[var(--accent)] hover:bg-[var(--accent)]/10 transition-all duration-200 shadow-md"
            >
                {sidebarCollapsed
                    ? <ChevronRight size={9} className="text-[var(--accent)]" />
                    : <ChevronLeft size={9} className="text-[var(--accent)]" />
                }
            </button>

            <div ref={containerRef} className="flex flex-col items-center w-full h-full nav-item-container relative z-10">
                {/* Logo Section */}
                <div className={`mb-12 transition-all duration-500 ${sidebarCollapsed ? "opacity-0 scale-50" : "opacity-100 scale-100"}`}>
                    <QuartzLogo />
                </div>

                {/* Navigation Items */}
                <div className="flex flex-col items-center w-full gap-2.5">
                    <NavItem href="/" icon={<Activity />} label="Terminal" collapsed={sidebarCollapsed} />

                    <GroupSeparator collapsed={sidebarCollapsed} />

                    <NavItem href="/dashboard" icon={<LayoutGrid />} label="Dashboard" collapsed={sidebarCollapsed} />
                    <NavItem href="/markets" icon={<BarChart3 />} label="Markets" collapsed={sidebarCollapsed} />

                    <GroupSeparator collapsed={sidebarCollapsed} />

                    <NavItem href="/strategies" icon={<Zap />} label="Strategies" collapsed={sidebarCollapsed} />
                    <NavItem href="/backtest" icon={<BookOpen />} label="Backtest" collapsed={sidebarCollapsed} />
                </div>

                <div className="flex-1" />

                {/* Footer Section */}
                <div className="flex flex-col items-center w-full gap-4 pb-8">
                    <div className={`text-[9px] font-black tracking-[0.45em] text-[var(--text-muted)] mb-1 uppercase transition-all duration-300 ${sidebarCollapsed ? "opacity-0" : "opacity-30"}`}>System</div>
                    <NavItem href="/settings" icon={<Settings />} label="Settings" collapsed={sidebarCollapsed} />
                    <UserAvatar collapsed={sidebarCollapsed} />
                </div>
            </div>
        </aside>
    );
}
