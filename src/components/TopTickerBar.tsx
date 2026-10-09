import React from 'react';
import { useTrading } from '../context/TradingContext';
import { 
  TrendingUp, 
  Volume2, 
  VolumeX, 
  DollarSign, 
  RotateCcw, 
  PlusCircle, 
  Bell, 
  LineChart, 
  Layers, 
  ArrowUpRight, 
  ArrowDownRight,
  List,
  Newspaper
} from 'lucide-react';

interface TopTickerBarProps {
  chartEngine: 'tradingview' | 'custom';
  setChartEngine: (engine: 'tradingview' | 'custom') => void;
  onOpenAlertModal: () => void;
  onOpenDepositModal: () => void;
  onOpenResetModal: () => void;
  onToggleWatchlist: () => void;
  onToggleTradePanel?: () => void;
  isTradePanelOpen?: boolean;
  onReturnToLanding?: () => void;
}

export const TopTickerBar: React.FC<TopTickerBarProps> = ({
  chartEngine,
  setChartEngine,
  onOpenAlertModal,
  onOpenDepositModal,
  onOpenResetModal,
  onToggleWatchlist,
  onToggleTradePanel,
  isTradePanelOpen = true,
  onReturnToLanding,
}) => {
  const { 
    account, 
    totalEquityUSD, 
    availableBalanceUSD, 
    unrealizedPnLUSD, 
    winRatePercent,
    formatCurrency, 
    toggleCurrency, 
    toggleSound,
    alerts,
    selectedAsset
  } = useTrading();

  const activeAlertsCount = alerts.filter(a => !a.triggered).length;
  const isBullish = selectedAsset.changePercent24h >= 0;
  const currencyPrefix = selectedAsset.quoteCurrency === 'INR' ? '₹' : '$';

  return (
    <header className="w-full bg-[#1e222d] border-b border-[#2a2e39] select-none z-30 shrink-0">
      {/* 1. Top indices ticker tape (Desktop & Tablet) */}
      <div className="hidden sm:flex items-center justify-between px-3 py-1 bg-[#131722] border-b border-[#2a2e39] text-[11px] font-mono overflow-x-auto no-scrollbar gap-4">
        <div className="flex items-center space-x-6 min-w-max">
          <div 
            onClick={onReturnToLanding}
            className={`flex items-center space-x-1.5 ${onReturnToLanding ? 'cursor-pointer hover:opacity-85 transition-opacity' : ''}`}
            title="Return to Wall Street Overview & News"
          >
            <span className="w-2 h-2 rounded-full bg-[#089981] animate-pulse" />
            <span className="font-sans font-bold text-xs text-white">TRADEVIEW PRO</span>
            <span className="bg-[#c59b27]/20 text-[#e5b869] border border-[#c59b27]/30 px-1.5 py-0.2 rounded font-sans text-[10px] font-semibold">WALL ST. EDITION</span>
          </div>

          <div className="h-3 w-[1px] bg-[#2a2e39]" />

          {/* Indices ticker */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <span className="text-[#787b86]">S&P 500:</span>
              <span className="text-white font-medium">5,620.40</span>
              <span className="text-[#089981] text-[10px] flex items-center">+0.42%</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-[#787b86]">NIFTY 50:</span>
              <span className="text-white font-medium">25,410.80</span>
              <span className="text-[#089981] text-[10px] flex items-center">+0.68%</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-[#787b86]">BTC/USD:</span>
              <span className="text-white font-medium">$68,450</span>
              <span className="text-[#089981] text-[10px] flex items-center">+2.73%</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-[#787b86]">GOLD:</span>
              <span className="text-white font-medium">$2,580.20</span>
              <span className="text-[#f23645] text-[10px] flex items-center">-0.15%</span>
            </div>
          </div>
        </div>

        {/* Chart Engine Switcher (Desktop) */}
        <div className="flex items-center space-x-1.5 min-w-max">
          <span className="text-[#787b86] text-[11px] font-sans">Engine:</span>
          <div className="bg-[#1e222d] p-0.5 rounded border border-[#2a2e39] flex items-center">
            <button
              onClick={() => setChartEngine('tradingview')}
              className={`px-2 py-0.5 rounded text-[10px] font-sans font-medium transition-colors flex items-center space-x-1 cursor-pointer ${
                chartEngine === 'tradingview' ? 'bg-[#2962ff] text-white shadow-sm' : 'text-[#787b86] hover:text-white'
              }`}
            >
              <span className="icon-bounce"><LineChart className="w-3 h-3" /></span>
              <span>TradingView</span>
            </button>
            <button
              onClick={() => setChartEngine('custom')}
              className={`px-2 py-0.5 rounded text-[10px] font-sans font-medium transition-colors flex items-center space-x-1 cursor-pointer ${
                chartEngine === 'custom' ? 'bg-[#2962ff] text-white shadow-sm' : 'text-[#787b86] hover:text-white'
              }`}
            >
              <span className="icon-bounce"><Layers className="w-3 h-3" /></span>
              <span>Canvas Chart</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Desktop Bar (lg:flex) */}
      <div className="hidden lg:flex items-center justify-between px-3 py-2 gap-3">
        {/* Left: Watchlist Button + Active Asset Chip */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={onToggleWatchlist}
            className="px-2.5 py-1.5 rounded bg-[#2a2e39] hover:bg-[#363a45] text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <span className="icon-bounce"><List className="w-3.5 h-3.5 text-[#2962ff]" /></span>
            <span>Watchlist (30)</span>
          </button>

          <div className="flex items-center bg-[#131722] px-2.5 py-1 rounded border border-[#2a2e39] text-xs">
            <span className="font-bold text-white mr-1.5">{selectedAsset.displayName}</span>
            <span className="text-[#787b86] mr-2">({selectedAsset.name})</span>
            <span className={`font-mono font-semibold ${isBullish ? 'text-[#089981]' : 'text-[#f23645]'}`}>
              {currencyPrefix}{selectedAsset.price.toLocaleString(undefined, { minimumFractionDigits: selectedAsset.decimals, maximumFractionDigits: selectedAsset.decimals })}
            </span>
            <span className={`ml-1.5 font-mono text-[11px] px-1 py-0.2 rounded ${
              isBullish ? 'bg-[#089981]/15 text-[#089981]' : 'bg-[#f23645]/15 text-[#f23645]'
            }`}>
              {isBullish ? '+' : ''}{selectedAsset.changePercent24h.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Center: Account Metrics */}
        <div className="flex items-center space-x-4 text-xs overflow-x-auto no-scrollbar py-0.5">
          {/* Virtual Equity */}
          <div className="flex flex-col">
            <span className="text-[10px] text-[#787b86] uppercase font-semibold">Virtual Equity</span>
            <span className="font-mono font-bold text-white text-sm">
              {formatCurrency(totalEquityUSD)}
            </span>
          </div>

          <div className="h-6 w-[1px] bg-[#2a2e39]" />

          {/* Available Cash */}
          <div className="flex flex-col">
            <span className="text-[10px] text-[#787b86] uppercase font-semibold">Available Cash</span>
            <span className="font-mono font-semibold text-[#d1d4dc]">
              {formatCurrency(availableBalanceUSD)}
            </span>
          </div>

          <div className="h-6 w-[1px] bg-[#2a2e39]" />

          {/* Unrealized P&L */}
          <div className="flex flex-col">
            <span className="text-[10px] text-[#787b86] uppercase font-semibold">Unrealized P&L</span>
            <div className="flex items-center space-x-1">
              {unrealizedPnLUSD >= 0 ? (
                <ArrowUpRight className="w-3.5 h-3.5 text-[#089981]" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 text-[#f23645]" />
              )}
              <span className={`font-mono font-bold ${unrealizedPnLUSD >= 0 ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                {unrealizedPnLUSD >= 0 ? '+' : ''}{formatCurrency(unrealizedPnLUSD)}
              </span>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-[#2a2e39]" />

          {/* Win Rate */}
          <div className="flex flex-col">
            <span className="text-[10px] text-[#787b86] uppercase font-semibold">Win Rate</span>
            <span className="font-mono font-semibold text-white">
              {winRatePercent.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* Currency Toggle */}
          <button
            onClick={toggleCurrency}
            className="px-2 py-1 rounded bg-[#2a2e39] hover:bg-[#363a45] text-xs font-semibold text-white flex items-center space-x-1 transition-colors"
            title={`Display Currency: ${account.displayCurrency}`}
          >
            <DollarSign className="w-3.5 h-3.5 text-[#2962ff]" />
            <span>{account.displayCurrency}</span>
          </button>

          {/* Trade panel toggle */}
          {onToggleTradePanel && (
            <button
              onClick={onToggleTradePanel}
              className={`px-2.5 py-1 rounded text-xs font-semibold items-center space-x-1 shadow transition-colors flex cursor-pointer ${
                isTradePanelOpen ? 'bg-[#089981] hover:bg-[#067a67] text-white' : 'bg-[#2a2e39] hover:bg-[#363a45] text-[#d1d4dc]'
              }`}
              title={isTradePanelOpen ? 'Hide Trade Panel' : 'Open Trade Panel'}
            >
              <span className="icon-bounce"><TrendingUp className="w-3.5 h-3.5" /></span>
              <span>Trade</span>
            </button>
          )}

          {/* Wall Street Wire / News */}
          {onReturnToLanding && (
            <button
              onClick={onReturnToLanding}
              className="px-2.5 py-1 rounded bg-[#2a2e39] hover:bg-[#363a45] text-xs font-semibold text-[#e5b869] border border-[#c59b27]/30 flex items-center space-x-1 shadow transition-colors cursor-pointer"
              title="Return to Wall Street Overview & News"
            >
              <span className="icon-bounce"><Newspaper className="w-3.5 h-3.5 text-[#c59b27]" /></span>
              <span className="hidden xl:inline">Wall St. Wire</span>
              <span className="xl:hidden">News</span>
            </button>
          )}

          {/* Deposit virtual cash */}
          <button
            onClick={onOpenDepositModal}
            className="px-2.5 py-1 rounded bg-[#2962ff] hover:bg-[#1e53e5] text-white text-xs font-semibold flex items-center space-x-1 shadow transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Deposit</span>
          </button>

          {/* Alert button */}
          <button
            onClick={onOpenAlertModal}
            className="relative p-1.5 rounded bg-[#2a2e39] hover:bg-[#363a45] text-[#d1d4dc] hover:text-white transition-colors"
            title="Set Price Alert"
          >
            <Bell className="w-4 h-4" />
            {activeAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#2962ff] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {activeAlertsCount}
              </span>
            )}
          </button>

          {/* Audio toggle */}
          <button
            onClick={toggleSound}
            className={`p-1.5 rounded transition-colors ${
              account.soundEnabled ? 'bg-[#2a2e39] text-[#089981]' : 'bg-[#2a2e39] text-[#787b86]'
            }`}
            title={account.soundEnabled ? 'Sound On' : 'Sound Muted'}
          >
            {account.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Reset Account */}
          <button
            onClick={onOpenResetModal}
            className="p-1.5 rounded bg-[#2a2e39] hover:bg-[#f23645]/20 text-[#787b86] hover:text-[#f23645] transition-colors"
            title="Reset Virtual Portfolio"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. Mobile Header Layout (lg:hidden) - Structured 2-row layout with zero overlap */}
      <div className="flex flex-col lg:hidden">
        {/* Mobile Row 1: Symbol badge & Primary Actions */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-[#2a2e39]/60 bg-[#1e222d]">
          {/* Active Asset Chip (Tap to open Watchlist) */}
          <button
            onClick={onToggleWatchlist}
            className="flex items-center bg-[#131722] hover:bg-[#2a2e39] px-2.5 py-1 rounded border border-[#2a2e39] text-xs transition-colors"
            title="Tap to switch asset"
          >
            <span className="font-bold text-white mr-1.5">{selectedAsset.displayName}</span>
            <span className={`font-mono font-semibold text-[11px] ${isBullish ? 'text-[#089981]' : 'text-[#f23645]'}`}>
              {currencyPrefix}{selectedAsset.price.toLocaleString(undefined, { minimumFractionDigits: selectedAsset.decimals, maximumFractionDigits: selectedAsset.decimals })}
            </span>
            <span className={`ml-1 font-mono text-[9px] px-1 py-0.2 rounded ${
              isBullish ? 'bg-[#089981]/15 text-[#089981]' : 'bg-[#f23645]/15 text-[#f23645]'
            }`}>
              {isBullish ? '+' : ''}{selectedAsset.changePercent24h.toFixed(1)}%
            </span>
            <span className="text-[#787b86] text-[10px] ml-1.5">▼</span>
          </button>

          {/* Right Mobile Actions */}
          <div className="flex items-center space-x-1.5">
            {/* Currency toggle */}
            <button
              onClick={toggleCurrency}
              className="px-2 py-1 rounded bg-[#2a2e39] text-white font-bold text-xs flex items-center space-x-0.5"
            >
              <DollarSign className="w-3 h-3 text-[#2962ff]" />
              <span>{account.displayCurrency}</span>
            </button>

            {/* Deposit button */}
            <button
              onClick={onOpenDepositModal}
              className="px-2 py-1 rounded bg-[#2962ff] text-white text-xs font-semibold flex items-center space-x-1 shadow"
            >
              <PlusCircle className="w-3 h-3" />
              <span>Deposit</span>
            </button>

            {/* Audio */}
            <button
              onClick={toggleSound}
              className={`p-1 rounded ${account.soundEnabled ? 'text-[#089981]' : 'text-[#787b86]'}`}
            >
              {account.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* News / Wall St Wire on mobile */}
            {onReturnToLanding && (
              <button
                onClick={onReturnToLanding}
                className="p-1.5 rounded bg-[#2a2e39] text-[#e5b869] border border-[#c59b27]/30 flex items-center"
                title="Wall Street Overview & News"
              >
                <Newspaper className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Row 2: Horizontal scrollable metrics strip */}
        <div className="flex items-center space-x-3 px-3 py-1.5 bg-[#171b26] text-[11px] font-mono overflow-x-auto no-scrollbar whitespace-nowrap">
          <div className="flex items-center space-x-1">
            <span className="text-[#787b86] text-[10px]">Equity:</span>
            <span className="font-bold text-white">{formatCurrency(totalEquityUSD)}</span>
          </div>

          <div className="h-3 w-[1px] bg-[#2a2e39]" />

          <div className="flex items-center space-x-1">
            <span className="text-[#787b86] text-[10px]">Cash:</span>
            <span className="text-[#d1d4dc]">{formatCurrency(availableBalanceUSD)}</span>
          </div>

          <div className="h-3 w-[1px] bg-[#2a2e39]" />

          <div className="flex items-center space-x-1">
            <span className="text-[#787b86] text-[10px]">P&L:</span>
            <span className={`font-bold ${unrealizedPnLUSD >= 0 ? 'text-[#089981]' : 'text-[#f23645]'}`}>
              {unrealizedPnLUSD >= 0 ? '+' : ''}{formatCurrency(unrealizedPnLUSD)}
            </span>
          </div>

          <div className="h-3 w-[1px] bg-[#2a2e39]" />

          <div className="flex items-center space-x-1">
            <span className="text-[#787b86] text-[10px]">Win:</span>
            <span className="text-white">{winRatePercent.toFixed(0)}%</span>
          </div>

          <div className="h-3 w-[1px] bg-[#2a2e39]" />

          {/* Engine toggle */}
          <button
            onClick={() => setChartEngine(chartEngine === 'tradingview' ? 'custom' : 'tradingview')}
            className="px-1.5 py-0.5 rounded bg-[#2a2e39] text-white text-[10px] font-sans font-medium flex items-center space-x-1"
          >
            <span>{chartEngine === 'tradingview' ? 'TV Chart' : 'Canvas Chart'}</span>
          </button>

          {/* Price alert */}
          <button
            onClick={onOpenAlertModal}
            className="p-1 rounded bg-[#2a2e39] text-[#d1d4dc]"
            title="Alert"
          >
            <Bell className="w-3 h-3" />
          </button>

          {/* Reset */}
          <button
            onClick={onOpenResetModal}
            className="p-1 rounded bg-[#2a2e39] text-[#787b86] hover:text-[#f23645]"
            title="Reset"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>
    </header>
  );
};
