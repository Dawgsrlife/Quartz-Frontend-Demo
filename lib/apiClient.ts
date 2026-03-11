/**
 * apiClient — MOCK VERSION for frontend demo.
 *
 * Returns mock data for all API paths. No backend calls.
 */

/* ------------------------------------------------------------------ */
/*  Mock Data                                                         */
/* ------------------------------------------------------------------ */

const MOCK_ACCOUNT_SUMMARY = {
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

const MOCK_ORDERS = {
    orders: [
        { id: "ORD-001", symbol: "ES", side: "BUY", quantity: 2, order_type: "LIMIT", limit_price: 5880.00, status: "FILLED", timestamp: new Date().toISOString() },
        { id: "ORD-002", symbol: "NQ", side: "SELL", quantity: 1, order_type: "MARKET", status: "FILLED", timestamp: new Date().toISOString() },
    ],
};

const MOCK_TRADES = {
    trades: [
        { id: "TRD-001", symbol: "ES", side: "BUY", quantity: 2, price: 5880.25, pnl: 412.50, timestamp: new Date().toISOString() },
        { id: "TRD-002", symbol: "NQ", side: "SELL", quantity: 1, price: 21340.00, pnl: -125.00, timestamp: new Date().toISOString() },
    ],
    count: 2,
};

const MOCK_IBKR_STATUS = {
    connected: true,
    enabled: true,
    host: "mock-gateway",
    port: 4001,
    accounts: ["DU12345678"],
    contract: { symbol: "ES", conId: 99999 },
    message: "DEMO MODE — Simulated connection",
};

/* ------------------------------------------------------------------ */
/*  Mock Route Handler                                                */
/* ------------------------------------------------------------------ */

function getMockResponse(path: string): any {
    if (path.includes("/api/account/summary")) return MOCK_ACCOUNT_SUMMARY;
    if (path.includes("/api/orders/open"))     return { orders: MOCK_ORDERS.orders.slice(0, 1), count: 1 };
    if (path.includes("/api/orders"))          return MOCK_ORDERS;
    if (path.includes("/api/trades"))          return MOCK_TRADES;
    if (path.includes("/api/ibkr/status"))     return MOCK_IBKR_STATUS;
    // Default fallback
    return {};
}

/* ------------------------------------------------------------------ */
/*  apiFetch (MOCK)                                                   */
/* ------------------------------------------------------------------ */

export async function apiFetch<T>(
    path: string,
    _options?: RequestInit
): Promise<T> {
    // Simulate slight network delay for realism
    await new Promise((r) => setTimeout(r, 80));
    return getMockResponse(path) as T;
}
