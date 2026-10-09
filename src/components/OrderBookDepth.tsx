import React, { useState, useEffect } from 'react';
import { useTrading } from '../context/TradingContext';
import { marketService, OrderBookData, RecentTrade } from '../services/marketDataService';
import { Layers, History } from 'lucide-react';

export const OrderBookDepth: React.FC = () => {
  const { selectedAsset } = useTrading();
  const selectedAssetRef = React.useRef(selectedAsset);
  selectedAssetRef.current = selectedAsset;

  const [orderBook, setOrderBook] = useState<OrderBookData>(() => marketService.getOrderBook(selectedAsset));
  const [recentTrades, setRecentTrades] = useState<RecentTrade[]>(() => marketService.getRecentTrades(selectedAsset));
  const [viewTab, setViewTab] = useState<'book' | 'trades'>('book');

  useEffect(() => {
    setOrderBook(marketService.getOrderBook(selectedAsset));
    setRecentTrades(marketService.getRecentTrades(selectedAsset));

    const interval = setInterval(() => {
      const currentAsset = selectedAssetRef.current;
      setOrderBook(marketService.getOrderBook(currentAsset));
      // Add random trade to tape
      const side: 'buy' | 'sell' = Math.random() > 0.5 ? 'buy' : 'sell';
      const delta = (Math.random() - 0.5) * (currentAsset.price * 0.0004);
      const newTrade: RecentTrade = {
        id: `t-${Date.now()}`,
        price: Number((currentAsset.price + delta).toFixed(currentAsset.decimals)),
        size: Number((currentAsset.lotSize * (0.5 + Math.random() * 2.5)).toFixed(currentAsset.minQty < 1 ? 3 : 0)),
        time: new Date().toTimeString().split(' ')[0],
        side,
      };

      setRecentTrades(prev => [newTrade, ...prev.slice(0, 15)]);
    }, 1500);

    return () => clearInterval(interval);
  }, [selectedAsset.symbol]);

  const currencySymbol = selectedAsset.quoteCurrency === 'INR' ? '₹' : '$';

  return (
    <div className="w-64 h-full bg-[#1e222d] border-l border-[#2a2e39] flex flex-col select-none text-[11px] font-mono shrink-0">
      {/* Header Tabs */}
      <div className="flex border-b border-[#2a2e39] bg-[#171b26] p-1 gap-1">
        <button
          onClick={() => setViewTab('book')}
          className={`flex-1 py-1 rounded font-sans font-semibold text-center transition-colors flex items-center justify-center space-x-1 ${
            viewTab === 'book' ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:text-white'
          }`}
        >
          <Layers className="w-3 h-3" />
          <span>Order Book</span>
        </button>
        <button
          onClick={() => setViewTab('trades')}
          className={`flex-1 py-1 rounded font-sans font-semibold text-center transition-colors flex items-center justify-center space-x-1 ${
            viewTab === 'trades' ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:text-white'
          }`}
        >
          <History className="w-3 h-3" />
          <span>Trades</span>
        </button>
      </div>

      {viewTab === 'book' ? (
        <div className="flex-1 flex flex-col justify-between p-2 overflow-hidden">
          {/* Column Titles */}
          <div className="flex justify-between text-[10px] text-[#787b86] pb-1 border-b border-[#2a2e39]">
            <span>Price ({selectedAsset.quoteCurrency})</span>
            <span>Size</span>
            <span>Total</span>
          </div>

          {/* Asks (Sells) - Reversed so highest is top */}
          <div className="flex-1 flex flex-col justify-end space-y-0.5 overflow-hidden py-1">
            {[...orderBook.asks].reverse().slice(0, 7).map((ask, idx) => (
              <div key={idx} className="relative flex justify-between items-center px-1 py-0.5 group">
                <div 
                  className="absolute right-0 top-0 bottom-0 bg-[#f23645]/15 transition-all"
                  style={{ width: `${ask.percent}%` }}
                />
                <span className="text-[#f23645] font-semibold relative z-10">
                  {ask.price.toFixed(selectedAsset.decimals)}
                </span>
                <span className="text-[#d1d4dc] relative z-10">
                  {ask.size}
                </span>
                <span className="text-[#787b86] text-[10px] relative z-10">
                  {ask.total.toFixed(selectedAsset.minQty < 1 ? 2 : 0)}
                </span>
              </div>
            ))}
          </div>

          {/* Mid-Market Spread Indicator */}
          <div className="py-1.5 my-1 bg-[#131722] border-y border-[#2a2e39] px-2 flex items-center justify-between font-bold">
            <span className={`text-xs ${selectedAsset.changePercent24h >= 0 ? 'text-[#089981]' : 'text-[#f23645]'}`}>
              {currencySymbol}{selectedAsset.price.toFixed(selectedAsset.decimals)}
            </span>
            <span className="text-[10px] text-[#787b86] font-normal">
              Spread: {orderBook.spread.toFixed(selectedAsset.decimals)} ({orderBook.spreadPercent}%)
            </span>
          </div>

          {/* Bids (Buys) */}
          <div className="flex-1 flex flex-col space-y-0.5 overflow-hidden py-1">
            {orderBook.bids.slice(0, 7).map((bid, idx) => (
              <div key={idx} className="relative flex justify-between items-center px-1 py-0.5 group">
                <div 
                  className="absolute right-0 top-0 bottom-0 bg-[#089981]/15 transition-all"
                  style={{ width: `${bid.percent}%` }}
                />
                <span className="text-[#089981] font-semibold relative z-10">
                  {bid.price.toFixed(selectedAsset.decimals)}
                </span>
                <span className="text-[#d1d4dc] relative z-10">
                  {bid.size}
                </span>
                <span className="text-[#787b86] text-[10px] relative z-10">
                  {bid.total.toFixed(selectedAsset.minQty < 1 ? 2 : 0)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Recent Trades Tape */
        <div className="flex-1 flex flex-col p-2 overflow-hidden">
          <div className="flex justify-between text-[10px] text-[#787b86] pb-1 border-b border-[#2a2e39]">
            <span>Price ({selectedAsset.quoteCurrency})</span>
            <span>Size</span>
            <span>Time</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 py-1 divide-y divide-[#2a2e39]/30">
            {recentTrades.map(t => (
              <div key={t.id} className="flex justify-between items-center py-1">
                <span className={`font-semibold ${t.side === 'buy' ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                  {t.price.toFixed(selectedAsset.decimals)}
                </span>
                <span className="text-[#d1d4dc]">{t.size}</span>
                <span className="text-[#787b86] text-[10px]">{t.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
