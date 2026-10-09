import React, { useState, useMemo } from 'react';
import { useTrading } from '../context/TradingContext';
import { OrderSide, OrderType, MarginMode, TradeMode } from '../types';
import { USD_TO_INR_RATE } from '../data/assets';
import { 
  ShieldAlert, 
  Calculator, 
  HelpCircle, 
  TrendingUp, 
  TrendingDown, 
  SlidersHorizontal,
  Info,
  ArrowLeft,
  X
} from 'lucide-react';

interface TradeExecutionPanelProps {
  onOpenPositionSizingModal: () => void;
  onClose?: () => void;
}

export const TradeExecutionPanel: React.FC<TradeExecutionPanelProps> = ({
  onOpenPositionSizingModal,
  onClose
}) => {
  const { 
    selectedAsset, 
    tradeMode, 
    setTradeMode, 
    placeSpotOrder, 
    placeFuturesOrder, 
    availableBalanceUSD,
    formatCurrency 
  } = useTrading();

  const [side, setSide] = useState<OrderSide>('buy');
  const [orderType, setOrderType] = useState<OrderType>('market');
  const [size, setSize] = useState<string>('1');
  const [price, setPrice] = useState<string>('');
  const [stopPrice, setStopPrice] = useState<string>('');
  
  // Futures specific
  const [leverage, setLeverage] = useState<number>(10);
  const [marginMode, setMarginMode] = useState<MarginMode>('isolated');

  // Risk Management
  const [showRiskTools, setShowRiskTools] = useState<boolean>(true);
  const [takeProfit, setTakeProfit] = useState<string>('');
  const [stopLoss, setStopLoss] = useState<string>('');
  const [trailingStop, setTrailingStop] = useState<string>('');

  // Default price when switching to limit
  const activePrice = orderType === 'market' 
    ? selectedAsset.price 
    : (parseFloat(price) || selectedAsset.price);

  const numSize = parseFloat(size) || 0;
  const isINR = selectedAsset.category === 'indian_stock';

  // Notional value in USD
  const notionalValueUSD = (activePrice * numSize) / (isINR ? USD_TO_INR_RATE : 1);
  const requiredMarginUSD = tradeMode === 'futures' 
    ? notionalValueUSD / leverage 
    : notionalValueUSD;

  // Estimated Liquidation Price for Futures
  const estimatedLiqPrice = useMemo(() => {
    if (tradeMode !== 'futures' || leverage <= 1) return null;
    const isLong = side === 'buy';
    const liq = isLong 
      ? activePrice * (1 - 0.95 / leverage) 
      : activePrice * (1 + 0.95 / leverage);
    return Math.max(0, liq);
  }, [tradeMode, leverage, side, activePrice]);

  // Risk-Reward calculation
  const riskRewardRatio = useMemo(() => {
    const numSL = parseFloat(stopLoss);
    const numTP = parseFloat(takeProfit);
    if (!numSL || !numTP) return null;

    const risk = Math.abs(activePrice - numSL);
    const reward = Math.abs(numTP - activePrice);
    if (risk <= 0) return null;

    const ratio = reward / risk;
    return ratio.toFixed(2);
  }, [stopLoss, takeProfit, activePrice]);

  // Percentage quick buttons
  const handlePercentageSize = (pct: number) => {
    if (availableBalanceUSD <= 0) return;
    const targetMargin = availableBalanceUSD * pct;
    const notionalTarget = tradeMode === 'futures' ? targetMargin * leverage : targetMargin;
    const notionalTargetInAssetCur = isINR ? notionalTarget * USD_TO_INR_RATE : notionalTarget;
    const calculatedQty = notionalTargetInAssetCur / activePrice;

    if (selectedAsset.minQty < 1) {
      setSize(calculatedQty.toFixed(3));
    } else {
      setSize(Math.max(1, Math.floor(calculatedQty)).toString());
    }
  };

  const handleExecute = () => {
    if (numSize <= 0) return;

    const numPrice = orderType !== 'market' ? parseFloat(price) : undefined;
    const numTP = parseFloat(takeProfit) || undefined;
    const numSL = parseFloat(stopLoss) || undefined;
    const numTrail = parseFloat(trailingStop) || undefined;

    if (tradeMode === 'spot') {
      placeSpotOrder({
        side,
        orderType,
        size: numSize,
        price: numPrice,
        takeProfit: numTP,
        stopLoss: numSL,
      });
    } else if (tradeMode === 'futures') {
      placeFuturesOrder({
        side,
        orderType,
        size: numSize,
        price: numPrice,
        leverage,
        marginMode,
        takeProfit: numTP,
        stopLoss: numSL,
        trailingStop: numTrail,
      });
    }
  };

  return (
    <div className="w-full lg:w-80 h-full bg-[#1e222d] border-l border-[#2a2e39] flex flex-col z-20 shrink-0 select-none text-xs">
      {/* Panel Header with Back and Cross buttons */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#171b26] border-b border-[#2a2e39]">
        <div className="flex items-center space-x-2">
          {onClose && (
            <button
              onClick={onClose}
              className="flex items-center space-x-1 px-2 py-1 rounded bg-[#2a2e39] hover:bg-[#363a45] text-[#d1d4dc] hover:text-white transition-colors"
              title="Back to Chart"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="text-[11px] font-semibold">Back</span>
            </button>
          )}
          <div className="flex items-center space-x-1.5">
            <span className="font-bold text-sm text-white">Order Execution</span>
            <span className="text-[10px] text-[#2962ff] bg-[#2962ff]/10 px-1.5 py-0.5 rounded font-mono font-semibold">
              {selectedAsset.displayName}
            </span>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded text-[#787b86] hover:text-white hover:bg-[#2a2e39] transition-colors"
            title="Close Panel"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Trade Mode Selector (Spot, Futures, Options) */}
      <div className="flex border-b border-[#2a2e39] bg-[#171b26] p-1 gap-1">
        <button
          onClick={() => setTradeMode('spot')}
          className={`flex-1 py-1.5 rounded font-semibold text-center transition-colors ${
            tradeMode === 'spot' ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:text-white'
          }`}
        >
          Spot
        </button>
        <button
          onClick={() => setTradeMode('futures')}
          className={`flex-1 py-1.5 rounded font-semibold text-center transition-colors ${
            tradeMode === 'futures' ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:text-white'
          }`}
        >
          Futures ({leverage}x)
        </button>
        <button
          onClick={() => setTradeMode('options')}
          className={`flex-1 py-1.5 rounded font-semibold text-center transition-colors ${
            tradeMode === 'options' ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:text-white'
          }`}
        >
          Options
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3.5">
        {/* Buy / Long vs Sell / Short Selector */}
        <div className="grid grid-cols-2 gap-1.5 bg-[#131722] p-1 rounded-lg border border-[#2a2e39]">
          <button
            onClick={() => setSide('buy')}
            className={`py-2 rounded font-bold transition-all flex items-center justify-center space-x-1 ${
              side === 'buy'
                ? 'bg-[#089981] text-white shadow-md'
                : 'text-[#787b86] hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{tradeMode === 'futures' ? 'LONG (BUY)' : 'BUY'}</span>
          </button>
          <button
            onClick={() => setSide('sell')}
            className={`py-2 rounded font-bold transition-all flex items-center justify-center space-x-1 ${
              side === 'sell'
                ? 'bg-[#f23645] text-white shadow-md'
                : 'text-[#787b86] hover:text-white'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>{tradeMode === 'futures' ? 'SHORT (SELL)' : 'SELL'}</span>
          </button>
        </div>

        {/* Futures Specific: Margin Mode & Leverage Slider */}
        {tradeMode === 'futures' && (
          <div className="space-y-2 bg-[#131722] p-2.5 rounded-lg border border-[#2a2e39]">
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center space-x-1">
                <span className="text-[#787b86]">Margin:</span>
                <span className="font-semibold text-white uppercase">{marginMode}</span>
              </div>
              <div className="flex bg-[#1e222d] rounded p-0.5 border border-[#2a2e39]">
                <button
                  onClick={() => setMarginMode('isolated')}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                    marginMode === 'isolated' ? 'bg-[#2962ff] text-white' : 'text-[#787b86]'
                  }`}
                >
                  Isolated
                </button>
                <button
                  onClick={() => setMarginMode('cross')}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                    marginMode === 'cross' ? 'bg-[#2962ff] text-white' : 'text-[#787b86]'
                  }`}
                >
                  Cross
                </button>
              </div>
            </div>

            {/* Leverage Slider */}
            <div>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-[#787b86]">Leverage:</span>
                <span className={`font-mono font-bold ${leverage > 20 ? 'text-[#f59e0b]' : 'text-[#089981]'}`}>
                  {leverage}x
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                step="1"
                value={leverage}
                onChange={e => setLeverage(parseInt(e.target.value))}
                className="w-full h-1.5 bg-[#2a2e39] rounded-lg appearance-none cursor-pointer accent-[#2962ff]"
              />
              <div className="flex justify-between text-[9px] text-[#787b86] font-mono mt-0.5">
                <span>1x</span>
                <span>10x</span>
                <span>25x</span>
                <span>50x</span>
                <span>100x</span>
              </div>
            </div>

            {/* Quick leverage presets */}
            <div className="flex space-x-1">
              {[2, 5, 10, 20, 50, 100].map(lev => (
                <button
                  key={lev}
                  onClick={() => setLeverage(lev)}
                  className={`flex-1 py-0.5 rounded text-[10px] font-mono font-semibold ${
                    leverage === lev ? 'bg-[#2962ff] text-white' : 'bg-[#1e222d] text-[#787b86] hover:text-white'
                  }`}
                >
                  {lev}x
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Order Type */}
        <div className="flex bg-[#131722] rounded p-1 border border-[#2a2e39] text-[11px]">
          <button
            onClick={() => setOrderType('market')}
            className={`flex-1 py-1 rounded font-medium ${
              orderType === 'market' ? 'bg-[#2a2e39] text-white' : 'text-[#787b86] hover:text-white'
            }`}
          >
            Market
          </button>
          <button
            onClick={() => setOrderType('limit')}
            className={`flex-1 py-1 rounded font-medium ${
              orderType === 'limit' ? 'bg-[#2a2e39] text-white' : 'text-[#787b86] hover:text-white'
            }`}
          >
            Limit
          </button>
          <button
            onClick={() => setOrderType('stop_limit')}
            className={`flex-1 py-1 rounded font-medium ${
              orderType === 'stop_limit' ? 'bg-[#2a2e39] text-white' : 'text-[#787b86] hover:text-white'
            }`}
          >
            Stop-Limit
          </button>
        </div>

        {/* Limit Target Price Input */}
        {orderType === 'limit' && (
          <div>
            <label className="text-[11px] text-[#787b86] block mb-1">Limit Price ({selectedAsset.quoteCurrency})</label>
            <input
              type="number"
              placeholder={selectedAsset.price.toString()}
              value={price}
              onChange={e => setPrice(e.target.value)}
              className="w-full bg-[#131722] border border-[#2a2e39] rounded px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-[#2962ff]"
            />
          </div>
        )}

        {/* Stop Price Input */}
        {orderType === 'stop_limit' && (
          <div className="space-y-2">
            <div>
              <label className="text-[11px] text-[#787b86] block mb-1">Stop Trigger Price ({selectedAsset.quoteCurrency})</label>
              <input
                type="number"
                placeholder={selectedAsset.price.toString()}
                value={stopPrice}
                onChange={e => setStopPrice(e.target.value)}
                className="w-full bg-[#131722] border border-[#2a2e39] rounded px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-[#2962ff]"
              />
            </div>
            <div>
              <label className="text-[11px] text-[#787b86] block mb-1">Execution Limit Price ({selectedAsset.quoteCurrency})</label>
              <input
                type="number"
                placeholder={selectedAsset.price.toString()}
                value={price}
                onChange={e => setPrice(e.target.value)}
                className="w-full bg-[#131722] border border-[#2a2e39] rounded px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-[#2962ff]"
              />
            </div>
          </div>
        )}

        {/* Order Size Input */}
        <div>
          <div className="flex justify-between text-[11px] mb-1">
            <span className="text-[#787b86]">Quantity</span>
            <span className="text-[#787b86] font-mono">Lot: {selectedAsset.lotSize}</span>
          </div>
          <div className="relative flex items-center">
            <input
              type="number"
              step={selectedAsset.minQty}
              min={selectedAsset.minQty}
              value={size}
              onChange={e => setSize(e.target.value)}
              className="w-full bg-[#131722] border border-[#2a2e39] rounded px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-[#2962ff]"
            />
            <span className="absolute right-2.5 text-[#787b86] font-mono text-[11px]">
              {selectedAsset.displayName.split('/')[0]}
            </span>
          </div>

          {/* Quick % buttons */}
          <div className="grid grid-cols-4 gap-1 mt-1.5">
            {[0.25, 0.5, 0.75, 1.0].map(pct => (
              <button
                key={pct}
                onClick={() => handlePercentageSize(pct)}
                className="py-1 rounded bg-[#131722] hover:bg-[#2a2e39] text-[#787b86] hover:text-white font-mono text-[10px] transition-colors border border-[#2a2e39]"
              >
                {pct * 100}%
              </button>
            ))}
          </div>
        </div>

        {/* Risk Management Accordion */}
        <div className="border border-[#2a2e39] rounded-lg overflow-hidden bg-[#131722]">
          <button
            onClick={() => setShowRiskTools(prev => !prev)}
            className="w-full flex items-center justify-between px-2.5 py-2 bg-[#171b26] text-[#d1d4dc] font-semibold hover:bg-[#1e222d] transition-colors text-xs"
          >
            <div className="flex items-center space-x-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-[#2962ff]" />
              <span>Risk Management (TP / SL)</span>
            </div>
            <span className="text-[#787b86] text-[11px]">{showRiskTools ? '▲' : '▼'}</span>
          </button>

          {showRiskTools && (
            <div className="p-2.5 space-y-2 text-[11px]">
              <div>
                <label className="text-[#787b86] block mb-0.5">Take Profit (TP)</label>
                <input
                  type="number"
                  placeholder="Target profit price..."
                  value={takeProfit}
                  onChange={e => setTakeProfit(e.target.value)}
                  className="w-full bg-[#1e222d] border border-[#2a2e39] rounded px-2 py-1 text-white font-mono focus:outline-none focus:border-[#089981]"
                />
              </div>

              <div>
                <label className="text-[#787b86] block mb-0.5">Stop Loss (SL)</label>
                <input
                  type="number"
                  placeholder="Stop loss price..."
                  value={stopLoss}
                  onChange={e => setStopLoss(e.target.value)}
                  className="w-full bg-[#1e222d] border border-[#2a2e39] rounded px-2 py-1 text-white font-mono focus:outline-none focus:border-[#f23645]"
                />
              </div>

              {tradeMode === 'futures' && (
                <div>
                  <label className="text-[#787b86] block mb-0.5">Trailing Stop (Delta points)</label>
                  <input
                    type="number"
                    placeholder="Trailing distance e.g. 50"
                    value={trailingStop}
                    onChange={e => setTrailingStop(e.target.value)}
                    className="w-full bg-[#1e222d] border border-[#2a2e39] rounded px-2 py-1 text-white font-mono focus:outline-none focus:border-[#2962ff]"
                  />
                </div>
              )}

              {riskRewardRatio && (
                <div className="flex items-center justify-between px-2 py-1 bg-[#1e222d] rounded text-[11px]">
                  <span className="text-[#787b86]">Risk / Reward:</span>
                  <span className="font-mono font-bold text-[#089981]">1 : {riskRewardRatio}</span>
                </div>
              )}

              {/* Calculator modal launcher */}
              <button
                onClick={onOpenPositionSizingModal}
                className="w-full py-1 text-center text-[#2962ff] hover:text-[#38bdf8] font-medium flex items-center justify-center space-x-1 transition-colors"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Position Sizing Calculator</span>
              </button>
            </div>
          )}
        </div>

        {/* Order Details Summary Card */}
        <div className="bg-[#131722] p-2.5 rounded-lg border border-[#2a2e39] space-y-1.5 text-[11px] font-mono">
          <div className="flex justify-between">
            <span className="text-[#787b86]">Notional Value:</span>
            <span className="text-white">{formatCurrency(notionalValueUSD)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-[#787b86]">Margin Required:</span>
            <span className="text-white font-bold">{formatCurrency(requiredMarginUSD)}</span>
          </div>

          {tradeMode === 'futures' && estimatedLiqPrice !== null && (
            <div className="flex justify-between border-t border-[#2a2e39] pt-1 text-[#f59e0b]">
              <span>Est. Liquidation:</span>
              <span className="font-bold">
                {selectedAsset.quoteCurrency === 'INR' ? '₹' : '$'}{estimatedLiqPrice.toFixed(selectedAsset.decimals)}
              </span>
            </div>
          )}

          <div className="flex justify-between text-[#787b86] text-[10px]">
            <span>Maker / Taker Fee:</span>
            <span className="text-[#089981]">0.00% (Paper Free)</span>
          </div>
        </div>

        {/* Execution Action Button */}
        <button
          onClick={handleExecute}
          className={`w-full py-3 rounded-lg font-bold text-sm tracking-wide shadow-lg transition-all active:scale-[0.98] ${
            side === 'buy'
              ? 'bg-[#089981] hover:bg-[#067a67] text-white'
              : 'bg-[#f23645] hover:bg-[#d42c3a] text-white'
          }`}
        >
          {tradeMode === 'futures'
            ? `${side === 'buy' ? 'OPEN LONG' : 'OPEN SHORT'} ${leverage}x`
            : `${side.toUpperCase()} ${selectedAsset.displayName}`}
        </button>
      </div>
    </div>
  );
};
