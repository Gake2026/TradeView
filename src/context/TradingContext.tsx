import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  MarketAsset, 
  Position, 
  Order, 
  ClosedTrade, 
  PriceAlert, 
  TradeMode, 
  OrderSide, 
  OrderType, 
  MarginMode, 
  PortfolioAccount 
} from '../types';
import { INITIAL_MARKET_ASSETS, USD_TO_INR_RATE } from '../data/assets';
import { marketService } from '../services/marketDataService';
import { sound } from '../services/soundService';

interface NotificationToast {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  timestamp: number;
}

interface TradingContextType {
  account: PortfolioAccount;
  assets: MarketAsset[];
  selectedAsset: MarketAsset;
  setSelectedAsset: (asset: MarketAsset) => void;
  tradeMode: TradeMode;
  setTradeMode: (mode: TradeMode) => void;
  positions: Position[];
  orders: Order[];
  closedTrades: ClosedTrade[];
  alerts: PriceAlert[];
  notifications: NotificationToast[];
  dismissNotification: (id: string) => void;

  // Financial Metrics
  totalEquityUSD: number;
  availableBalanceUSD: number;
  marginUsedUSD: number;
  unrealizedPnLUSD: number;
  realizedPnLUSD: number;
  marginLevelPercent: number;
  winRatePercent: number;
  profitFactor: number;

  // Trading Actions
  placeSpotOrder: (params: {
    side: OrderSide;
    orderType: OrderType;
    size: number;
    price?: number;
    stopLoss?: number;
    takeProfit?: number;
  }) => { success: boolean; message: string };

  placeFuturesOrder: (params: {
    side: OrderSide;
    orderType: OrderType;
    size: number;
    price?: number;
    leverage: number;
    marginMode: MarginMode;
    stopLoss?: number;
    takeProfit?: number;
    trailingStop?: number;
  }) => { success: boolean; message: string };

  placeOptionsOrder: (params: {
    side: OrderSide;
    strike: number;
    optionType: 'call' | 'put';
    expiry: string;
    contracts: number;
    premium: number;
  }) => { success: boolean; message: string };

  closePosition: (positionId: string, reason?: ClosedTrade['closeReason']) => void;
  cancelOrder: (orderId: string) => void;
  updatePositionTPSL: (positionId: string, tp?: number, sl?: number) => void;
  addAlert: (targetPrice: number, condition: 'above' | 'below', notes?: string) => void;
  removeAlert: (alertId: string) => void;
  toggleFavorite: (symbol: string) => void;
  toggleCurrency: () => void;
  toggleSound: () => void;
  depositVirtualCash: (amountUSD: number) => void;
  resetAccount: () => void;
  formatCurrency: (amount: number, currency?: 'USD' | 'INR') => string;
}

const STORAGE_KEY = 'tradeview_paper_v1';

const DEFAULT_ACCOUNT: PortfolioAccount = {
  balanceUSD: 100000,
  balanceINR: 100000 * USD_TO_INR_RATE,
  displayCurrency: 'USD',
  initialBalanceUSD: 100000,
  riskPerTradePercent: 2,
  maxLeverage: 100,
  soundEnabled: true,
  favorites: ['BTCUSDT', 'ETHUSDT', 'NVDA', 'AAPL', 'RELIANCE', 'TCS'],
};

const TradingContext = createContext<TradingContextType | null>(null);

export const TradingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [assets, setAssets] = useState<MarketAsset[]>(INITIAL_MARKET_ASSETS);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTCUSDT');
  const [tradeMode, setTradeMode] = useState<TradeMode>('spot');

  // Stored state
  const [account, setAccount] = useState<PortfolioAccount>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_account`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_ACCOUNT;
  });

  const [positions, setPositions] = useState<Position[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_positions`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_orders`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [closedTrades, setClosedTrades] = useState<ClosedTrade[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_closed`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [alerts, setAlerts] = useState<PriceAlert[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_alerts`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [notifications, setNotifications] = useState<NotificationToast[]>([]);

  // Refs for tracking synchronous updates in tick handler
  const positionsRef = useRef(positions);
  positionsRef.current = positions;
  const ordersRef = useRef(orders);
  ordersRef.current = orders;
  const alertsRef = useRef(alerts);
  alertsRef.current = alerts;
  const accountRef = useRef(account);
  accountRef.current = account;

  const pushNotification = useCallback((type: NotificationToast['type'], title: string, message: string) => {
    const id = `notif-${Date.now()}-${Math.random()}`;
    const newNotif: NotificationToast = { id, type, title, message, timestamp: Date.now() };
    setNotifications(prev => [newNotif, ...prev.slice(0, 9)]);

    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Sync sound service state
  useEffect(() => {
    sound.setEnabled(account.soundEnabled);
  }, [account.soundEnabled]);

  // Persist storage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_account`, JSON.stringify(account));
    } catch {}
  }, [account]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_positions`, JSON.stringify(positions));
    } catch {}
  }, [positions]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_orders`, JSON.stringify(orders));
    } catch {}
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_closed`, JSON.stringify(closedTrades));
    } catch {}
  }, [closedTrades]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_alerts`, JSON.stringify(alerts));
    } catch {}
  }, [alerts]);

  // Start market data service & subscribe to ticks
  useEffect(() => {
    marketService.start();

    const unsubscribe = marketService.subscribe((updatedAssets, changedSymbol, oldPrice, newPrice) => {
      setAssets([...updatedAssets]);

      // Check pending orders for this asset
      const currentOrders = ordersRef.current;
      const filledOrders: Order[] = [];
      const remainingOrders: Order[] = [];

      currentOrders.forEach(ord => {
        if (ord.assetSymbol !== changedSymbol) {
          remainingOrders.push(ord);
          return;
        }

        let isFilled = false;
        if (ord.orderType === 'limit') {
          if (ord.side === 'buy' && newPrice <= (ord.price || 0)) isFilled = true;
          if (ord.side === 'sell' && newPrice >= (ord.price || 0)) isFilled = true;
        } else if (ord.orderType === 'stop_limit') {
          if (ord.side === 'buy' && newPrice >= (ord.stopPrice || 0)) isFilled = true;
          if (ord.side === 'sell' && newPrice <= (ord.stopPrice || 0)) isFilled = true;
        }

        if (isFilled) {
          filledOrders.push(ord);
        } else {
          remainingOrders.push(ord);
        }
      });

      if (filledOrders.length > 0) {
        setOrders(remainingOrders);
        filledOrders.forEach(ord => {
          sound.playOrderFilled();
          pushNotification('success', 'Order Filled', `${ord.side.toUpperCase()} ${ord.size} ${ord.displayName} @ ${newPrice}`);

          // Create active position
          const isFutures = ord.mode === 'futures';
          const margin = ord.margin;
          const liqPrice = isFutures 
            ? (ord.side === 'buy' 
                ? newPrice * (1 - 0.95 / ord.leverage) 
                : newPrice * (1 + 0.95 / ord.leverage))
            : undefined;

          const newPos: Position = {
            id: `pos-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            assetSymbol: ord.assetSymbol,
            displayName: ord.displayName,
            category: ord.category,
            mode: ord.mode,
            side: ord.side,
            size: ord.size,
            entryPrice: newPrice,
            currentPrice: newPrice,
            margin,
            leverage: ord.leverage,
            marginMode: ord.marginMode,
            liquidationPrice: liqPrice ? Number(liqPrice.toFixed(2)) : undefined,
            stopLoss: ord.stopLoss,
            takeProfit: ord.takeProfit,
            highestPriceSinceOpen: newPrice,
            lowestPriceSinceOpen: newPrice,
            unrealizedPnL: 0,
            unrealizedPnLPercent: 0,
            openTime: Date.now(),
          };

          setPositions(prev => [newPos, ...prev]);
        });
      }

      // Check open positions for price updates, TP/SL, and liquidations
      const currentPositions = positionsRef.current;
      const positionsToKeep: Position[] = [];
      const positionsToClose: { pos: Position; reason: ClosedTrade['closeReason']; exitPrice: number }[] = [];

      currentPositions.forEach(pos => {
        if (pos.assetSymbol !== changedSymbol) {
          positionsToKeep.push(pos);
          return;
        }

        // Check for options position
        if (pos.mode === 'options' && pos.optionDetails) {
          const strike = pos.optionDetails.strike;
          const isCall = pos.optionDetails.optionType === 'call';
          const diff = newPrice - strike;
          const intrinsic = isCall ? Math.max(0, diff) : Math.max(0, -diff);
          const timeValue = newPrice * 0.025 * Math.exp(-Math.pow(diff / (newPrice * 0.08), 2));
          const currentOptionPremium = Number(Math.max(0.05, intrinsic + timeValue).toFixed(2));
          
          const isBuy = pos.side === 'buy';
          const premiumDiff = isBuy ? (currentOptionPremium - pos.entryPrice) : (pos.entryPrice - currentOptionPremium);
          const isINR = pos.category === 'indian_stock';
          const premiumDiffUSD = isINR ? premiumDiff / USD_TO_INR_RATE : premiumDiff;
          
          const unrealizedPnL = Number((premiumDiffUSD * pos.size).toFixed(2));
          const unrealizedPnLPercent = pos.margin > 0 ? Number(((unrealizedPnL / pos.margin) * 100).toFixed(2)) : 0;
          
          positionsToKeep.push({
            ...pos,
            currentPrice: currentOptionPremium,
            highestPriceSinceOpen: Math.max(pos.highestPriceSinceOpen || currentOptionPremium, currentOptionPremium),
            lowestPriceSinceOpen: Math.min(pos.lowestPriceSinceOpen || currentOptionPremium, currentOptionPremium),
            unrealizedPnL,
            unrealizedPnLPercent,
          });
          return;
        }

        const isLong = pos.side === 'buy';
        const priceDiff = isLong ? (newPrice - pos.entryPrice) : (pos.entryPrice - newPrice);
        
        // Convert to USD value if Indian Stock (priced in INR)
        const isINR = pos.category === 'indian_stock';
        const priceDiffInUSD = isINR ? priceDiff / USD_TO_INR_RATE : priceDiff;
        // pos.size is the actual contract/asset quantity, leverage is already factored into margin
        const unrealizedPnL = Number((priceDiffInUSD * pos.size).toFixed(2));
        const unrealizedPnLPercent = pos.margin > 0 ? Number(((unrealizedPnL / pos.margin) * 100).toFixed(2)) : 0;

        const highest = Math.max(pos.highestPriceSinceOpen || newPrice, newPrice);
        const lowest = Math.min(pos.lowestPriceSinceOpen || newPrice, newPrice);

        // Check Liquidation
        if (pos.liquidationPrice && pos.mode === 'futures') {
          const isLiquidated = isLong ? (newPrice <= pos.liquidationPrice) : (newPrice >= pos.liquidationPrice);
          if (isLiquidated) {
            positionsToClose.push({ pos, reason: 'liquidation', exitPrice: newPrice });
            return;
          }
        }

        // Check Take Profit
        if (pos.takeProfit) {
          const tpTriggered = isLong ? (newPrice >= pos.takeProfit) : (newPrice <= pos.takeProfit);
          if (tpTriggered) {
            positionsToClose.push({ pos, reason: 'take_profit', exitPrice: pos.takeProfit });
            return;
          }
        }

        // Check Stop Loss
        if (pos.stopLoss) {
          const slTriggered = isLong ? (newPrice <= pos.stopLoss) : (newPrice >= pos.stopLoss);
          if (slTriggered) {
            positionsToClose.push({ pos, reason: 'stop_loss', exitPrice: pos.stopLoss });
            return;
          }
        }

        // Check Trailing Stop
        if (pos.trailingStop && pos.trailingStop > 0) {
          const trailingDelta = pos.trailingStop;
          const trailingTriggered = isLong 
            ? (newPrice <= highest - trailingDelta) 
            : (newPrice >= lowest + trailingDelta);

          if (trailingTriggered) {
            positionsToClose.push({ pos, reason: 'trailing_stop', exitPrice: newPrice });
            return;
          }
        }

        positionsToKeep.push({
          ...pos,
          currentPrice: newPrice,
          highestPriceSinceOpen: highest,
          lowestPriceSinceOpen: lowest,
          unrealizedPnL,
          unrealizedPnLPercent,
        });
      });

      if (positionsToClose.length > 0) {
        setPositions(positionsToKeep);
        positionsToClose.forEach(({ pos, reason, exitPrice }) => {
          handleAutoClosePosition(pos, exitPrice, reason);
        });
      } else {
        setPositions(positionsToKeep);
      }

      // Check Price Alerts
      const currentAlerts = alertsRef.current;
      let alertsModified = false;
      const updatedAlerts = currentAlerts.map(alert => {
        if (alert.assetSymbol === changedSymbol && !alert.triggered) {
          let triggered = false;
          if (alert.condition === 'above' && newPrice >= alert.targetPrice) triggered = true;
          if (alert.condition === 'below' && newPrice <= alert.targetPrice) triggered = true;

          if (triggered) {
            alertsModified = true;
            sound.playAlert();
            pushNotification(
              'warning',
              'Price Alert Triggered',
              `${alert.displayName} is now ${alert.condition} ${alert.targetPrice} (Price: ${newPrice})`
            );
            return { ...alert, triggered: true };
          }
        }
        return alert;
      });

      if (alertsModified) {
        setAlerts(updatedAlerts);
      }
    });

    return () => {
      unsubscribe();
      marketService.stop();
    };
  }, [pushNotification]);

  const handleAutoClosePosition = useCallback((pos: Position, exitPrice: number, reason: ClosedTrade['closeReason']) => {
    const isINR = pos.category === 'indian_stock';
    let realizedPnL: number;
    let actualExitPrice = exitPrice;

    if (pos.mode === 'options') {
      actualExitPrice = pos.currentPrice;
      const isBuy = pos.side === 'buy';
      const premiumDiff = isBuy ? (actualExitPrice - pos.entryPrice) : (pos.entryPrice - actualExitPrice);
      const diffUSD = isINR ? premiumDiff / USD_TO_INR_RATE : premiumDiff;
      realizedPnL = Number((diffUSD * pos.size).toFixed(2));
    } else {
      const isLong = pos.side === 'buy';
      const diff = isLong ? (exitPrice - pos.entryPrice) : (pos.entryPrice - exitPrice);
      const diffUSD = isINR ? diff / USD_TO_INR_RATE : diff;
      // pos.size is the position quantity, leverage is factored into the initial margin
      realizedPnL = Number((diffUSD * pos.size).toFixed(2));
    }

    if (reason === 'liquidation') {
      realizedPnL = -pos.margin; // Total loss of margin on liquidation
      sound.playLiquidationWarning();
      pushNotification('error', 'Position Liquidated!', `${pos.displayName} position hit liquidation price @ ${exitPrice}. Loss: -$${pos.margin.toFixed(2)}`);
    } else {
      if (realizedPnL >= 0) {
        sound.playOrderFilled();
        pushNotification('success', `Position Closed (${reason.replace('_', ' ')})`, `Realized Profit: +$${realizedPnL.toFixed(2)} on ${pos.displayName}`);
      } else {
        pushNotification('warning', `Position Closed (${reason.replace('_', ' ')})`, `Realized Loss: -$${Math.abs(realizedPnL).toFixed(2)} on ${pos.displayName}`);
      }
    }

    const realizedPnLPercent = pos.margin > 0 ? Number(((realizedPnL / pos.margin) * 100).toFixed(2)) : 0;

    const closed: ClosedTrade = {
      id: `ct-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      assetSymbol: pos.assetSymbol,
      displayName: pos.displayName,
      category: pos.category,
      mode: pos.mode,
      side: pos.side,
      size: pos.size,
      entryPrice: pos.entryPrice,
      exitPrice: actualExitPrice,
      leverage: pos.leverage,
      margin: pos.margin,
      realizedPnL,
      realizedPnLPercent,
      openTime: pos.openTime,
      closeTime: Date.now(),
      closeReason: reason,
      optionDetails: pos.optionDetails,
    };

    setClosedTrades(prev => [closed, ...prev]);

    // Update account balance
    setAccount(prev => {
      const newBalUSD = Math.max(0, prev.balanceUSD + realizedPnL);
      return {
        ...prev,
        balanceUSD: Number(newBalUSD.toFixed(2)),
        balanceINR: Number((newBalUSD * USD_TO_INR_RATE).toFixed(2)),
      };
    });
  }, [pushNotification]);

  // Selected asset
  const selectedAsset = useMemo(() => {
    return assets.find(a => a.symbol === selectedSymbol) || assets[0];
  }, [assets, selectedSymbol]);

  const setSelectedAsset = useCallback((asset: MarketAsset) => {
    setSelectedSymbol(asset.symbol);
  }, []);

  // Financial Metrics Calculation
  const marginUsedUSD = useMemo(() => {
    return positions.reduce((acc, p) => acc + p.margin, 0);
  }, [positions]);

  const unrealizedPnLUSD = useMemo(() => {
    return positions.reduce((acc, p) => acc + p.unrealizedPnL, 0);
  }, [positions]);

  const realizedPnLUSD = useMemo(() => {
    return closedTrades.reduce((acc, t) => acc + t.realizedPnL, 0);
  }, [closedTrades]);

  const totalEquityUSD = useMemo(() => {
    return Number((account.balanceUSD + unrealizedPnLUSD).toFixed(2));
  }, [account.balanceUSD, unrealizedPnLUSD]);

  const availableBalanceUSD = useMemo(() => {
    return Math.max(0, Number((account.balanceUSD - marginUsedUSD).toFixed(2)));
  }, [account.balanceUSD, marginUsedUSD]);

  const marginLevelPercent = useMemo(() => {
    if (marginUsedUSD <= 0) return 999;
    return Number(((totalEquityUSD / marginUsedUSD) * 100).toFixed(1));
  }, [totalEquityUSD, marginUsedUSD]);

  const { winRatePercent, profitFactor } = useMemo(() => {
    if (closedTrades.length === 0) return { winRatePercent: 0, profitFactor: 0 };
    const wins = closedTrades.filter(t => t.realizedPnL > 0);
    const losses = closedTrades.filter(t => t.realizedPnL < 0);
    const totalWinUSD = wins.reduce((acc, w) => acc + w.realizedPnL, 0);
    const totalLossUSD = Math.abs(losses.reduce((acc, l) => acc + l.realizedPnL, 0));

    const winRate = (wins.length / closedTrades.length) * 100;
    const pf = totalLossUSD > 0 ? totalWinUSD / totalLossUSD : (totalWinUSD > 0 ? 10 : 0);

    return {
      winRatePercent: Number(winRate.toFixed(1)),
      profitFactor: Number(pf.toFixed(2)),
    };
  }, [closedTrades]);

  // Place Spot Order
  const placeSpotOrder = useCallback((params: {
    side: OrderSide;
    orderType: OrderType;
    size: number;
    price?: number;
    stopLoss?: number;
    takeProfit?: number;
  }) => {
    const asset = selectedAsset;
    const orderPrice = params.orderType === 'market' ? asset.price : (params.price || asset.price);
    const isINR = asset.category === 'indian_stock';
    const notionalUSD = (orderPrice * params.size) / (isINR ? USD_TO_INR_RATE : 1);

    if (notionalUSD > availableBalanceUSD) {
      pushNotification('error', 'Insufficient Funds', `Available: $${availableBalanceUSD.toFixed(2)}, Required: $${notionalUSD.toFixed(2)}`);
      return { success: false, message: 'Insufficient available virtual funds.' };
    }

    if (params.orderType === 'market') {
      sound.playOrderFilled();
      const newPos: Position = {
        id: `pos-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        assetSymbol: asset.symbol,
        displayName: asset.displayName,
        category: asset.category,
        mode: 'spot',
        side: params.side,
        size: params.size,
        entryPrice: asset.price,
        currentPrice: asset.price,
        margin: notionalUSD,
        leverage: 1,
        marginMode: 'isolated',
        stopLoss: params.stopLoss,
        takeProfit: params.takeProfit,
        highestPriceSinceOpen: asset.price,
        lowestPriceSinceOpen: asset.price,
        unrealizedPnL: 0,
        unrealizedPnLPercent: 0,
        openTime: Date.now(),
      };

      setPositions(prev => [newPos, ...prev]);
      pushNotification('success', 'Market Order Executed', `${params.side.toUpperCase()} ${params.size} ${asset.displayName} @ ${asset.price}`);
      return { success: true, message: 'Market order executed immediately.' };
    } else {
      sound.playOrderPlaced();
      const newOrder: Order = {
        id: `ord-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        assetSymbol: asset.symbol,
        displayName: asset.displayName,
        category: asset.category,
        mode: 'spot',
        side: params.side,
        orderType: params.orderType,
        price: params.price,
        size: params.size,
        margin: notionalUSD,
        leverage: 1,
        marginMode: 'isolated',
        stopLoss: params.stopLoss,
        takeProfit: params.takeProfit,
        status: 'pending',
        createdAt: Date.now(),
      };

      setOrders(prev => [newOrder, ...prev]);
      pushNotification('info', 'Limit Order Placed', `${params.side.toUpperCase()} ${params.size} ${asset.displayName} @ ${params.price}`);
      return { success: true, message: 'Limit order placed successfully.' };
    }
  }, [selectedAsset, availableBalanceUSD, pushNotification]);

  // Place Futures / Margin Order
  const placeFuturesOrder = useCallback((params: {
    side: OrderSide;
    orderType: OrderType;
    size: number;
    price?: number;
    leverage: number;
    marginMode: MarginMode;
    stopLoss?: number;
    takeProfit?: number;
    trailingStop?: number;
  }) => {
    const asset = selectedAsset;
    const orderPrice = params.orderType === 'market' ? asset.price : (params.price || asset.price);
    const isINR = asset.category === 'indian_stock';
    const notionalUSD = (orderPrice * params.size) / (isINR ? USD_TO_INR_RATE : 1);
    const requiredMargin = notionalUSD / params.leverage;

    if (requiredMargin > availableBalanceUSD) {
      pushNotification('error', 'Insufficient Margin', `Available: $${availableBalanceUSD.toFixed(2)}, Required Margin: $${requiredMargin.toFixed(2)}`);
      return { success: false, message: 'Insufficient available margin.' };
    }

    const isLong = params.side === 'buy';
    // Liquidation price calculation with 5% maintenance margin buffer
    const liqPrice = isLong 
      ? orderPrice * (1 - 0.95 / params.leverage) 
      : orderPrice * (1 + 0.95 / params.leverage);

    if (params.orderType === 'market') {
      sound.playOrderFilled();
      const newPos: Position = {
        id: `pos-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        assetSymbol: asset.symbol,
        displayName: asset.displayName,
        category: asset.category,
        mode: 'futures',
        side: params.side,
        size: params.size,
        entryPrice: asset.price,
        currentPrice: asset.price,
        margin: Number(requiredMargin.toFixed(2)),
        leverage: params.leverage,
        marginMode: params.marginMode,
        liquidationPrice: Number(liqPrice.toFixed(asset.decimals)),
        stopLoss: params.stopLoss,
        takeProfit: params.takeProfit,
        trailingStop: params.trailingStop,
        highestPriceSinceOpen: asset.price,
        lowestPriceSinceOpen: asset.price,
        unrealizedPnL: 0,
        unrealizedPnLPercent: 0,
        openTime: Date.now(),
      };

      setPositions(prev => [newPos, ...prev]);
      pushNotification('success', 'Futures Position Opened', `${params.leverage}x ${isLong ? 'LONG' : 'SHORT'} ${params.size} ${asset.displayName} @ ${asset.price}`);
      return { success: true, message: `Opened ${params.leverage}x ${isLong ? 'Long' : 'Short'} position.` };
    } else {
      sound.playOrderPlaced();
      const newOrder: Order = {
        id: `ord-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        assetSymbol: asset.symbol,
        displayName: asset.displayName,
        category: asset.category,
        mode: 'futures',
        side: params.side,
        orderType: params.orderType,
        price: params.price,
        size: params.size,
        margin: Number(requiredMargin.toFixed(2)),
        leverage: params.leverage,
        marginMode: params.marginMode,
        stopLoss: params.stopLoss,
        takeProfit: params.takeProfit,
        status: 'pending',
        createdAt: Date.now(),
      };

      setOrders(prev => [newOrder, ...prev]);
      pushNotification('info', 'Futures Limit Order Placed', `${params.leverage}x ${params.side.toUpperCase()} ${params.size} ${asset.displayName} @ ${params.price}`);
      return { success: true, message: 'Futures limit order placed.' };
    }
  }, [selectedAsset, availableBalanceUSD, pushNotification]);

  // Place Options Order
  const placeOptionsOrder = useCallback((params: {
    side: OrderSide;
    strike: number;
    optionType: 'call' | 'put';
    expiry: string;
    contracts: number;
    premium: number;
  }) => {
    const asset = selectedAsset;
    const isINR = asset.category === 'indian_stock';
    const contractMultiplier = asset.lotSize || 100;
    const totalPremiumUSD = (params.premium * params.contracts * contractMultiplier) / (isINR ? USD_TO_INR_RATE : 1);

    if (params.side === 'buy' && totalPremiumUSD > availableBalanceUSD) {
      pushNotification('error', 'Insufficient Funds', `Premium Required: $${totalPremiumUSD.toFixed(2)}, Available: $${availableBalanceUSD.toFixed(2)}`);
      return { success: false, message: 'Insufficient funds to pay option premium.' };
    }

    sound.playOrderFilled();
    const newPos: Position = {
      id: `pos-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      assetSymbol: asset.symbol,
      displayName: `${asset.displayName} ${params.strike} ${params.optionType.toUpperCase()}`,
      category: asset.category,
      mode: 'options',
      side: params.side,
      size: params.contracts * contractMultiplier,
      entryPrice: params.premium,
      currentPrice: params.premium,
      margin: Number(totalPremiumUSD.toFixed(2)),
      leverage: 1,
      marginMode: 'isolated',
      unrealizedPnL: 0,
      unrealizedPnLPercent: 0,
      openTime: Date.now(),
      optionDetails: {
        strike: params.strike,
        optionType: params.optionType,
        expiry: params.expiry,
        contracts: params.contracts,
        premium: params.premium,
      },
    };

    setPositions(prev => [newPos, ...prev]);
    pushNotification('success', 'Options Contract Executed', `${params.side.toUpperCase()} ${params.contracts}x ${params.strike} ${params.optionType.toUpperCase()} @ ${params.premium}`);
    return { success: true, message: 'Option position executed.' };
  }, [selectedAsset, availableBalanceUSD, pushNotification]);

  // Manual Close Position
  const closePosition = useCallback((positionId: string, reason: ClosedTrade['closeReason'] = 'market_close') => {
    const pos = positions.find(p => p.id === positionId);
    if (!pos) return;

    setPositions(prev => prev.filter(p => p.id !== positionId));
    handleAutoClosePosition(pos, pos.currentPrice, reason);
  }, [positions, handleAutoClosePosition]);

  // Cancel Pending Order
  const cancelOrder = useCallback((orderId: string) => {
    const ord = orders.find(o => o.id === orderId);
    if (ord) {
      setOrders(prev => prev.filter(o => o.id !== orderId));
      pushNotification('info', 'Order Cancelled', `Cancelled ${ord.side.toUpperCase()} ${ord.size} ${ord.displayName}`);
    }
  }, [orders, pushNotification]);

  // Update TP/SL on open position
  const updatePositionTPSL = useCallback((positionId: string, tp?: number, sl?: number) => {
    setPositions(prev => prev.map(pos => {
      if (pos.id === positionId) {
        return {
          ...pos,
          takeProfit: tp !== undefined ? tp : pos.takeProfit,
          stopLoss: sl !== undefined ? sl : pos.stopLoss,
        };
      }
      return pos;
    }));
    pushNotification('success', 'Risk Levels Updated', `TP / SL modified successfully.`);
  }, [pushNotification]);

  // Alerts
  const addAlert = useCallback((targetPrice: number, condition: 'above' | 'below', notes?: string) => {
    const newAlert: PriceAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      assetSymbol: selectedAsset.symbol,
      displayName: selectedAsset.displayName,
      targetPrice,
      condition,
      createdAt: Date.now(),
      triggered: false,
      notes,
    };
    setAlerts(prev => [newAlert, ...prev]);
    sound.playOrderPlaced();
    pushNotification('info', 'Price Alert Set', `Alert when ${selectedAsset.displayName} goes ${condition} ${targetPrice}`);
  }, [selectedAsset, pushNotification]);

  const removeAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  }, []);

  // Favorites
  const toggleFavorite = useCallback((symbol: string) => {
    setAccount(prev => {
      const exists = prev.favorites.includes(symbol);
      const updated = exists 
        ? prev.favorites.filter(s => s !== symbol) 
        : [...prev.favorites, symbol];
      return { ...prev, favorites: updated };
    });
  }, []);

  // Currency Toggle
  const toggleCurrency = useCallback(() => {
    setAccount(prev => ({
      ...prev,
      displayCurrency: prev.displayCurrency === 'USD' ? 'INR' : 'USD',
    }));
  }, []);

  // Sound Toggle
  const toggleSound = useCallback(() => {
    setAccount(prev => {
      const nextVal = !prev.soundEnabled;
      sound.setEnabled(nextVal);
      return { ...prev, soundEnabled: nextVal };
    });
  }, []);

  // Deposit Virtual Funds
  const depositVirtualCash = useCallback((amountUSD: number) => {
    setAccount(prev => {
      const newBal = prev.balanceUSD + amountUSD;
      return {
        ...prev,
        balanceUSD: Number(newBal.toFixed(2)),
        balanceINR: Number((newBal * USD_TO_INR_RATE).toFixed(2)),
      };
    });
    sound.playOrderFilled();
    pushNotification('success', 'Virtual Funds Added', `Deposited $${amountUSD.toLocaleString()} virtual money to account.`);
  }, [pushNotification]);

  // Reset Account
  const resetAccount = useCallback(() => {
    setAccount(DEFAULT_ACCOUNT);
    setPositions([]);
    setOrders([]);
    setClosedTrades([]);
    setAlerts([]);
    pushNotification('info', 'Account Reset', 'Paper trading balance and records reset to default $100,000 USD.');
  }, [pushNotification]);

  // Currency Formatter
  const formatCurrency = useCallback((amount: number, overrideCurrency?: 'USD' | 'INR'): string => {
    const currency = overrideCurrency || account.displayCurrency;
    if (currency === 'INR') {
      const inrValue = amount * (overrideCurrency ? 1 : USD_TO_INR_RATE);
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2,
      }).format(inrValue);
    }

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(amount);
  }, [account.displayCurrency]);

  const value = {
    account,
    assets,
    selectedAsset,
    setSelectedAsset,
    tradeMode,
    setTradeMode,
    positions,
    orders,
    closedTrades,
    alerts,
    notifications,
    dismissNotification,
    totalEquityUSD,
    availableBalanceUSD,
    marginUsedUSD,
    unrealizedPnLUSD,
    realizedPnLUSD,
    marginLevelPercent,
    winRatePercent,
    profitFactor,
    placeSpotOrder,
    placeFuturesOrder,
    placeOptionsOrder,
    closePosition,
    cancelOrder,
    updatePositionTPSL,
    addAlert,
    removeAlert,
    toggleFavorite,
    toggleCurrency,
    toggleSound,
    depositVirtualCash,
    resetAccount,
    formatCurrency,
  };

  return (
    <TradingContext.Provider value={value}>
      {children}
    </TradingContext.Provider>
  );
};

export const useTrading = (): TradingContextType => {
  const context = useContext(TradingContext);
  if (!context) {
    throw new Error('useTrading must be used within a TradingProvider');
  }
  return context;
};
