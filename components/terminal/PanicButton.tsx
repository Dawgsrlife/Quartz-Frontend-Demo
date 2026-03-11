"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Power, X, Zap, RotateCcw } from "lucide-react";
import { apiFetch } from "@/lib/apiClient";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useTheme } from "@/components/providers/ThemeProvider";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface PanicModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

function PanicModal({ isOpen, onClose, onConfirm }: PanicModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const { theme } = useTheme();

    useGSAP(() => {
        if (isOpen) {
            gsap.to(overlayRef.current, {
                opacity: 1,
                duration: 0.4,
                ease: "power2.out"
            });
            gsap.fromTo(contentRef.current, 
                { scale: 0.9, opacity: 0, y: 20 },
                { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: "elastic.out(1, 0.8)", delay: 0.1 }
            );
        }
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            window.addEventListener("keydown", handleEscape);
        }
        return () => window.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="panic-title"
            aria-describedby="panic-desc"
        >
            <div 
                ref={overlayRef}
                className="absolute inset-0 bg-black/80 backdrop-blur-md opacity-0"
                onClick={onClose}
            />
            
            <div 
                ref={contentRef}
                className={cn(
                    "relative w-full max-w-md border border-rose-500/30 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(244,63,94,0.2)]",
                    theme === "dark" ? "bg-zinc-900" : "bg-white"
                )}
            >
                {/* Header Pattern */}
                <div className="absolute top-0 left-0 w-full h-1 bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]" />
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-rose-500/10 to-transparent pointer-events-none" />
                
                <div className="p-8 pt-10 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 mb-6">
                        <AlertTriangle className="w-8 h-8 text-rose-500 animate-pulse" />
                    </div>
                    
                    <h2 id="panic-title" className={cn(
                        "text-2xl font-black tracking-tighter mb-2 uppercase italic",
                        theme === "dark" ? "text-white" : "text-zinc-900"
                    )}>
                        Critical Halt Protocol
                    </h2>
                    <p id="panic-desc" className={cn(
                        "text-sm leading-relaxed mb-8 font-medium",
                        theme === "dark" ? "text-zinc-400" : "text-zinc-500"
                    )}>
                        This action will immediately liquidate all active positions and disconnect the execution engine. This is an irreversible institutional command.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={onClose}
                            className={cn(
                                "flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-widest transition-all border",
                                theme === "dark" 
                                    ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700 hover:border-zinc-600" 
                                    : "bg-zinc-100 hover:bg-zinc-200 text-zinc-600 border-zinc-200 hover:border-zinc-300"
                            )}
                        >
                            <X className="w-4 h-4" />
                            Abort
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-black text-xs uppercase tracking-[0.2em] transition-all shadow-[0_0_20px_rgba(244,63,94,0.3)] active:scale-95"
                        >
                            <Zap className="w-4 h-4 fill-current" />
                            Execute
                        </button>
                    </div>
                </div>
                
                <div className={cn(
                    "px-8 py-4 border-t border-rose-500/10 flex justify-between items-center",
                    theme === "dark" ? "bg-zinc-950/50" : "bg-zinc-50"
                )}>
                    <span className="text-[10px] font-mono text-rose-500 font-bold tracking-widest uppercase opacity-70">Emergency Override</span>
                    <span className={cn(
                        "text-[10px] font-mono opacity-40",
                        theme === "dark" ? "text-white" : "text-zinc-900"
                    )}>ID: QZ-HALT-001</span>
                </div>
            </div>
        </div>
    );
}



export function PanicButton() {
    const [isHolding, setIsHolding] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [panicked, setPanicked] = useState(false);
    const [isExecuting, setIsExecuting] = useState(false);
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const holdDuration = 1500; // 1.5 seconds hold
    const { theme } = useTheme();
    
    const startHolding = useCallback(() => {
        if (panicked || isModalOpen) return;
        setIsHolding(true);
        setProgress(0);
        
        const startTime = Date.now();
        progressIntervalRef.current = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const newProgress = Math.min((elapsed / holdDuration) * 100, 100);
            setProgress(newProgress);
            
            if (newProgress >= 100) {
                stopHolding();
                setIsModalOpen(true);
            }
        }, 16);
    }, [panicked, isModalOpen]);

    const stopHolding = useCallback(() => {
        setIsHolding(false);
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
        }
        if (progress < 100) setProgress(0);
    }, [progress]);

    const handleConfirmPanic = async () => {
        setIsExecuting(true);
        try {
            const data = await apiFetch("/api/orders/panic-button", {
                method: "POST",
                body: JSON.stringify({ reason: "Manual emergency halt" }),
            });
            console.warn("🚨 PANIC EXECUTED:", data);
        } catch (error) {
            console.error("Panic execution failed:", error);
            // Still halt client-side even if backend unreachable
        } finally {
            setPanicked(true);
            setIsExecuting(false);
            setIsModalOpen(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === " " || e.key === "Enter") {
            if (!isHolding) startHolding();
            e.preventDefault();
        }
    };

    const handleKeyUp = (e: React.KeyboardEvent) => {
        if (e.key === " " || e.key === "Enter") {
            stopHolding();
        }
    };

    if (panicked) {
        return (
            <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-2 px-4 py-1.5 bg-rose-500 text-white rounded-[4px] font-mono shadow-[0_0_20px_rgba(244,63,94,0.4)] border border-rose-400">
                    <Power className="w-3.5 h-3.5 animate-spin duration-700" />
                    <span className="text-[10px] font-black tracking-[0.2em]">SYSTEM_HALTED</span>
                </div>
                <button
                    onClick={() => setPanicked(false)}
                    title="Dismiss halt indicator"
                    className="flex items-center justify-center w-6 h-6 rounded hover:bg-rose-500/20 text-rose-400/60 hover:text-rose-400 transition-all"
                >
                    <RotateCcw className="w-3 h-3" />
                </button>
            </div>
        );
    }

    return (
        <>
            <button
                onMouseDown={startHolding}
                onMouseUp={stopHolding}
                onMouseLeave={stopHolding}
                onTouchStart={startHolding}
                onTouchEnd={stopHolding}
                onKeyDown={handleKeyDown}
                onKeyUp={handleKeyUp}
                aria-label="Hold to Trigger Emergency Stop"
                className={cn(
                    "relative group flex items-center gap-2.5 px-3 py-1.5 rounded-[4px] transition-all duration-300 overflow-hidden select-none outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50",
                    isHolding ? "bg-rose-500/20 scale-95" : "bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/40"
                )}
            >
                {/* Progress Background */}
                <div 
                    className="absolute inset-0 bg-rose-500/30 transition-none origin-left"
                    style={{ transform: `scaleX(${progress / 100})` }}
                />
                
                <div className="relative flex items-center gap-2.5 z-10">
                    <div className="relative">
                        <AlertTriangle className={cn(
                            "w-4 h-4 transition-all duration-300",
                            isHolding ? "text-rose-500 scale-110" : "text-rose-500/60 group-hover:text-rose-500"
                        )} />
                        {isHolding && (
                            <div className="absolute inset-0 animate-ping opacity-50 bg-rose-500 rounded-full scale-150" />
                        )}
                    </div>
                    <span className={cn(
                        "text-[10px] font-black tracking-[0.2em] uppercase transition-colors duration-300",
                        isHolding ? "text-white" : "text-rose-500/80 group-hover:text-rose-500"
                    )}>
                        {isHolding ? "HOLD..." : "PANIC"}
                    </span>
                </div>

                {/* Decorative glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-rose-500/0 via-rose-500/5 to-rose-500/0 pointer-events-none" />
            </button>

            {/* Portal: renders at document.body so it escapes any GSAP transform stacking context */}
            {typeof document !== "undefined" && createPortal(
                <PanicModal 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={handleConfirmPanic}
                />,
                document.body
            )}
        </>
    );
}

