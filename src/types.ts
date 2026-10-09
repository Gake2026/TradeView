export type AssetCategory = 'crypto' | 'us_stock' | 'indian_stock';

export interface MarketAsset {
  symbol: string;           // Internal identifier e.g. BTCUSDT, AAPL, RELIANCE
  name: string;             // Full name e.g. Bitcoin, Apple Inc.
  displayName: string;      // Ticker display e.g. BTC/USDT, AAPL, RELIANCE
  tvSymbol: string;         // TradingView symbol e.g. BINANCE:BTCUSDT, NASDAQ:AAPL, NSE:RELIANCE
  category: AssetCategory;
  price: number;
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: string;
  quoteCurrency: 'USD' | 'INR';
  decimals: number;
  minQty: number;
  lotSize: number;
  tickTrend?: 'up' | 'down' | 'neutral';
  lastUpdated?: number;
}

export type TradeMode = 'spot' | 'futures' | 'options';
export type OrderType = 'market' | 'limit' | 'stop_limit';
export type OrderSide = 'buy' | 'sell'; // buy = long, sell = short in futures
export type MarginMode = 'isolated' | 'cross';

export interface Position {
  id: string;
  assetSymbol: string;
  displayName: string;
  category: AssetCategory;
  mode: TradeMode;
  side: OrderSide;
  size: number;
  entryPrice: number;
  currentPrice: number;
  margin: number;
  leverage: number;
  marginMode: MarginMode;
  liquidationPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  trailingStop?: number;
  highestPriceSinceOpen?: number;
  lowestPriceSinceOpen?: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  openTime: number;
  optionDetails?: {
    strike: number;
    optionType: 'call' | 'put';
    expiry: string;
    contracts: number;
    premium: number;
  };
}

export interface Order {
  id: string;
  assetSymbol: string;
  displayName: string;
  category: AssetCategory;
  mode: TradeMode;
  side: OrderSide;
  orderType: OrderType;
  price?: number;        // Target price for limit order
  stopPrice?: number;    // Stop trigger price for stop-limit order
  size: number;
  margin: number;
  leverage: number;
  marginMode: MarginMode;
  stopLoss?: number;
  takeProfit?: number;
  status: 'pending' | 'filled' | 'cancelled';
  createdAt: number;
  optionDetails?: {
    strike: number;
    optionType: 'call' | 'put';
    expiry: string;
    contracts: number;
    premium: number;
  };
}

export interface ClosedTrade {
  id: string;
  assetSymbol: string;
  displayName: string;
  category: AssetCategory;
  mode: TradeMode;
  side: OrderSide;
  size: number;
  entryPrice: number;
  exitPrice: number;
  leverage: number;
  margin: number;
  realizedPnL: number;
  realizedPnLPercent: number;
  openTime: number;
  closeTime: number;
  closeReason: 'market_close' | 'limit_exit' | 'stop_loss' | 'take_profit' | 'trailing_stop' | 'liquidation';
  optionDetails?: {
    strike: number;
    optionType: 'call' | 'put';
    expiry: string;
    contracts: number;
  };
}

export interface PriceAlert {
  id: string;
  assetSymbol: string;
  displayName: string;
  targetPrice: number;
  condition: 'above' | 'below';
  createdAt: number;
  triggered: boolean;
  notes?: string;
}

export interface OptionContract {
  strike: number;
  callPremium: number;
  callIV: number;
  callDelta: number;
  callTheta: number;
  callOI: number;
  callVolume: number;
  putPremium: number;
  putIV: number;
  putDelta: number;
  putTheta: number;
  putOI: number;
  putVolume: number;
}

export interface PortfolioAccount {
  balanceUSD: number;
  balanceINR: number;
  displayCurrency: 'USD' | 'INR';
  initialBalanceUSD: number;
  riskPerTradePercent: number;
  maxLeverage: number;
  soundEnabled: boolean;
  favorites: string[]; // List of asset symbols
}

export type DrawingToolType = 
  | 'cursor'
  | 'trendline'
  | 'horizontal'
  | 'fibonacci'
  | 'rectangle'
  | 'brush'
  | 'measure';

export interface ChartDrawing {
  id: string;
  type: DrawingToolType;
  points: { x: number; y: number; price?: number; timeIndex?: number }[];
  color: string;
  lineWidth: number;
}

export interface ChartIndicatorConfig {
  ema20: boolean;
  ema50: boolean;
  ema200: boolean;
  bollingerBands: boolean;
  rsi14: boolean;
  macd: boolean;
  volume: boolean;
}

export interface CandlestickData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
