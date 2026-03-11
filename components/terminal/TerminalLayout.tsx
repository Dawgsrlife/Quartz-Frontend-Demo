"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { CandleChart } from "./CandleChart";
import { OrderEntry } from "./OrderEntry";
import { OrderBook } from "./OrderBook";
import { TradeHistory } from "./TradeHistory";
import { Positions } from "./Positions";
import { OrdersHistory } from "./OrdersHistory";
import StrategyPanel from "./StrategyPanel";
import { ChevronRight, ChevronLeft } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useUIStore } from "@/lib/store";
import { startStrategySignalWebSocket } from "@/lib/StrategyClient";
import { startMarketDataWebSocket, stopMarketDataWebSocket } from "@/lib/MarketDataClient";

type BottomPanelTab = 'positions' | 'history';

export function TerminalLayout() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const rightSidebarRef = useRef<HTMLElement>(null);
  const bottomPanelRef = useRef<HTMLDivElement>(null);
  const strategyContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingHeightRef = useRef(false);
  const isDraggingWidthRef = useRef(false);
  const startYRef = useRef(0);
  const startXRef = useRef(0);
  const startHeightRef = useRef(0);
  const startWidthRef = useRef(0);
  
  const [bottomPanelTab, setBottomPanelTab] = useState<BottomPanelTab>('positions');

  const {
    positionsCollapsed,
    strategyPanelCollapsed,
    toggleBottomPanel,
    bottomPanelCollapsed,
    bottomPanelHeight,
    setBottomPanelHeight,
    strategyPanelWidth,
    setStrategyPanelWidth,
    rightSidebarCollapsed,
    toggleRightSidebar
  } = useUIStore();

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 0.8 } });

    tl.from(rightSidebarRef.current, { x: 50, opacity: 0, clearProps: "all" })
      .from(mainRef.current, { y: 20, opacity: 0, clearProps: "all" }, "-=0.6")
      .from(".terminal-panel", { scale: 0.98, opacity: 0, stagger: 0.1, clearProps: "all" }, "-=0.4");
  }, { scope: containerRef });

  // Animate right sidebar width
  useGSAP(() => {
    if (!rightSidebarRef.current) return;

    gsap.to(rightSidebarRef.current, {
      width: rightSidebarCollapsed ? 0 : 340, // w-85 is 340px
      borderLeftWidth: rightSidebarCollapsed ? 0 : 1,
      duration: 0.6,
      ease: "expo.inOut"
    });
  }, [rightSidebarCollapsed]);

  // Animate bottom panel height
  useGSAP(() => {
    if (!bottomPanelRef.current || isDraggingHeightRef.current) return;

    // When collapsed, show just the toggle bar (20px) which is positioned above the panel now, so height can be 0.
    const targetHeight = bottomPanelCollapsed ? 0 : bottomPanelHeight;

    gsap.to(bottomPanelRef.current, {
      height: targetHeight,
      duration: 0.5,
      ease: "power4.inOut"
    });
  }, [bottomPanelCollapsed, bottomPanelHeight]);

  // Handle Height Resizing
  const DEFAULT_BOTTOM_HEIGHT = 320;

  const handleHeightMouseDown = useCallback((e: React.MouseEvent) => {
    if (bottomPanelCollapsed) return;
    isDraggingHeightRef.current = true;
    startYRef.current = e.clientY;
    startHeightRef.current = bottomPanelRef.current?.offsetHeight || bottomPanelHeight;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  }, [bottomPanelCollapsed, bottomPanelHeight]);

  const handleSnapToDefault = useCallback(() => {
    setBottomPanelHeight(DEFAULT_BOTTOM_HEIGHT);
    if (bottomPanelRef.current) {
      gsap.to(bottomPanelRef.current, {
        height: DEFAULT_BOTTOM_HEIGHT,
        duration: 0.6,
        ease: "power4.out"
      });
    }
  }, [setBottomPanelHeight]);

  // Handle Width Resizing
  const DEFAULT_STRATEGY_WIDTH = 320;

  const handleWidthMouseDown = useCallback((e: React.MouseEvent) => {
    if (strategyPanelCollapsed) return;
    isDraggingWidthRef.current = true;
    startXRef.current = e.clientX;
    startWidthRef.current = strategyContainerRef.current?.offsetWidth || strategyPanelWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [strategyPanelCollapsed, strategyPanelWidth]);

  const handleWidthSnapToDefault = useCallback(() => {
    setStrategyPanelWidth(DEFAULT_STRATEGY_WIDTH);
    if (strategyContainerRef.current) {
      gsap.to(strategyContainerRef.current, {
        width: DEFAULT_STRATEGY_WIDTH,
        duration: 0.6,
        ease: "power4.out"
      });
    }
  }, [setStrategyPanelWidth]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingHeightRef.current) {
        const deltaY = startYRef.current - e.clientY;
        // Constrain height: min 240px, max (viewport - 320px) to prevent chart squishing
        const newHeight = Math.max(240, Math.min(window.innerHeight - 320, startHeightRef.current + deltaY));
        if (bottomPanelRef.current) {
          gsap.set(bottomPanelRef.current, { height: newHeight });
        }
      } else if (isDraggingWidthRef.current) {
        const deltaX = startXRef.current - e.clientX;
        // Constrain width: min 200px, max 800px
        const newWidth = Math.max(200, Math.min(800, startWidthRef.current + deltaX));
        if (strategyContainerRef.current) {
          gsap.set(strategyContainerRef.current, { width: newWidth });
        }
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (isDraggingHeightRef.current) {
        isDraggingHeightRef.current = false;
        if (bottomPanelRef.current) {
          setBottomPanelHeight(bottomPanelRef.current.offsetHeight);
        }
      }
      if (isDraggingWidthRef.current) {
        isDraggingWidthRef.current = false;
        if (strategyContainerRef.current) {
          setStrategyPanelWidth(strategyContainerRef.current.offsetWidth);
        }
      }
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [setBottomPanelHeight, setStrategyPanelWidth]);

  useEffect(() => {
    startStrategySignalWebSocket();
    startMarketDataWebSocket();
    return () => {
      stopMarketDataWebSocket();
    }
  }, []);

  // Animate strategy panel width
  useGSAP(() => {
    if (!strategyContainerRef.current || isDraggingWidthRef.current) return;

    gsap.to(strategyContainerRef.current, {
      width: strategyPanelCollapsed ? 48 : strategyPanelWidth,
      duration: 0.5,
      ease: "power4.inOut"
    });
  }, [strategyPanelCollapsed, strategyPanelWidth]);

  return (
    <div ref={containerRef} className="flex flex-1 overflow-hidden h-full">
      {/* 2. Main Stage (Chart + Positions) */}
      <main ref={mainRef} className="flex-1 flex flex-col relative min-w-0 bg-[var(--bg-primary)]">
        <div className="flex-1 relative min-h-0 terminal-panel">
          <CandleChart />

          {/* Watermark / Overlay */}
          <div className="absolute top-6 left-6 pointer-events-none select-none">
            {/* Background Symbol Watermark */}
            <h1 className="absolute top-[-0.5rem] left-[-0.2rem] text-7xl font-black font-mono tracking-tighter text-[var(--text-primary)] opacity-[0.03] leading-none">
              ESZ6
            </h1>

            {/* Foreground Info */}
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-1.5 py-0.5 rounded bg-[var(--accent)] text-white text-[10px] font-bold tracking-wider animate-pulse-soft">LIVE</span>
                <span className="text-sm font-mono font-bold text-[var(--text-primary)]">ESZ6</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] opacity-80">
                <span>CME</span>
                <ChevronRight size={10} className="opacity-50" />
                <span>S&P 500 E-mini</span>
                <ChevronRight size={10} className="opacity-50" />
                <span className="text-[var(--accent)] font-bold">DEC 26</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Panel (Positions & Strategy) */}
        <div className="relative">
          {/* TradingView-style Bottom Toggle Bar - Cleaned up to an isolated floating tab above the panel */}
          <div
            onClick={toggleBottomPanel}
            className="absolute -top-5 left-1/2 -translate-x-1/2 h-5 w-32 z-40 cursor-pointer group/bottom-toggle flex items-center justify-center hover:bg-[var(--bg-secondary)] transition-colors border-t border-x border-[var(--border-subtle)] bg-[var(--bg-primary)] rounded-t-lg shadow-sm"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-[2px] bg-[var(--border-subtle)] group-hover/bottom-toggle:bg-[var(--accent)] transition-colors rounded-full" />
              {bottomPanelCollapsed ? (
                <ChevronRight size={12} className="text-[var(--text-muted)] group-hover/bottom-toggle:text-[var(--accent)] -rotate-90 transition-colors" />
              ) : (
                <ChevronRight size={12} className="text-[var(--text-muted)] group-hover/bottom-toggle:text-[var(--accent)] rotate-90 transition-colors" />
              )}
              <div className="w-6 h-[2px] bg-[var(--border-subtle)] group-hover/bottom-toggle:bg-[var(--accent)] transition-colors rounded-full" />
            </div>
          </div>

          <div
            ref={bottomPanelRef}
            className="border-t border-[var(--border-subtle)] bg-[var(--bg-primary)] flex terminal-panel relative overflow-hidden"
          >
            {/* Draggable Handle Bar (Height) */}
            <div
              onMouseDown={handleHeightMouseDown}
              onDoubleClick={handleSnapToDefault}
              className={`absolute top-0 left-0 right-0 h-1 z-30 transition-colors duration-200 hover:bg-[var(--accent)]/30 ${bottomPanelCollapsed ? 'cursor-default' : 'cursor-row-resize'}`}
            />

            {/* Bottom Panel Tabs + Content */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {/* Tab Bar */}
              <div className="flex items-center gap-1 px-3 pt-2 pb-1 shrink-0 border-b border-[var(--border-subtle)]/50">
                <button
                  onClick={() => setBottomPanelTab('positions')}
                  className={`px-2 py-1 rounded text-[10px] uppercase font-semibold tracking-wider transition-colors cursor-pointer ${
                    bottomPanelTab === 'positions'
                      ? 'bg-[var(--accent)] text-black'
                      : 'bg-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Positions
                </button>
                <button
                  onClick={() => setBottomPanelTab('history')}
                  className={`px-2 py-1 rounded text-[10px] uppercase font-semibold tracking-wider transition-colors cursor-pointer ${
                    bottomPanelTab === 'history'
                      ? 'bg-[var(--accent)] text-black'
                      : 'bg-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Orders & Fills
                </button>
              </div>
              
              {/* Tab Content */}
              <div className="flex-1 overflow-hidden">
                {bottomPanelTab === 'positions' ? <Positions /> : <OrdersHistory />}
              </div>
            </div>

            {/* Draggable Divider (Width) */}
            {!strategyPanelCollapsed && (
              <div
                onMouseDown={handleWidthMouseDown}
                onDoubleClick={handleWidthSnapToDefault}
                className="w-4 h-full cursor-col-resize z-50 hover:bg-[var(--accent)]/10 transition-colors border-l border-[var(--border-subtle)] shrink-0 flex items-center justify-center group/width -ml-1"
              >
                <div className="w-[2px] h-8 bg-[var(--border-subtle)] group-hover/width:bg-[var(--accent)] transition-colors rounded-full" />
              </div>
            )}

            <div
              ref={strategyContainerRef}
              className={`overflow-hidden bg-[var(--bg-secondary)]/30 transition-colors duration-300 ${strategyPanelCollapsed ? 'border-l border-[var(--border-subtle)]' : ''}`}
            >
              <StrategyPanel />
            </div>
          </div>
        </div>
      </main>

      {/* TradingView-style Right Sidebar Toggle */}
      <div
        onClick={toggleRightSidebar}
        className="w-5 z-50 cursor-pointer group/right-toggle flex items-center justify-center hover:bg-[var(--accent)]/10 transition-colors border-l border-[var(--border-subtle)] hover:border-[var(--accent)]/20"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="w-[2px] h-8 bg-[var(--border-subtle)] group-hover/right-toggle:bg-[var(--accent)] transition-colors rounded-full" />
          {rightSidebarCollapsed ? (
            <ChevronLeft size={12} className="text-[var(--text-muted)] group-hover/right-toggle:text-[var(--accent)] transition-colors" />
          ) : (
            <ChevronRight size={12} className="text-[var(--text-muted)] group-hover/right-toggle:text-[var(--accent)] transition-colors" />
          )}
          <div className="w-[2px] h-8 bg-[var(--border-subtle)] group-hover/right-toggle:bg-[var(--accent)] transition-colors rounded-full" />
        </div>
      </div>

      {/* 3. Right Panel (Order Entry / DOM / Tape) */}
      <aside ref={rightSidebarRef} className="w-85 border-l border-[var(--border-subtle)] bg-[var(--bg-secondary)] flex flex-col z-10 overflow-hidden">
        {/* Order Entry (Fixed Top) */}
        <div className="border-b border-[var(--border-subtle)] shrink-0 terminal-panel">
          <OrderEntry />
        </div>

        {/* Order Book (Flexible Middle) */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0 border-b border-[var(--border-subtle)] terminal-panel">
          <OrderBook />
        </div>

        {/* Tape (Bottom Fixed) */}
        <div className="h-56 overflow-hidden flex flex-col terminal-panel">
          <TradeHistory />
        </div>
      </aside>
    </div>
  );
}
