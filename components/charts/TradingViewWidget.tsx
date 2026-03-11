"use client";

import { useEffect, useRef, memo, useState } from "react";

function TradingViewWidget() {
    const containerId = useRef(`tv_widget_${Math.random().toString(36).substring(7)}`);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Locate the container by ID
        const container = document.getElementById(containerId.current);
        if (!container) return;

        // Clear previous scripts/iframes to prevent duplicates
        container.innerHTML = "";

        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
        script.type = "text/javascript";
        script.async = true;
        script.innerHTML = JSON.stringify({
            "autosize": true,
            "symbol": "COINBASE:BTCUSD",
            "interval": "D",
            "timezone": "Etc/UTC",
            "theme": "dark",
            "style": "1",
            "locale": "en",
            "enable_publishing": false,
            "allow_symbol_change": true,
            "container_id": containerId.current,
            "backgroundColor": "rgba(5, 5, 9, 1)",
            "gridColor": "rgba(255, 255, 255, 0.05)",
            "hide_top_toolbar": false,
            "hide_legend": false,
            "save_image": true,
            "calendar": true,
            "hide_volume": false,
            "support_host": "https://www.tradingview.com"
        });

        script.onload = () => {
            // Give it a tiny bit of extra time to render the iframe
            setTimeout(() => setIsLoading(false), 800);
        };

        container.appendChild(script);
        
        // Fallback for script error or if onload doesn't trigger as expected
        const timer = setTimeout(() => setIsLoading(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="h-full w-full overflow-hidden rounded-2xl relative bg-[var(--bg-primary)]">
            {isLoading && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-[var(--bg-primary)]">
                    <div className="relative">
                        <div className="w-12 h-12 border-2 border-[var(--accent)]/10 rounded-full" />
                        <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-[var(--accent)] rounded-full animate-spin" />
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-[10px] font-display font-bold text-[var(--accent)] tracking-[0.2em] uppercase">Initializing Engine</span>
                        <div className="w-24 h-[1px] bg-[var(--accent)]/10 relative overflow-hidden">
                            <div className="absolute inset-0 bg-[var(--accent)]/40 animate-[loading_1.5s_infinite_ease-in-out]" />
                        </div>
                    </div>
                </div>
            )}
            <div
                id={containerId.current}
                className="tradingview-widget-container h-full w-full"
            />
        </div>
    );
}

export default memo(TradingViewWidget);
