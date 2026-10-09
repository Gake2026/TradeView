import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTrading } from '../context/TradingContext';
import { Position } from '../types';
import { 
  Briefcase, 
  Clock, 
  FileText, 
  Bell, 
  BarChart3, 
  X, 
  Edit3, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingUp,
  Plus
} from 'lucide-react';

interface BottomTradeTabsProps {
  onOpenEditTPSL: (pos: Position) => void;
  onOpenAlertModal: () => void;
  onOpenTrade?: () => void;
}

type TabKey = 'positions' | 'orders' | 'history' | 'alerts' | 'analytics';

export const BottomTradeTabs: React.FC<BottomTradeTabsProps> = ({
  onOpenEditTPSL,
  onOpenAlertModal,
  onOpenTrade,
}) => {
  const { 
    positions, 
    orders, 
    closedTrades, 
    alerts, 
    closePosition, 
    cancelOrder, 
    removeAlert, 
    formatCurrency,
    winRatePercent,
    profitFactor,
    totalEquityUSD,
    realizedPnLUSD,
    unrealizedPnLUSD,
    marginUsedUSD,
    marginLevelPercent,
  } = useTrading();

  const [activeTab, setActiveTab] = useState<TabKey>('positions');

  // Export trade history to CSV
  const handleExportCSV = () => {
    if (closedTrades.length === 0) return;
    const headers = ['ID', 'Asset', 'Mode', 'Side', 'Size', 'Entry Price', 'Exit Price', 'Leverage', 'Realized PnL ($)', 'PnL (%)', 'Reason', 'Close Time'];
    const rows = closedTrades.map(t => [
      t.id,
      t.displayName,
      t.mode,
      t.side,
      t.size,
      t.entryPrice,
      t.exitPrice,
      `${t.leverage}x`,
      t.realizedPnL,
      `${t.realizedPnLPercent}%`,
      t.closeReason,
      new Date(t.closeTime).toISOString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tradeview_journal_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full h-full bg-[#1e222d] flex flex-col select-none text-xs z-20 overflow-hidden">
      {/* Tabs Header - Smoothly scrollable with zero clipping */}
      <div className="flex items-center justify-between px-2 sm:px-3 bg-[#171b26] border-b border-[#2a2e39] overflow-x-auto scrollbar-none shrink-0">
        <div className="flex items-center space-x-1 shrink-0">
          <button
            onClick={() => setActiveTab('positions')}
            className={`py-2 px-2.5 sm:px-3 font-semibold transition-colors border-b-2 flex items-center space-x-1.5 shrink-0 whitespace-nowrap cursor-pointer ${
              activeTab === 'positions'
                ? 'border-[#2962ff] text-white'
                : 'border-transparent text-[#787b86] hover:text-[#d1d4dc]'
            }`}
          >
            <span className="icon-bounce"><Briefcase className="w-3.5 h-3.5" /></span>
            <span>Positions</span>
            <span className="bg-[#2a2e39] text-[#d1d4dc] text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
              {positions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`py-2 px-2.5 sm:px-3 font-semibold transition-colors border-b-2 flex items-center space-x-1.5 shrink-0 whitespace-nowrap cursor-pointer ${
              activeTab === 'orders'
                ? 'border-[#2962ff] text-white'
                : 'border-transparent text-[#787b86] hover:text-[#d1d4dc]'
            }`}
          >
            <span className="icon-bounce"><Clock className="w-3.5 h-3.5" /></span>
            <span>Pending Orders</span>
            <span className="bg-[#2a2e39] text-[#d1d4dc] text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 px-2.5 sm:px-3 font-semibold transition-colors border-b-2 flex items-center space-x-1.5 shrink-0 whitespace-nowrap cursor-pointer ${
              activeTab === 'history'
                ? 'border-[#2962ff] text-white'
                : 'border-transparent text-[#787b86] hover:text-[#d1d4dc]'
            }`}
          >
            <span className="icon-bounce"><FileText className="w-3.5 h-3.5" /></span>
            <span>Trade Journal</span>
            <span className="bg-[#2a2e39] text-[#d1d4dc] text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
              {closedTrades.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('alerts')}
            className={`py-2 px-2.5 sm:px-3 font-semibold transition-colors border-b-2 flex items-center space-x-1.5 shrink-0 whitespace-nowrap cursor-pointer ${
              activeTab === 'alerts'
                ? 'border-[#2962ff] text-white'
                : 'border-transparent text-[#787b86] hover:text-[#d1d4dc]'
            }`}
          >
            <span className="icon-bounce"><Bell className="w-3.5 h-3.5" /></span>
            <span>Alerts</span>
            <span className="bg-[#2a2e39] text-[#d1d4dc] text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
              {alerts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-2 px-2.5 sm:px-3 font-semibold transition-colors border-b-2 flex items-center space-x-1.5 shrink-0 whitespace-nowrap cursor-pointer ${
              activeTab === 'analytics'
                ? 'border-[#2962ff] text-white'
                : 'border-transparent text-[#787b86] hover:text-[#d1d4dc]'
            }`}
          >
            <span className="icon-bounce"><BarChart3 className="w-3.5 h-3.5" /></span>
            <span>Analytics</span>
          </button>
        </div>

        {/* Tab Right Actions */}
        <div className="flex items-center space-x-2 shrink-0 ml-2">
          {activeTab === 'history' && closedTrades.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-1 px-2 py-1 rounded bg-[#2a2e39] hover:bg-[#363a45] text-[#d1d4dc] text-[11px] transition-colors cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>Export CSV</span>
            </button>
          )}

          {activeTab === 'alerts' && (
            <button
              onClick={onOpenAlertModal}
              className="flex items-center space-x-1 px-2 py-1 rounded bg-[#2962ff] hover:bg-[#1e53e5] text-white text-[11px] font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>New Alert</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{ willChange: 'transform, opacity' }}
            className="h-full min-h-full flex flex-col"
          >
            {/* 1. Open Positions */}
            {activeTab === 'positions' && (
              positions.length === 0 ? (
                <div className="h-full flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-[#171b26] border border-[#2a2e39] flex items-center justify-center text-[#787b86]">
                    <Briefcase className="w-7 h-7 stroke-1" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm">No Open Positions</h4>
                    <p className="text-[#787b86] text-xs max-w-xs mt-1 leading-relaxed">
                      No open positions yet. Use the Trade Panel to execute spot, futures, or options trades.
                    </p>
                  </div>
                  {onOpenTrade && (
                    <button
                      onClick={onOpenTrade}
                      className="mt-1 px-4 py-2 rounded bg-[#2962ff] hover:bg-[#1e53e5] text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer shadow"
                    >
                      <span className="icon-bounce"><TrendingUp className="w-3.5 h-3.5" /></span>
                      <span>Open Trade Panel</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-left border-collapse font-mono text-[11px] min-w-[700px]">
                    <thead className="bg-[#171b26] text-[#787b86] border-b border-[#2a2e39] sticky top-0">
                      <tr>
                        <th className="py-2 px-3">Asset</th>
                        <th className="py-2 px-2">Type / Mode</th>
                        <th className="py-2 px-2">Side</th>
                        <th className="py-2 px-2 text-right">Size</th>
                        <th className="py-2 px-2 text-right">Entry Price</th>
                        <th className="py-2 px-2 text-right">Mark Price</th>
                        <th className="py-2 px-2 text-right">Liq. Price</th>
                        <th className="py-2 px-2 text-right">Margin</th>
                        <th className="py-2 px-2 text-center">TP / SL</th>
                        <th className="py-2 px-3 text-right">Unrealized P&L</th>
                        <th className="py-2 px-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2a2e39]/50">
                      {positions.map(pos => {
                        const isProfit = pos.unrealizedPnL >= 0;
                        return (
                          <tr key={pos.id} className="hover:bg-[#2a2e39]/30 transition-colors">
                            <td className="py-2 px-3 font-bold text-white font-sans">
                              {pos.displayName}
                            </td>
                            <td className="py-2 px-2 text-[#787b86] uppercase">
                              {pos.mode} {pos.mode === 'futures' ? `(${pos.leverage}x)` : ''}
                            </td>
                            <td className="py-2 px-2">
                              <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                                pos.side === 'buy' ? 'bg-[#089981]/20 text-[#089981]' : 'bg-[#f23645]/20 text-[#f23645]'
                              }`}>
                                {pos.mode === 'futures' ? (pos.side === 'buy' ? 'LONG' : 'SHORT') : pos.side.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-2 px-2 text-right text-white">
                              {pos.size}
                            </td>
                            <td className="py-2 px-2 text-right text-[#d1d4dc]">
                              {pos.entryPrice.toLocaleString()}
                            </td>
                            <td className="py-2 px-2 text-right font-bold text-white">
                              {pos.currentPrice.toLocaleString()}
                            </td>
                            <td className="py-2 px-2 text-right font-medium text-[#f59e0b]">
                              {pos.liquidationPrice ? pos.liquidationPrice.toLocaleString() : '-'}
                            </td>
                            <td className="py-2 px-2 text-right text-[#d1d4dc]">
                              ${pos.margin.toFixed(2)}
                            </td>
                            <td className="py-2 px-2 text-center text-[#787b86]">
                              {pos.takeProfit || pos.stopLoss ? (
                                <span>
                                  {pos.takeProfit ? `TP: ${pos.takeProfit}` : ''}{' '}
                                  {pos.stopLoss ? `SL: ${pos.stopLoss}` : ''}
                                </span>
                              ) : (
                                <span className="text-[#555]">-</span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-right">
                              <div className={`font-bold ${isProfit ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                                {isProfit ? '+' : ''}${pos.unrealizedPnL.toFixed(2)}
                              </div>
                              <div className={`text-[10px] ${isProfit ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                                ({isProfit ? '+' : ''}{pos.unrealizedPnLPercent.toFixed(2)}%)
                              </div>
                            </td>
                            <td className="py-2 px-3 text-center">
                              <div className="flex items-center justify-center space-x-1.5">
                                <button
                                  onClick={() => onOpenEditTPSL(pos)}
                                  className="p-1 rounded text-[#787b86] hover:text-white hover:bg-[#2a2e39] transition-colors cursor-pointer"
                                  title="Edit TP / SL"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => closePosition(pos.id)}
                                  className="px-2 py-0.5 rounded bg-[#f23645]/20 hover:bg-[#f23645] text-[#f23645] hover:text-white font-bold transition-all text-[10px] cursor-pointer"
                                >
                                  Close
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {/* 2. Open Pending Orders */}
            {activeTab === 'orders' && (
              orders.length === 0 ? (
                <div className="h-full flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-[#171b26] border border-[#2a2e39] flex items-center justify-center text-[#787b86]">
                    <Clock className="w-7 h-7 stroke-1" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm">No Pending Orders</h4>
                    <p className="text-[#787b86] text-xs max-w-xs mt-1 leading-relaxed">
                      No pending limit or stop orders. Orders will appear here until triggered.
                    </p>
                  </div>
                  {onOpenTrade && (
                    <button
                      onClick={onOpenTrade}
                      className="mt-1 px-4 py-2 rounded bg-[#2962ff] hover:bg-[#1e53e5] text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer shadow"
                    >
                      <span className="icon-bounce"><TrendingUp className="w-3.5 h-3.5" /></span>
                      <span>Place Limit Order</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-left border-collapse font-mono text-[11px] min-w-[700px]">
                    <thead className="bg-[#171b26] text-[#787b86] border-b border-[#2a2e39] sticky top-0">
                      <tr>
                        <th className="py-2 px-3">Time</th>
                        <th className="py-2 px-3">Asset</th>
                        <th className="py-2 px-2">Type</th>
                        <th className="py-2 px-2">Side</th>
                        <th className="py-2 px-2 text-right">Target Price</th>
                        <th className="py-2 px-2 text-right">Stop Trigger</th>
                        <th className="py-2 px-2 text-right">Size</th>
                        <th className="py-2 px-2 text-right">Margin</th>
                        <th className="py-2 px-3 text-center">Status</th>
                        <th className="py-2 px-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2a2e39]/50">
                      {orders.map(ord => (
                        <tr key={ord.id} className="hover:bg-[#2a2e39]/30 transition-colors">
                          <td className="py-2 px-3 text-[#787b86]">
                            {new Date(ord.createdAt).toLocaleTimeString()}
                          </td>
                          <td className="py-2 px-3 font-bold text-white font-sans">
                            {ord.displayName}
                          </td>
                          <td className="py-2 px-2 uppercase text-[#787b86]">
                            {ord.orderType.replace('_', ' ')}
                          </td>
                          <td className="py-2 px-2">
                            <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                              ord.side === 'buy' ? 'bg-[#089981]/20 text-[#089981]' : 'bg-[#f23645]/20 text-[#f23645]'
                            }`}>
                              {ord.side.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-right text-white">
                            {ord.price ? ord.price.toLocaleString() : '-'}
                          </td>
                          <td className="py-2 px-2 text-right text-[#f59e0b]">
                            {ord.stopPrice ? ord.stopPrice.toLocaleString() : '-'}
                          </td>
                          <td className="py-2 px-2 text-right text-white">
                            {ord.size}
                          </td>
                          <td className="py-2 px-2 text-right text-[#d1d4dc]">
                            ${ord.margin.toFixed(2)}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span className="px-1.5 py-0.5 rounded bg-[#2962ff]/20 text-[#2962ff] text-[10px] font-semibold uppercase">
                              {ord.status}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center">
                            <button
                              onClick={() => cancelOrder(ord.id)}
                              className="px-2 py-0.5 rounded bg-[#2a2e39] hover:bg-[#f23645]/20 text-[#787b86] hover:text-[#f23645] transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {/* 3. Trade History / Journal */}
            {activeTab === 'history' && (
              closedTrades.length === 0 ? (
                <div className="h-full flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-[#171b26] border border-[#2a2e39] flex items-center justify-center text-[#787b86]">
                    <FileText className="w-7 h-7 stroke-1" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm">Trade Journal is Empty</h4>
                    <p className="text-[#787b86] text-xs max-w-xs mt-1 leading-relaxed">
                      Your trade journal is currently empty. Closed positions will be recorded here automatically.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-left border-collapse font-mono text-[11px] min-w-[700px]">
                    <thead className="bg-[#171b26] text-[#787b86] border-b border-[#2a2e39] sticky top-0">
                      <tr>
                        <th className="py-2 px-3">Closed Time</th>
                        <th className="py-2 px-3">Asset</th>
                        <th className="py-2 px-2">Side</th>
                        <th className="py-2 px-2 text-right">Size</th>
                        <th className="py-2 px-2 text-right">Entry Price</th>
                        <th className="py-2 px-2 text-right">Exit Price</th>
                        <th className="py-2 px-2 text-center">Close Reason</th>
                        <th className="py-2 px-3 text-right">Realized P&L ($)</th>
                        <th className="py-2 px-3 text-right">Return (%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2a2e39]/50">
                      {closedTrades.map(trade => {
                        const isProfit = trade.realizedPnL >= 0;
                        return (
                          <tr key={trade.id} className="hover:bg-[#2a2e39]/30 transition-colors">
                            <td className="py-2 px-3 text-[#787b86]">
                              {new Date(trade.closeTime).toLocaleTimeString()}
                            </td>
                            <td className="py-2 px-3 font-bold text-white font-sans">
                              {trade.displayName}
                            </td>
                            <td className="py-2 px-2">
                              <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                                trade.side === 'buy' ? 'bg-[#089981]/20 text-[#089981]' : 'bg-[#f23645]/20 text-[#f23645]'
                              }`}>
                                {trade.side.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-2 px-2 text-right text-white">
                              {trade.size}
                            </td>
                            <td className="py-2 px-2 text-right text-[#d1d4dc]">
                              {trade.entryPrice.toLocaleString()}
                            </td>
                            <td className="py-2 px-2 text-right font-bold text-white">
                              {trade.exitPrice.toLocaleString()}
                            </td>
                            <td className="py-2 px-2 text-center text-[#787b86] capitalize">
                              {trade.closeReason.replace('_', ' ')}
                            </td>
                            <td className={`py-2 px-3 text-right font-bold ${isProfit ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                              {isProfit ? '+' : ''}${trade.realizedPnL.toFixed(2)}
                            </td>
                            <td className={`py-2 px-3 text-right font-bold ${isProfit ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                              {isProfit ? '+' : ''}{trade.realizedPnLPercent.toFixed(2)}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {/* 4. Price Alerts */}
            {activeTab === 'alerts' && (
              alerts.length === 0 ? (
                <div className="h-full flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-[#171b26] border border-[#2a2e39] flex items-center justify-center text-[#787b86]">
                    <Bell className="w-7 h-7 stroke-1" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm">No Price Alerts</h4>
                    <p className="text-[#787b86] text-xs max-w-xs mt-1 leading-relaxed">
                      No active price alerts set. Never miss an entry or exit target.
                    </p>
                  </div>
                  <button
                    onClick={onOpenAlertModal}
                    className="mt-1 px-4 py-2 rounded bg-[#2962ff] hover:bg-[#1e53e5] text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer shadow"
                  >
                    <span className="icon-bounce"><Plus className="w-3.5 h-3.5" /></span>
                    <span>Create Alert</span>
                  </button>
                </div>
              ) : (
                <div className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {alerts.map(al => (
                    <div
                      key={al.id}
                      className={`p-2.5 rounded-lg border flex items-center justify-between transition-all ${
                        al.triggered
                          ? 'bg-[#131722] border-[#2a2e39] opacity-70'
                          : 'bg-[#1e222d] border-[#2962ff]/40 shadow-sm'
                      }`}
                    >
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-white">{al.displayName}</span>
                          <span className={`text-[10px] px-1 py-0.2 rounded font-bold uppercase ${
                            al.condition === 'above' ? 'bg-[#089981]/20 text-[#089981]' : 'bg-[#f23645]/20 text-[#f23645]'
                          }`}>
                            {al.condition}
                          </span>
                          <span className="font-mono font-bold text-white">
                            ${al.targetPrice.toLocaleString()}
                          </span>
                        </div>
                        {al.notes && (
                          <div className="text-[10px] text-[#787b86] mt-0.5 truncate max-w-[200px]">
                            {al.notes}
                          </div>
                        )}
                        <div className="text-[9px] text-[#787b86] mt-1">
                          Status: {al.triggered ? 'TRIGGERED' : 'ACTIVE'}
                        </div>
                      </div>

                      <button
                        onClick={() => removeAlert(al.id)}
                        className="p-1 rounded text-[#787b86] hover:text-[#f23645] hover:bg-[#2a2e39] transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* 5. Performance Analytics */}
            {activeTab === 'analytics' && (
              <div className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                <div className="bg-[#131722] p-3 rounded-lg border border-[#2a2e39]">
                  <span className="text-[10px] text-[#787b86] uppercase font-semibold">Total Equity</span>
                  <div className="text-sm font-mono font-bold text-white mt-1">
                    {formatCurrency(totalEquityUSD)}
                  </div>
                </div>

                <div className="bg-[#131722] p-3 rounded-lg border border-[#2a2e39]">
                  <span className="text-[10px] text-[#787b86] uppercase font-semibold">Realized P&L</span>
                  <div className={`text-sm font-mono font-bold mt-1 ${realizedPnLUSD >= 0 ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                    {realizedPnLUSD >= 0 ? '+' : ''}{formatCurrency(realizedPnLUSD)}
                  </div>
                </div>

                <div className="bg-[#131722] p-3 rounded-lg border border-[#2a2e39]">
                  <span className="text-[10px] text-[#787b86] uppercase font-semibold">Win Rate</span>
                  <div className="text-sm font-mono font-bold text-white mt-1">
                    {winRatePercent.toFixed(1)}%
                  </div>
                </div>

                <div className="bg-[#131722] p-3 rounded-lg border border-[#2a2e39]">
                  <span className="text-[10px] text-[#787b86] uppercase font-semibold">Profit Factor</span>
                  <div className="text-sm font-mono font-bold text-white mt-1">
                    {profitFactor.toFixed(2)}
                  </div>
                </div>

                <div className="bg-[#131722] p-3 rounded-lg border border-[#2a2e39]">
                  <span className="text-[10px] text-[#787b86] uppercase font-semibold">Closed Trades</span>
                  <div className="text-sm font-mono font-bold text-white mt-1">
                    {closedTrades.length}
                  </div>
                </div>

                <div className="bg-[#131722] p-3 rounded-lg border border-[#2a2e39]">
                  <span className="text-[10px] text-[#787b86] uppercase font-semibold">Margin Level</span>
                  <div className="text-sm font-mono font-bold text-[#2962ff] mt-1">
                    {marginLevelPercent > 900 ? 'Safe' : `${marginLevelPercent}%`}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
