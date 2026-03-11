"use client";

import React, { useEffect, useState } from 'react';
import { Database, Zap, Activity, Globe, ShieldCheck } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_BACKEND || "";

export default function StatusIndicators() {
    const [apiStatus, setApiStatus] = useState<'success' | 'error' | 'neutral'>('neutral');
    const [dbStatus, setDbStatus] = useState<'success' | 'error' | 'neutral'>('neutral');
    const [latency, setLatency] = useState<number | null>(null);
    const [ibkrStatus, setIbkrStatus] = useState<'success' | 'error' | 'neutral'>('neutral');

    useEffect(() => {
        // Check backend health periodically
        const checkHealth = async () => {
            const start = Date.now();
            try {
                // Check full health endpoint
                const res = await fetch(`${API_URL}/health/full`, { 
                    method: 'GET',
                    signal: AbortSignal.timeout(5000)
                });
                const data = await res.json();
                
                setLatency(Date.now() - start);
                setApiStatus(data.status === 'ok' ? 'success' : 'error');
                setDbStatus(data.services?.database === 'online' ? 'success' : 'error');
                setIbkrStatus(data.services?.ibkr_gateway === 'online' ? 'success' : 'error');
            } catch (e) {
                setLatency(null);
                setApiStatus('error');
                setDbStatus('error');
                setIbkrStatus('error');
            }
        };

        checkHealth();
        const interval = setInterval(checkHealth, 10000);

        return () => {
            clearInterval(interval);
        };
    }, []);

    return (
        <div className="flex items-center gap-8 ml-auto select-none mr-4">
            {/* 1. IBKR Gateway (Mike/Bill) */}
            <StatusItem 
                icon={<Globe size={11} />} 
                label="Gateway" 
                value={ibkrStatus === 'success' ? "LIVE" : "OFFLINE"} 
                status={ibkrStatus === 'success' ? "success" : "error"} 
                owner="Mike"
            />

            {/* 2. TimescaleDB (Dipal) */}
            <StatusItem 
                icon={<Database size={11} />} 
                label="Data" 
                value={dbStatus === 'success' ? "ONLINE" : dbStatus === 'error' ? "ERROR" : "..."} 
                status={dbStatus} 
                owner="Dipal"
            />

            {/* 3. Strategy Engine (Richard/Felix) */}
            <StatusItem 
                icon={<Activity size={11} />} 
                label="Tactics" 
                value={apiStatus === 'success' ? "READY" : "IDLE"} 
                status={apiStatus === 'success' ? "success" : "warning"} 
                owner="Richard"
            />

            {/* 4. Latency (Jake) */}
            <StatusItem 
                icon={<Zap size={11} />} 
                label="Latency" 
                value={latency !== null ? `${latency}ms` : "N/A"} 
                status={latency !== null ? (latency < 100 ? "success" : latency < 300 ? "warning" : "error") : "neutral"} 
                owner="Jake"
            />

            {/* 5. Risk Guard (Bill) */}
            <StatusItem 
                icon={<ShieldCheck size={11} />} 
                label="Risk" 
                value="ACTIVE" 
                status="success" 
                owner="Bill"
            />
        </div>
    );
}

function StatusItem({ 
    icon, 
    label, 
    value, 
    status, 
    owner 
}: { 
    icon: React.ReactNode, 
    label: string, 
    value: string, 
    status: 'success' | 'warning' | 'error' | 'neutral',
    owner: string
}) {
    const statusDotColors = {
        success: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]',
        warning: 'bg-quartz-gold shadow-[0_0_8px_rgba(var(--accent-gold-rgb),0.4)]',
        error: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]',
        neutral: 'bg-quartz-muted'
    };

    const statusTextColors = {
        success: 'text-emerald-500/90',
        warning: 'text-quartz-gold/90',
        error: 'text-rose-500/90',
        neutral: 'text-quartz-muted'
    };

    return (
        <div className="flex items-center gap-3 group cursor-help relative no-drag">
            <div className="flex flex-col items-start">
                <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[var(--text-muted)] opacity-60 group-hover:opacity-100 transition-opacity">{icon}</span>
                    <span className="text-[8px] uppercase tracking-[0.15em] font-bold text-[var(--text-muted)] leading-none">{label}</span>
                </div>
                <div className="flex items-center gap-2 leading-none">
                    <div className={`w-1 h-1 rounded-full ${statusDotColors[status]} transition-all duration-500`} />
                    <span className={`text-[10px] font-mono font-bold tracking-tight ${statusTextColors[status]}`}>{value}</span>
                </div>
            </div>

            {/* Owner Tooltip - Refined */}
            <div className="absolute top-full right-0 mt-3 px-2 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded shadow-2xl opacity-0 group-hover:opacity-100 transition-all transform translate-y-[-4px] group-hover:translate-y-0 pointer-events-none z-[150] whitespace-nowrap">
                <div className="flex items-center gap-2">
                    <div className={`w-1 h-1 rounded-full ${statusDotColors[status]}`} />
                    <p className="text-[9px] text-[var(--text-muted)] font-mono">
                        System Owner: <span className="text-[var(--text-primary)] font-bold">{owner}</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
