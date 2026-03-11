"use client";

import React, { useEffect, useState, useRef } from "react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { QuartzLogo } from "@/components/layout/QuartzLogo";
import { Moon, Sun, Minus, Square, X, ChevronUp, ChevronDown } from "lucide-react";
import StatusIndicators from "./StatusIndicators";
import { PanicButton } from "./PanicButton";
import { TimeframeSelector } from "./TimeframeSelector";
import { AccountSelector } from "./AccountSelector";
import { useUIStore } from "@/lib/store";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export function TopBar() {
  const { theme, toggleTheme } = useTheme();
  const [windowControls, setWindowControls] = useState<any>(null);
  const { headerCollapsed, toggleHeader } = useUIStore();
  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    import("@/lib/tauri")
      .then((module) => {
        setWindowControls(module.quartzApp);
      })
      .catch(() => {
        console.log("Running in web mode - window controls disabled");
      });
  }, []);

  useGSAP(() => {
    const tl = gsap.timeline();
    
    tl.to(headerRef.current, {
      height: headerCollapsed ? 4 : 48,
      duration: 0.4,
      ease: "expo.out"
    });

    tl.to(contentRef.current, {
      opacity: headerCollapsed ? 0 : 1,
      y: headerCollapsed ? -10 : 0,
      duration: 0.3,
      ease: "power2.out"
    }, "<");
  }, [headerCollapsed]);

  return (
    <div className="relative z-[100] group/header-wrapper">
      <header 
        ref={headerRef}
        className="border-b border-[var(--border-subtle)] bg-[var(--bg-primary)] flex flex-col select-none drag-region relative z-[100] overflow-hidden"
      >
        <div 
          ref={contentRef}
          className="h-12 flex items-center px-6 w-full shrink-0"
        >
            {/* Logo Section */}
            <div className="flex items-center group">
              <QuartzLogo size={20} className="mr-3" />
              <div className="flex flex-col leading-none">
              <span className="font-mono text-[12px] font-black tracking-[0.25em] text-[var(--text-primary)] uppercase">
                Quartz
              </span>
            </div>
          </div>

          <div className="h-4 w-[1px] bg-[var(--border-subtle)] mx-8 opacity-40" />

          <div className="flex-1 overflow-hidden flex items-center">
            <StatusIndicators />
            <div className="h-4 w-[1px] bg-[var(--border-subtle)] mx-4 opacity-30 shrink-0" />
            <div className="no-drag">
              <TimeframeSelector />
            </div>
            <div className="h-4 w-[1px] bg-[var(--border-subtle)] mx-4 opacity-30 shrink-0" />
            <AccountSelector />
          </div>
          
          <div className="mx-4 no-drag relative z-[110]">
            <PanicButton />
          </div>

          {/* Interaction Layer */}
          <div className="flex items-center h-full ml-4 no-drag relative z-[110]">
            <button
              onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all mr-2"
            >
              {theme === "light" ? <Moon size={14} /> : <Sun size={14} />}
            </button>

            <div className="h-8 w-[1px] bg-[var(--border-subtle)] mx-1 opacity-30" />

            {/* Window Controls */}
            <div className="flex items-center h-full">
              <button
                onClick={() => windowControls?.minimize()}
                className="h-full px-2.5 hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors relative z-[120]"
              >
                <Minus size={14} strokeWidth={1.5} />
              </button>
              <button
                onClick={() => windowControls?.maximize()}
                className="h-full px-2.5 hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors relative z-[120]"
              >
                <Square size={10} strokeWidth={2} />
              </button>
              <button
                onClick={() => windowControls?.close()}
                className="h-full px-3.5 hover:bg-rose-500 hover:text-white text-[var(--text-muted)] transition-colors relative z-[120]"
              >
                <X size={14} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>

        {/* Collapsed Accent Bar */}
        {headerCollapsed && (
          <div className="absolute inset-0 bg-[var(--accent)] opacity-40 animate-pulse pointer-events-none" />
        )}
      </header>

      {/* Top Edge Trigger Zone (Visible but hoverable when collapsed) */}
      <div 
        className={`fixed top-0 left-0 right-0 h-6 z-[140] cursor-pointer group/top-edge ${headerCollapsed ? "block" : "hidden"}`}
        onClick={toggleHeader}
      >
        {/* Edge Hint Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-[var(--accent)] opacity-0 group-hover/top-edge:opacity-40 transition-opacity duration-300 shadow-[0_0_10px_var(--accent)]" />
        
        {/* Top Glow Pull Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-full bg-gradient-to-b from-[var(--accent)]/10 to-transparent opacity-0 group-hover/top-edge:opacity-100 transition-all duration-500 rounded-b-full blur-md" />
      </div>

      {/* Collapse/Expand Toggle Handle - Now outside the overflow-hidden header */}
      <div 
        className={`
          absolute left-1/2 -translate-x-1/2 flex flex-col items-center no-drag z-[130] transition-all duration-500 ease-out
          ${headerCollapsed ? 'top-1 opacity-40 hover:opacity-100' : 'top-[44px] opacity-0 group-hover/header-wrapper:opacity-100'}
        `}
      >
          <button
            onClick={toggleHeader}
            className={`
              group/handle relative flex items-center justify-center transition-all duration-300 cursor-pointer shadow-2xl
              ${headerCollapsed 
                ? "w-48 h-6 bg-[var(--accent)] text-quartz-bg rounded-b-xl shadow-[0_4px_20px_rgba(var(--accent-rgb),0.5)] border-t-0" 
                : "w-20 h-4 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-b-md text-[var(--text-muted)] hover:text-[var(--accent)] hover:h-6 hover:bg-[var(--bg-primary)] hover:border-[var(--accent)]/30"
              }
            `}
          >
            <div className="flex items-center justify-center gap-2">
              {headerCollapsed ? (
                <>
                  <div className="w-8 h-[1px] bg-quartz-bg/20" />
                  <ChevronDown size={14} strokeWidth={3} className="animate-bounce-slow" />
                  <div className="w-8 h-[1px] bg-quartz-bg/20" />
                </>
              ) : (

              <ChevronUp size={12} strokeWidth={2.5} className="group-hover/handle:-translate-y-0.5 transition-transform" />
            )}
          </div>

          {/* Hit area expansion for easier interaction */}
          <div className="absolute -inset-4 pointer-events-auto" />
        </button>
      </div>
    </div>
  );
}
