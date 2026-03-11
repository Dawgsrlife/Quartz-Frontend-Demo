"use client";

import React, { useRef } from "react";
import { 
    User, 
    Bell, 
    Shield, 
    Monitor, 
    Key, 
    Smartphone,
    CreditCard,
    Cpu,
    Volume2,
    Globe
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useTheme } from "@/components/providers/ThemeProvider";

interface SettingsSectionProps {
    title: string;
    description: string;
    children: React.ReactNode;
}

function SettingsSection({ title, description, children }: SettingsSectionProps) {
    return (
        <section className="settings-section space-y-6">
            <div className="space-y-1 border-b border-quartz-border pb-4">
                <h2 className="font-display text-lg font-bold text-quartz-text tracking-tight">{title}</h2>
                <p className="font-mono text-[10px] text-quartz-muted uppercase tracking-widest">{description}</p>
            </div>
            <div className="grid gap-4">
                {children}
            </div>
        </section>
    );
}

interface SettingItemProps {
    icon: React.ElementType;
    title: string;
    description: string;
    action: React.ReactNode;
}

function SettingItem({ icon: Icon, title, description, action }: SettingItemProps) {
    return (
        <div className="flex items-center justify-between rounded-xl border border-quartz-border bg-quartz-panel p-5 transition-colors hover:bg-quartz-accent/[0.02]">
            <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-quartz-bg border border-quartz-border text-quartz-muted">
                    <Icon size={20} />
                </div>
                <div className="space-y-0.5">
                    <h3 className="text-sm font-medium text-quartz-text">{title}</h3>
                    <p className="text-xs text-quartz-muted">{description}</p>
                </div>
            </div>
            <div>{action}</div>
        </div>
    );
}

export default function SettingsPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const { theme, toggleTheme } = useTheme();

    useGSAP(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 0.8 } });
        
        tl.from(headerRef.current, { y: -20, opacity: 0, clearProps: "all" })
          .from(".settings-section", { 
            y: 20, 
            opacity: 0, 
            stagger: 0.15,
            ease: "power2.out",
            clearProps: "all"
          }, "-=0.4");
    }, { scope: containerRef });

    return (
        <div ref={containerRef} className="p-8 lg:p-12 overflow-y-auto h-full scrollbar-thin bg-quartz-bg">
            <div className="mx-auto max-w-4xl space-y-12 pb-20">
                {/* Header Section */}
                <header ref={headerRef} className="flex items-end justify-between border-b border-quartz-border pb-8">
                    <div className="space-y-1">
                        <h1 className="font-display text-2xl font-bold tracking-tight text-quartz-text">
                            Settings
                        </h1>
                        <p className="font-mono text-xs text-quartz-muted uppercase tracking-widest">
                            System configuration
                        </p>
                    </div>
                </header>

                <div className="space-y-12">
                    {/* Account Section */}
                    <SettingsSection 
                        title="Profile" 
                        description="Personal identity and authentication"
                    >
                        <SettingItem 
                            icon={User}
                            title="Account Identifier"
                            description="ID: QZ-ADMIN-ROOT"
                            action={<button className="text-xs font-bold uppercase tracking-widest text-quartz-accent hover:opacity-80 transition-opacity">Copy</button>}
                        />
                        <SettingItem 
                            icon={Shield}
                            title="Security"
                            description="Two-factor authentication and session management"
                            action={<button className="rounded-lg bg-quartz-bg border border-quartz-border px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-quartz-text hover:bg-quartz-accent/[0.05] transition-colors">Configure</button>}
                        />
                    </SettingsSection>

                    {/* Interface Section */}
                    <SettingsSection 
                        title="Interface" 
                        description="Visual and sensory preferences"
                    >
                        <SettingItem 
                            icon={Monitor}
                            title="Visual Theme"
                            description="Switch between Rose (Light) and Gold (Dark) aesthetics"
                            action={
                                <div className="flex gap-1 rounded-lg bg-quartz-bg p-1 border border-quartz-border">
                                    <button 
                                        onClick={() => theme === "light" && toggleTheme()}
                                        className={`rounded-md px-3 py-1 text-[10px] font-bold uppercase tracking-widest transition-all ${
                                            theme === "dark" 
                                            ? "bg-quartz-accent text-[var(--bg-primary)] shadow-sm" 
                                            : "text-quartz-muted hover:text-quartz-text"
                                        }`}
                                    >
                                        Dark
                                    </button>
                                    <button 
                                        onClick={() => theme === "dark" && toggleTheme()}
                                        className={`rounded-md px-3 py-1 text-[10px] font-bold uppercase tracking-widest transition-all ${
                                            theme === "light" 
                                            ? "bg-quartz-accent text-[var(--bg-primary)] shadow-sm" 
                                            : "text-quartz-muted hover:text-quartz-text"
                                        }`}
                                    >
                                        Light
                                    </button>
                                </div>
                            }
                        />
                        <SettingItem 
                            icon={Volume2}
                            title="Audio Feedback"
                            description="Audible signals for execution and alerts"
                            action={
                                <div className="h-5 w-10 rounded-full bg-quartz-accent relative cursor-pointer">
                                    <div className="absolute right-1 top-1 h-3 w-3 rounded-full bg-[var(--bg-primary)] shadow-sm" />
                                </div>
                            }
                        />
                    </SettingsSection>

                    {/* Connectivity Section */}
                    <SettingsSection 
                        title="Connectivity" 
                        description="External data and execution bridges"
                    >
                        <SettingItem 
                            icon={Key}
                            title="API Gateway"
                            description="Manage keys for market data providers"
                            action={<button className="text-xs font-bold uppercase tracking-widest text-quartz-accent hover:opacity-80">Manage Keys</button>}
                        />
                        <SettingItem 
                            icon={Globe}
                            title="Network Region"
                            description="Current node: US-EAST-1 (Latency: 14ms)"
                            action={<span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Optimal</span>}
                        />
                    </SettingsSection>

                    {/* System Section */}
                    <SettingsSection 
                        title="Advanced" 
                        description="Hardware and system performance"
                    >
                        <SettingItem 
                            icon={Cpu}
                            title="Engine Priority"
                            description="Resource allocation for strategy processing"
                            action={
                                <select className="bg-transparent text-[10px] font-bold uppercase tracking-widest text-quartz-text outline-none cursor-pointer">
                                    <option className="bg-quartz-panel">Standard</option>
                                    <option className="bg-quartz-panel">High</option>
                                    <option className="bg-quartz-panel">Real-time</option>
                                </select>
                            }
                        />
                    </SettingsSection>

                    <div className="pt-10 border-t border-quartz-border flex justify-between items-center">
                        <div className="space-y-1">
                            <p className="font-mono text-[9px] text-quartz-muted uppercase tracking-[0.2em]">Build Version</p>
                            <p className="font-mono text-[10px] text-quartz-muted font-bold">QZ-2026.1.22-ALPHA</p>
                        </div>
                        <button className="rounded-lg bg-quartz-accent px-8 py-3 text-xs font-bold uppercase tracking-widest text-[var(--bg-primary)] hover:opacity-90 transition-all shadow-[0_0_20px_var(--accent-glow)]">
                            Save changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
