"use client";

import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ChevronDown, ChevronRight } from "lucide-react";

interface CollapsiblePanelProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  isExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  className?: string;
  maxHeight?: string | number;
}

export function CollapsiblePanel({
  title,
  subtitle,
  icon,
  children,
  defaultExpanded = true,
  isExpanded: controlledExpanded,
  onToggle,
  className = "",
  maxHeight = "auto",
}: CollapsiblePanelProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;
  
  const toggle = () => {
    const next = !isExpanded;
    if (onToggle) onToggle(next);
    else setInternalExpanded(next);
  };

  const contentRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;

    if (isExpanded) {
      gsap.to(contentRef.current, {
        height: maxHeight,
        opacity: 1,
        duration: 0.4,
        ease: "power3.out",
        visibility: "visible",
      });
      gsap.to(iconRef.current, {
        rotate: 0,
        duration: 0.3,
        ease: "back.out(1.7)",
      });
    } else {
      gsap.to(contentRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.3,
        ease: "power3.in",
        visibility: "hidden",
      });
      gsap.to(iconRef.current, {
        rotate: -90,
        duration: 0.3,
        ease: "back.out(1.7)",
      });
    }
  }, [isExpanded, maxHeight]);

  return (
    <div className={`flex flex-col border-b border-[var(--border-subtle)] ${className}`}>
      {/* Header */}
      <div
        onClick={toggle}
        className="bg-[var(--bg-secondary)]/50 px-3 py-2 text-[10px] font-mono font-bold text-[var(--text-muted)] cursor-pointer flex justify-between items-center hover:bg-[var(--bg-secondary)] transition-colors group select-none border-b border-[var(--border-subtle)]"
      >
        <div className="flex items-center gap-2">
          <div ref={iconRef}>
            <ChevronDown size={12} className="opacity-50 group-hover:opacity-100" />
          </div>
          {icon && <span className="opacity-70 group-hover:opacity-100 transition-opacity">{icon}</span>}
          <span className="tracking-widest uppercase">{title}</span>
        </div>
        {subtitle && (
          <span className="text-[9px] font-normal opacity-50 tracking-normal group-hover:opacity-100 transition-opacity">
            {subtitle}
          </span>
        )}
      </div>

      {/* Content Container */}
      <div
        ref={contentRef}
        className="overflow-hidden flex flex-col"
        style={{ height: defaultExpanded ? maxHeight : 0, opacity: defaultExpanded ? 1 : 0 }}
      >
        <div className="flex-1 flex flex-col min-h-0">
          {children}
        </div>
      </div>
    </div>
  );
}
