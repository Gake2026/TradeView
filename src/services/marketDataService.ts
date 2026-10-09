import { MarketAsset } from '../types';
import { INITIAL_MARKET_ASSETS } from '../data/assets';

export interface OrderBookEntry {
  price: number;
  size: number;
  total: number;
  percent: number;
}

export interface OrderBookData {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  spread: number;
  spreadPercent: number;
}

export interface RecentTrade {
  id: string;
  price: number;
  size: number;
  time: string;
  side: 'buy' | 'sell';
}

type PriceUpdateCallback = (updatedAssets: MarketAsset[], changedSymbol: string, oldPrice: number, newPrice: number) => void;

class MarketDataService {
  private assets: Map<string, MarketAsset> = new Map();
  private subscribers: Set<PriceUpdateCallback> = new Set();
  private ws: WebSocket | null = null;
  private simulationInterval: number | null = null;
  private isConnecting: boolean = false;
  private isStopped: boolean = false;

  constructor() {
    INITIAL_MARKET_ASSETS.forEach(asset => {
      this.assets.set(asset.symbol, { ...asset });
    });
  }

  public getAssets(): MarketAsset[] {
    return Array.from(this.assets.values());
  }

  public getAsset(symbol: string): MarketAsset | undefined {
    return this.assets.get(symbol);
  }

  public subscribe(callback: PriceUpdateCallback): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  public start() {
    this.isStopped = false;
    this.connectBinanceWS();
    this.startSimulationLoop();
  }

  public stop() {
    this.isStopped = true;
    if (this.ws) {
      try {
        this.ws.close();
      } catch {
        // safe
      }
      this.ws = null;
    }
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
  }

  private connectBinanceWS() {
    if (typeof window === 'undefined' || this.isStopped || this.isConnecting || this.ws) return;
    this.isConnecting = true;

    try {
      // Stream 24hr ticker for major cryptos
      const streams = ['btcusdt', 'ethusdt', 'solusdt', 'bnbusdt', 'xrpusdt', 'adausdt', 'dogeusdt', 'avaxusdt', 'dotusdt', 'linkusdt']
        .map(s => `${s}@ticker`)
        .join('/');

      this.ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streams}`);

      this.ws.onopen = () => {
        this.isConnecting = false;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // format: s: 'BTCUSDT', c: '68420.50', p: '120.00', P: '0.18', h: '69000', l: '67000', v: '23420'
          if (data && data.s && data.c) {
            this.handleCryptoTick(data.s, parseFloat(data.c), parseFloat(data.P || '0'), parseFloat(data.h || '0'), parseFloat(data.l || '0'));
          }
        } catch {
          // safe parse fail
        }
      };

      this.ws.onerror = (e: any) => {
        if (e && typeof e.preventDefault === 'function') {
          e.preventDefault();
        }
        this.isConnecting = false;
      };

      this.ws.onclose = () => {
        this.isConnecting = false;
        this.ws = null;
        // Auto-reconnect after 5 seconds if not deliberately stopped
        if (!this.isStopped) {
          setTimeout(() => this.connectBinanceWS(), 5000);
        }
      };
    } catch {
      this.isConnecting = false;
    }
  }

  private handleCryptoTick(symbol: string, currentPrice: number, changePercent: number, high?: number, low?: number) {
    const existing = this.assets.get(symbol);
    if (!existing) return;

    const oldPrice = existing.price;
    if (oldPrice === currentPrice) return;

    const tickTrend = currentPrice > oldPrice ? 'up' : 'down';
    const updated: MarketAsset = {
      ...existing,
      price: currentPrice,
      changePercent24h: changePercent || existing.changePercent24h,
      high24h: high && high > 0 ? high : Math.max(existing.high24h, currentPrice),
      low24h: low && low > 0 ? low : Math.min(existing.low24h, currentPrice),
      tickTrend,
      lastUpdated: Date.now(),
    };

    this.assets.set(symbol, updated);
    this.notifySubscribers(symbol, oldPrice, currentPrice);
  }

  private startSimulationLoop() {
    if (this.simulationInterval) return;

    // Simulate subtle market fluctuations for US stocks, Indian stocks, and crypto (fallback)
    this.simulationInterval = window.setInterval(() => {
      const assetList = Array.from(this.assets.values());
      // Pick 1-3 random assets per interval to update
      const updateCount = Math.floor(Math.random() * 3) + 1;

      for (let i = 0; i < updateCount; i++) {
        const randomIndex = Math.floor(Math.random() * assetList.length);
        const target = assetList[randomIndex];

        // Volatility depends on category
        const volatilityPct = target.category === 'crypto' ? 0.0008 : target.category === 'indian_stock' ? 0.0005 : 0.0004;
        const deltaPct = (Math.random() - 0.49) * volatilityPct * 2;
        const oldPrice = target.price;
        let newPrice = oldPrice * (1 + deltaPct);

        if (target.decimals <= 2) {
          newPrice = Number(newPrice.toFixed(target.decimals));
        } else {
          newPrice = Number(newPrice.toFixed(target.decimals));
        }

        if (newPrice === oldPrice) continue;

        const tickTrend = newPrice > oldPrice ? 'up' : 'down';
        const newChange = target.change24h + (newPrice - oldPrice);
        const basePrice = (target.price - target.change24h) || target.price || 1;
        const newChangePct = Number(((newChange / basePrice) * 100).toFixed(2));

        const updated: MarketAsset = {
          ...target,
          price: newPrice,
          change24h: Number(newChange.toFixed(target.decimals)),
          changePercent24h: newChangePct,
          high24h: Math.max(target.high24h, newPrice),
          low24h: Math.min(target.low24h, newPrice),
          tickTrend,
          lastUpdated: Date.now(),
        };

        this.assets.set(target.symbol, updated);
        this.notifySubscribers(target.symbol, oldPrice, newPrice);
      }
    }, 1200);
  }

  private notifySubscribers(changedSymbol: string, oldPrice: number, newPrice: number) {
    const list = this.getAssets();
    this.subscribers.forEach(cb => {
      try {
        cb(list, changedSymbol, oldPrice, newPrice);
      } catch {
        // safe
      }
    });
  }

  // Generate realistic live order book for any asset
  public getOrderBook(asset: MarketAsset): OrderBookData {
    const spreadPct = asset.category === 'crypto' ? 0.0002 : 0.0004;
    const spread = Number((asset.price * spreadPct).toFixed(asset.decimals));
    const bestBid = asset.price - spread / 2;
    const bestAsk = asset.price + spread / 2;

    const depthLevels = 8;
    const bids: OrderBookEntry[] = [];
    const asks: OrderBookEntry[] = [];

    let cumBid = 0;
    let cumAsk = 0;

    for (let i = 0; i < depthLevels; i++) {
      const stepFactor = 1 + i * 0.0003;
      const bidPrice = Number((bestBid / stepFactor).toFixed(asset.decimals));
      const askPrice = Number((bestAsk * stepFactor).toFixed(asset.decimals));

      const bidSize = Number((asset.lotSize * (1 + Math.random() * 4) * (1 + i * 0.4)).toFixed(asset.minQty < 1 ? 3 : 0));
      const askSize = Number((asset.lotSize * (1 + Math.random() * 4) * (1 + i * 0.4)).toFixed(asset.minQty < 1 ? 3 : 0));

      cumBid += bidSize;
      cumAsk += askSize;

      bids.push({ price: bidPrice, size: bidSize, total: cumBid, percent: 0 });
      asks.push({ price: askPrice, size: askSize, total: cumAsk, percent: 0 });
    }

    const maxTotal = Math.max(cumBid, cumAsk);
    bids.forEach(b => b.percent = Math.min(100, Math.round((b.total / maxTotal) * 100)));
    asks.forEach(a => a.percent = Math.min(100, Math.round((a.total / maxTotal) * 100)));

    return {
      bids,
      asks,
      spread,
      spreadPercent: Number(((spread / asset.price) * 100).toFixed(3)),
    };
  }

  // Generate recent trade history tape
  public getRecentTrades(asset: MarketAsset, count = 12): RecentTrade[] {
    const trades: RecentTrade[] = [];
    const now = Date.now();

    for (let i = 0; i < count; i++) {
      const side: 'buy' | 'sell' = Math.random() > 0.48 ? 'buy' : 'sell';
      const delta = (Math.random() - 0.5) * (asset.price * 0.0005);
      const price = Number((asset.price + delta).toFixed(asset.decimals));
      const size = Number((asset.lotSize * (0.5 + Math.random() * 3.5)).toFixed(asset.minQty < 1 ? 3 : 0));
      const timeStr = new Date(now - i * 1800).toTimeString().split(' ')[0];

      trades.push({
        id: `t-${now}-${i}`,
        price,
        size,
        time: timeStr,
        side,
      });
    }

    return trades;
  }
}

export const marketService = new MarketDataService();
