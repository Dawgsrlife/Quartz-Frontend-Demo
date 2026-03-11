"use client";

/**
 * AccountProvider — MOCK VERSION for frontend demo.
 *
 * Injects mock portfolio data directly instead of polling the backend.
 */

import React, { useEffect } from "react";
import { useAccountStore } from "@/lib/store";
import { useAuthStore } from "@/lib/authStore";

const MOCK_ACCOUNT_DATA = {
    net_liquidation: 247_831.42,
    daily_pl: 3_214.87,
    open_positions: [
        {
            symbol: "ES",
            quantity: 4,
            entry_price: 5892.25,
            current_price: 5911.50,
            unrealized_pl: 770.00,
        },
        {
            symbol: "NQ",
            quantity: -2,
            entry_price: 21340.00,
            current_price: 21285.75,
            unrealized_pl: 1085.00,
        },
        {
            symbol: "CL",
            quantity: 3,
            entry_price: 78.42,
            current_price: 79.18,
            unrealized_pl: 228.00,
        },
    ],
};

export function AccountProvider({ children }: { children: React.ReactNode }) {
    const setAccountData = useAccountStore((state) => state.setAccountData);
    const token = useAuthStore((s) => s.token);

    useEffect(() => {
        if (!token) return;

        // Inject mock data immediately
        setAccountData(MOCK_ACCOUNT_DATA);

        // Simulate small P&L fluctuations every 5s for visual realism
        const interval = setInterval(() => {
            const jitter = (Math.random() - 0.5) * 200;
            setAccountData({
                ...MOCK_ACCOUNT_DATA,
                daily_pl: MOCK_ACCOUNT_DATA.daily_pl + jitter,
                open_positions: MOCK_ACCOUNT_DATA.open_positions.map((p) => ({
                    ...p,
                    current_price: p.current_price + (Math.random() - 0.5) * 2,
                    unrealized_pl: p.unrealized_pl + (Math.random() - 0.5) * 50,
                })),
            });
        }, 5000);

        return () => clearInterval(interval);
    }, [token, setAccountData]);

    return <>{children}</>;
}
