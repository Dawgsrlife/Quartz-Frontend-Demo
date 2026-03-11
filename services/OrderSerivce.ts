/**
 * OrderService — MOCK VERSION for frontend demo.
 *
 * All methods return instant mock responses. No backend calls.
 */

export interface OrderRequest {
  symbol?: string;
  quantity: number;
  order_type?: "MARKET" | "LIMIT";
  limit_price?: number;
  stop_loss?: number;
  take_profit?: number;
  strategy_id?: number;
}

export interface OrderResponse {
  success: boolean;
  order_id?: string;
  message: string;
  side: string;
  symbol: string;
  quantity: number;
  order_type: string;
  limit_price?: number;
  timestamp: string;
}

export interface IBKRStatus {
  connected: boolean;
  enabled: boolean;
  host?: string;
  port?: number;
  accounts?: string[];
  contract?: {
    symbol: string;
    conId: number;
  };
  message: string;
  error?: string;
}

let _orderCount = 0;

export class OrderService {
  static async getOrders(): Promise<{ orders: any[] }> {
    return {
      orders: [
        { id: "ORD-001", symbol: "ES", side: "BUY", quantity: 2, order_type: "LIMIT", limit_price: 5880.00, status: "FILLED", timestamp: new Date().toISOString() },
        { id: "ORD-002", symbol: "NQ", side: "SELL", quantity: 1, order_type: "MARKET", status: "FILLED", timestamp: new Date().toISOString() },
        { id: "ORD-003", symbol: "CL", side: "BUY", quantity: 3, order_type: "LIMIT", limit_price: 78.00, status: "WORKING", timestamp: new Date().toISOString() },
      ],
    };
  }

  static async getOpenOrders(): Promise<{ orders: any[]; count: number }> {
    return {
      orders: [
        { id: "ORD-003", symbol: "CL", side: "BUY", quantity: 3, order_type: "LIMIT", limit_price: 78.00, status: "WORKING", timestamp: new Date().toISOString() },
      ],
      count: 1,
    };
  }

  static async buyOrder(order: OrderRequest): Promise<OrderResponse> {
    _orderCount++;
    return {
      success: true,
      order_id: `MOCK-ORD-${_orderCount}`,
      message: "DEMO: Mock order filled",
      side: "BUY",
      symbol: order.symbol || "ES",
      quantity: order.quantity,
      order_type: order.order_type || "MARKET",
      limit_price: order.limit_price,
      timestamp: new Date().toISOString(),
    };
  }

  static async sellOrder(order: OrderRequest): Promise<OrderResponse> {
    _orderCount++;
    return {
      success: true,
      order_id: `MOCK-ORD-${_orderCount}`,
      message: "DEMO: Mock order filled",
      side: "SELL",
      symbol: order.symbol || "ES",
      quantity: order.quantity,
      order_type: order.order_type || "MARKET",
      limit_price: order.limit_price,
      timestamp: new Date().toISOString(),
    };
  }

  static async panicButton(): Promise<{ success: boolean; message: string }> {
    return { success: true, message: "DEMO: Emergency stop acknowledged (mock)" };
  }

  static async getIBKRStatus(): Promise<IBKRStatus> {
    return {
      connected: true,
      enabled: true,
      host: "mock-gateway",
      port: 4001,
      accounts: ["DU12345678"],
      contract: { symbol: "ES", conId: 99999 },
      message: "DEMO MODE — Simulated IBKR connection",
    };
  }

  static async getTrades(_limit: number = 50): Promise<{ trades: any[]; count: number }> {
    return {
      trades: [
        { id: "TRD-001", symbol: "ES", side: "BUY", quantity: 2, price: 5880.25, pnl: 412.50, timestamp: new Date().toISOString() },
        { id: "TRD-002", symbol: "NQ", side: "SELL", quantity: 1, price: 21340.00, pnl: -125.00, timestamp: new Date().toISOString() },
        { id: "TRD-003", symbol: "CL", side: "BUY", quantity: 3, price: 78.42, pnl: 228.00, timestamp: new Date().toISOString() },
      ],
      count: 3,
    };
  }
}