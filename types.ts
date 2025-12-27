
export interface SubItem {
    name: string;
    value: number;
    quantity?: number;
    averageBuyPrice?: number;
    currentPrice?: number; // New field for user input market price
}

export interface Asset {
    name: string;
    percentage: number;
    value: number;
    initialValue: number;
    profitLoss: number;
    subItems: SubItem[];
}

export interface Assets {
    [key: string]: Asset;
}

export interface Transaction {
    date: string;
    description: string;
    amount: number;
}

export interface TradeRecord {
    id: string;
    date: string;
    assetName: string;
    subItemName: string;
    type: 'buy' | 'sell';
    quantity: number;
    unitPrice: number;
    totalCost: number;
}

export interface AppState {
    isInitialized: boolean;
    currentPage: 'dashboard' | 'settings' | 'profit-loss' | 'trades';
    totalCapital: number;
    assets: Assets;
    transactions: Transaction[];
    tradeHistory: TradeRecord[];
}

export type AssetKey = string;