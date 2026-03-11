"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Activity, Database, Radio, Server, Wifi, WifiOff, RefreshCw } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_BACKEND || "";
const MARKET_DATA_WS = process.env.NEXT_PUBLIC_MARKET_DATA_WS;
const SIGNAL_WS = process.env.NEXT_PUBLIC_SIGNAL_WS;

interface ServiceStatus {
    name: string;
    status: "online" | "offline" | "checking";
    latency?: number;
    lastChecked: Date | null;
    icon: React.ReactNode;
}

export default function HealthPage() {
    const [services, setServices] = useState<ServiceStatus[]>([
        { name: "Backend API", status: "checking", lastChecked: null, icon: <Server className="w-5 h-5" /> },
        { name: "Market Data WS", status: "checking", lastChecked: null, icon: <Radio className="w-5 h-5" /> },
        { name: "Strategy Signals WS", status: "checking", lastChecked: null, icon: <Activity className="w-5 h-5" /> },
        { name: "Database", status: "checking", lastChecked: null, icon: <Database className="w-5 h-5" /> },
    ]);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const checkHealth = useCallback(async () => {
        setIsRefreshing(true);
        const newServices = [...services];

        // Check Backend API
        try {
            const start = Date.now();
            const res = await fetch(`${API_URL}/health`, { method: "GET" });
            const latency = Date.now() - start;
            if (res.ok) {
                newServices[0] = { ...newServices[0], status: "online", latency, lastChecked: new Date() };
            } else {
                newServices[0] = { ...newServices[0], status: "offline", lastChecked: new Date() };
            }
        } catch {
            newServices[0] = { ...newServices[0], status: "offline", lastChecked: new Date() };
        }

        // Check Market Data WebSocket
        if (MARKET_DATA_WS) {
            try {
                const start = Date.now();
                const ws = new WebSocket(MARKET_DATA_WS);
                await new Promise<void>((resolve, reject) => {
                    ws.onopen = () => {
                        const latency = Date.now() - start;
                        newServices[1] = { ...newServices[1], status: "online", latency, lastChecked: new Date() };
                        ws.close();
                        resolve();
                    };
                    ws.onerror = () => {
                        newServices[1] = { ...newServices[1], status: "offline", lastChecked: new Date() };
                        reject();
                    };
                    setTimeout(() => {
                        newServices[1] = { ...newServices[1], status: "offline", lastChecked: new Date() };
                        ws.close();
                        resolve();
                    }, 5000);
                });
            } catch {
                newServices[1] = { ...newServices[1], status: "offline", lastChecked: new Date() };
            }
        } else {
            newServices[1] = { ...newServices[1], status: "offline", lastChecked: new Date() };
        }

        // Check Strategy Signals WebSocket
        if (SIGNAL_WS) {
            try {
                const start = Date.now();
                const ws = new WebSocket(SIGNAL_WS);
                await new Promise<void>((resolve, reject) => {
                    ws.onopen = () => {
                        const latency = Date.now() - start;
                        newServices[2] = { ...newServices[2], status: "online", latency, lastChecked: new Date() };
                        ws.close();
                        resolve();
                    };
                    ws.onerror = () => {
                        newServices[2] = { ...newServices[2], status: "offline", lastChecked: new Date() };
                        reject();
                    };
                    setTimeout(() => {
                        newServices[2] = { ...newServices[2], status: "offline", lastChecked: new Date() };
                        ws.close();
                        resolve();
                    }, 5000);
                });
            } catch {
                newServices[2] = { ...newServices[2], status: "offline", lastChecked: new Date() };
            }
        } else {
            newServices[2] = { ...newServices[2], status: "offline", lastChecked: new Date() };
        }

        // Database status - inferred from backend health
        newServices[3] = {
            ...newServices[3],
            status: newServices[0].status === "online" ? "online" : "offline",
            lastChecked: new Date()
        };

        setServices(newServices);
        setIsRefreshing(false);
    }, [services]);

    useEffect(() => {
        checkHealth();
        const interval = setInterval(checkHealth, 30000); // Check every 30s
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onlineCount = services.filter(s => s.status === "online").length;
    const allOnline = onlineCount === services.length;

    return (
        <div className="p-8 lg:p-12 overflow-y-auto h-full bg-quartz-bg">
            <div className="mx-auto max-w-3xl space-y-8">
                {/* Header */}
                <header className="border-b border-quartz-border pb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`h-3 w-3 rounded-full ${allOnline ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                        <span className="font-mono text-[10px] text-quartz-muted uppercase tracking-[0.3em]">
                            System Health Monitor
                        </span>
                    </div>
                    <h1 className="font-display text-3xl font-bold tracking-tight text-quartz-text uppercase">
                        Service Status
                    </h1>
                    <p className="font-mono text-xs text-quartz-muted mt-2">
                        {onlineCount}/{services.length} services operational
                    </p>
                </header>

                {/* Refresh Button */}
                <div className="flex justify-end">
                    <button
                        onClick={checkHealth}
                        disabled={isRefreshing}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-quartz-bg-secondary border border-quartz-border hover:border-quartz-accent transition-colors text-xs font-mono text-quartz-muted hover:text-quartz-text disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                </div>

                {/* Services Grid */}
                <div className="grid gap-4">
                    {services.map((service) => (
                        <div
                            key={service.name}
                            className="flex items-center justify-between p-6 rounded-xl border border-quartz-border bg-quartz-bg-secondary/50"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-lg ${
                                    service.status === "online" 
                                        ? "bg-emerald-500/10 text-emerald-500" 
                                        : service.status === "checking"
                                        ? "bg-amber-500/10 text-amber-500"
                                        : "bg-rose-500/10 text-rose-500"
                                }`}>
                                    {service.icon}
                                </div>
                                <div>
                                    <h3 className="font-bold text-quartz-text">{service.name}</h3>
                                    <p className="text-xs text-quartz-muted font-mono">
                                        {service.lastChecked 
                                            ? `Last checked: ${service.lastChecked.toLocaleTimeString()}`
                                            : "Checking..."
                                        }
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                {service.latency && (
                                    <span className="text-xs font-mono text-quartz-muted">
                                        {service.latency}ms
                                    </span>
                                )}
                                <div className="flex items-center gap-2">
                                    {service.status === "online" ? (
                                        <Wifi className="w-4 h-4 text-emerald-500" />
                                    ) : service.status === "checking" ? (
                                        <RefreshCw className="w-4 h-4 text-amber-500 animate-spin" />
                                    ) : (
                                        <WifiOff className="w-4 h-4 text-rose-500" />
                                    )}
                                    <span className={`text-xs font-bold uppercase tracking-widest ${
                                        service.status === "online" 
                                            ? "text-emerald-500" 
                                            : service.status === "checking"
                                            ? "text-amber-500"
                                            : "text-rose-500"
                                    }`}>
                                        {service.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* System Info */}
                <div className="p-6 rounded-xl border border-quartz-border bg-quartz-bg-secondary/30">
                    <h3 className="font-bold text-quartz-text mb-4 text-sm uppercase tracking-widest">Environment</h3>
                    <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                        <div>
                            <span className="text-quartz-muted">API Endpoint:</span>
                            <p className="text-quartz-text truncate">{API_URL}</p>
                        </div>
                        <div>
                            <span className="text-quartz-muted">Market Data WS:</span>
                            <p className="text-quartz-text truncate">{MARKET_DATA_WS || "Not configured"}</p>
                        </div>
                        <div>
                            <span className="text-quartz-muted">Signal WS:</span>
                            <p className="text-quartz-text truncate">{SIGNAL_WS || "Not configured"}</p>
                        </div>
                        <div>
                            <span className="text-quartz-muted">Build Time:</span>
                            <p className="text-quartz-text">{new Date().toISOString()}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
