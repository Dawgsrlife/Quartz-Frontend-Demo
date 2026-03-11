"use client";

import React from "react";
import Image from "next/image";

interface QuartzLogoProps {
  className?: string;
  size?: number;
}

export function QuartzLogo({ className = "", size = 32 }: QuartzLogoProps) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <img
        src="/logo.png"
        alt="Quartz Logo"
        width={size}
        height={size}
        className="object-contain dark:brightness-[100] light:brightness-0 transition-all duration-300"
        style={{
          filter: "var(--logo-filter, none)"
        }}
      />
      
      {/* CSS variable for logo filtering based on theme */}
      <style jsx global>{`
        :root {
          --logo-filter: invert(0);
        }
        [data-theme='light'] {
          --logo-filter: invert(1) brightness(0.2);
        }
      `}</style>
    </div>
  );
}
