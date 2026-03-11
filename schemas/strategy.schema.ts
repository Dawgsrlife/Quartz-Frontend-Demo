export type OrderAction = 'BUY' | 'SELL' | 'HOLD';
export type OrderType = 'LIMIT' | 'MARKET';

export interface OrderSignalParams {
	stop_loss: number; // Critical exit price
	take_profit: number; // Target price
	trailing: boolean; // Logic flag
}

export interface OrderSignal {
	msg_type: 'ORDER_SIGNAL';
	strategy_id: string; // e.g., 'ORB'
	symbol: string; // e.g., 'ES1!'
	action: OrderAction;
	confidence: number; // 0.0 to 1.0
	order_type: OrderType;
	price: number; // tick precision (0.25)
	quantity: number; // Number of contracts
	params: OrderSignalParams;
	timestamp: number; // Unix Milliseconds (UTC)
}

export interface TickData {
	symbol: string; // e.g., 'ES1!'
	timestamp: number; // Unix Milliseconds (UTC)
	price: number; // Price level
	size: number; // Number of contracts processed in that tick
	side: -1 | 1; // Which side won (buyers vs sellers)
}