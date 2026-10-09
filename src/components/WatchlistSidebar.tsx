import React, { useState, useMemo } from 'react';
import { useTrading } from '../context/TradingContext';
import { MarketAsset, AssetCategory } from '../types';
import { Search, Star, TrendingUp, TrendingDown, X } from 'lucide-react';

interface WatchlistSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'all' | 'crypto' | 'us_stock' | 'indian_stock' | 'favorites';

export const WatchlistSidebar: React.FC<WatchlistSidebarProps> = ({ isOpen, onClose }) => {
  const { assets, selectedAsset, setSelectedAsset, account, toggleFavorite } = useTrading();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      // Tab filter
      if (activeTab === 'favorites') {
        if (!account.favorites.includes(asset.symbol)) return false;
      } else if (activeTab !== 'all') {
        if (asset.category !== activeTab) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          asset.symbol.toLowerCase().includes(q) ||
          asset.name.toLowerCase().includes(q) ||
          asset.displayName.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [assets, activeTab, searchQuery, account.favorites]);

  if (!isOpen) return null;

  return (
    <aside className="w-full lg:w-80 h-full bg-[#1e222d] border-r border-[#2a2e39] flex flex-col z-20 shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#2a2e39]">
        <div className="flex items-center space-x-1.5">
          <span className="font-bold text-sm text-white">Watchlist</span>
          <span className="text-[11px] text-[#787b86] font-mono">({filteredAssets.length})</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-[#787b86] hover:text-white hover:bg-[#2a2e39] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#2a2e39] bg-[#171b26] p-1 gap-1 text-[11px] overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-2 py-1 rounded font-medium transition-colors ${
            activeTab === 'all' ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:text-white'
          }`}
        >
          All (30)
        </button>
        <button
          onClick={() => setActiveTab('crypto')}
          className={`px-2 py-1 rounded font-medium transition-colors ${
            activeTab === 'crypto' ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:text-white'
          }`}
        >
          Crypto (10)
        </button>
        <button
          onClick={() => setActiveTab('us_stock')}
          className={`px-2 py-1 rounded font-medium transition-colors ${
            activeTab === 'us_stock' ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:text-white'
          }`}
        >
          US (10)
        </button>
        <button
          onClick={() => setActiveTab('indian_stock')}
          className={`px-2 py-1 rounded font-medium transition-colors ${
            activeTab === 'indian_stock' ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:text-white'
          }`}
        >
          Indian (10)
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={`px-2 py-1 rounded font-medium transition-colors flex items-center space-x-1 ${
            activeTab === 'favorites' ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:text-white'
          }`}
        >
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span>★</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="p-2 border-b border-[#2a2e39]">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-2.5 text-[#787b86]" />
          <input
            type="text"
            placeholder="Search crypto, US & Indian stocks..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#131722] border border-[#2a2e39] rounded pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-[#787b86] focus:outline-none focus:border-[#2962ff] transition-colors"
          />
        </div>
      </div>

      {/* Asset List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#2a2e39]/50">
        {filteredAssets.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#787b86]">
            No assets found matching your criteria.
          </div>
        ) : (
          filteredAssets.map(asset => {
            const isSelected = asset.symbol === selectedAsset.symbol;
            const isFavorite = account.favorites.includes(asset.symbol);
            const isBullish = asset.changePercent24h >= 0;
            const currencyPrefix = asset.quoteCurrency === 'INR' ? '₹' : '$';

            return (
              <div
                key={asset.symbol}
                onClick={() => setSelectedAsset(asset)}
                className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-all hover:bg-[#2a2e39]/60 ${
                  isSelected ? 'bg-[#2a2e39] border-l-2 border-[#2962ff]' : ''
                } ${asset.tickTrend === 'up' ? 'flash-up' : asset.tickTrend === 'down' ? 'flash-down' : ''}`}
              >
                {/* Left: Star + Symbol info */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(asset.symbol);
                    }}
                    className="p-1 text-[#787b86] hover:text-amber-400 transition-colors"
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`}
                    />
                  </button>

                  <div>
                    <div className="flex items-center space-x-1">
                      <span className="font-bold text-xs text-white">{asset.displayName}</span>
                      <span className="text-[10px] text-[#787b86] px-1 py-0.2 rounded bg-[#131722]">
                        {asset.category === 'crypto' ? 'CRYPTO' : asset.category === 'indian_stock' ? 'NSE' : 'US'}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#787b86] truncate max-w-[120px]">
                      {asset.name}
                    </div>
                  </div>
                </div>

                {/* Right: Price + % Change */}
                <div className="text-right">
                  <div className="font-mono text-xs font-semibold text-white">
                    {currencyPrefix}
                    {asset.price.toLocaleString(undefined, {
                      minimumFractionDigits: asset.decimals,
                      maximumFractionDigits: asset.decimals,
                    })}
                  </div>
                  <div className={`font-mono text-[10px] font-medium flex items-center justify-end ${
                    isBullish ? 'text-[#089981]' : 'text-[#f23645]'
                  }`}>
                    {isBullish ? '+' : ''}{asset.changePercent24h.toFixed(2)}%
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
