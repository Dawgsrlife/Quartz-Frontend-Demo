import { create } from 'zustand';

interface Tick {
    symbol: string;
    price: number;
    timestamp: number;
    signal?: string;
}

type ChartTimezone = 'ET' | 'UTC' | 'Local';

interface MarketState {
    lastTick: Tick | null;
    currentPrice: number;
    signal: string | null;
    timeframe: string;
    timezone: ChartTimezone;
    updateTick: (tick: Tick) => void;
    setTimeframe: (timeframe: string) => void;
    setTimezone: (tz: ChartTimezone) => void;
}

export const useMarketStore = create<MarketState>((set) => ({
    lastTick: null,
    currentPrice: 0,
    signal: null,
    timeframe: '5m',
    timezone: 'ET',
    updateTick: (tick) => set({ 
        lastTick: tick, 
        currentPrice: tick.price,
        signal: tick.signal || null
    }),
    setTimeframe: (timeframe) => set({ timeframe }),
    setTimezone: (timezone) => set({ timezone }),
}));

interface Position {
    symbol: string;
    quantity: number;
    entry_price: number;
    current_price: number;
    unrealized_pl: number;
}

interface AccountState {
    balance: number;
    dailyPl: number;
    positions: Position[];
    setAccountData: (data: any) => void;
}

export const useAccountStore = create<AccountState>((set) => ({
    balance: 0,
    dailyPl: 0,
    positions: [],
    setAccountData: (data) => set({
        balance: data.net_liquidation || data.netLiquidity || 0,
        dailyPl: data.daily_pl || data.dailyPl || 0,
        positions: data.open_positions || data.positions || []
    }),
}));

interface UIState {
    sidebarCollapsed: boolean;
    headerCollapsed: boolean;
    bottomPanelCollapsed: boolean;
    bottomPanelHeight: number;
    strategyPanelWidth: number;
    positionsCollapsed: boolean;
    strategyPanelCollapsed: boolean;
    rightSidebarCollapsed: boolean;
    toggleSidebar: () => void;
    toggleHeader: () => void;
    toggleBottomPanel: () => void;
    toggleRightSidebar: () => void;
    setBottomPanelHeight: (height: number) => void;
    setStrategyPanelWidth: (width: number) => void;
    setPositionsCollapsed: (collapsed: boolean) => void;
    setStrategyPanelCollapsed: (collapsed: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
    sidebarCollapsed: false,
    headerCollapsed: false,
    bottomPanelCollapsed: false,
    bottomPanelHeight: 320,
    strategyPanelWidth: 320,
    positionsCollapsed: false,
    strategyPanelCollapsed: false,
    rightSidebarCollapsed: false,
    toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    toggleHeader: () => set((state) => ({ headerCollapsed: !state.headerCollapsed })),
    toggleBottomPanel: () => set((state) => ({ bottomPanelCollapsed: !state.bottomPanelCollapsed })),
    toggleRightSidebar: () => set((state) => ({ rightSidebarCollapsed: !state.rightSidebarCollapsed })),
    setBottomPanelHeight: (height) => set({ bottomPanelHeight: height }),
    setStrategyPanelWidth: (width) => set({ strategyPanelWidth: width }),
    setPositionsCollapsed: (collapsed) => set({ positionsCollapsed: collapsed }),
    setStrategyPanelCollapsed: (collapsed) => set({ strategyPanelCollapsed: collapsed }),
}));
