export interface Candle {
  time: number;      // Unix seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Level2Level {
  price: number;
  size: number;
}

export interface Level2Update {
  bids: Level2Level[];
  asks: Level2Level[];
}

export interface Trade {
  time: number;
  price: number;
  size: number;
  side: 'buy' | 'sell';
}

export function generateMockCandles(count: number = 100): Candle[] {
  const candles: Candle[] = [];
  let currentTime = Math.floor(Date.now() / 1000) - count * 60;
  let lastClose = 4500 + Math.random() * 100;

  for (let i = 0; i < count; i++) {
    const open = lastClose;
    const close = open + (Math.random() - 0.5) * 10;
    const high = Math.max(open, close) + Math.random() * 5;
    const low = Math.min(open, close) - Math.random() * 5;
    const volume = Math.floor(Math.random() * 1000);

    candles.push({
      time: currentTime,
      open,
      high,
      low,
      close,
      volume,
    });

    currentTime += 60;
    lastClose = close;
  }

  return candles;
}

export function generateMockL2(basePrice: number): Level2Update {
  const bids: Level2Level[] = [];
  const asks: Level2Level[] = [];

  for (let i = 1; i <= 15; i++) {
    bids.push({
      price: basePrice - i * 0.25,
      size: Math.floor(Math.random() * 50) + 1,
    });
    asks.push({
      price: basePrice + i * 0.25,
      size: Math.floor(Math.random() * 50) + 1,
    });
  }

  return { bids, asks };
}

export function generateMockTrade(basePrice: number): Trade {
  const side = Math.random() > 0.5 ? 'buy' : 'sell';
  return {
    time: Math.floor(Date.now() / 1000),
    price: basePrice + (Math.random() - 0.5) * 2,
    size: Math.floor(Math.random() * 10) + 1,
    side,
  };
}
