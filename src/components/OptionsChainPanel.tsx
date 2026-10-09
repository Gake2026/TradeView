import React, { useState, useMemo } from 'react';
import { useTrading } from '../context/TradingContext';
import { generateOptionChain, USD_TO_INR_RATE } from '../data/assets';
import { OptionContract, OrderSide } from '../types';
import { ShieldCheck, BarChart2, TrendingUp, TrendingDown, X } from 'lucide-react';

export const OptionsChainPanel: React.FC = () => {
  const { selectedAsset, placeOptionsOrder, formatCurrency } = useTrading();
  const [expiry, setExpiry] = useState<string>('28-Sep-2026');
  const [contracts, setContracts] = useState<number>(1);
  const [selectedContract, setSelectedContract] = useState<{
    strike: number;
    optionType: 'call' | 'put';
    premium: number;
  } | null>(null);

  const optionChain = useMemo(() => {
    return generateOptionChain(selectedAsset.price, selectedAsset.decimals);
  }, [selectedAsset.price, selectedAsset.decimals]);

  // Find ATM strike (closest to spot)
  const atmStrike = useMemo(() => {
    if (optionChain.length === 0) return 0;
    let closest = optionChain[0].strike;
    let minDiff = Math.abs(selectedAsset.price - closest);

    optionChain.forEach(c => {
      const diff = Math.abs(selectedAsset.price - c.strike);
      if (diff < minDiff) {
        minDiff = diff;
        closest = c.strike;
      }
    });
    return closest;
  }, [optionChain, selectedAsset.price]);

  const handleTrade = (side: OrderSide, strike: number, optionType: 'call' | 'put', premium: number) => {
    placeOptionsOrder({
      side,
      strike,
      optionType,
      expiry,
      contracts,
      premium,
    });
  };

  const isINR = selectedAsset.category === 'indian_stock';
  const lotSize = selectedAsset.lotSize || 100;

  return (
    <div className="w-full h-full bg-[#131722] flex flex-col select-none text-xs overflow-hidden">
      {/* Options Header Bar */}
      <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-[#1e222d] border-b border-[#2a2e39] gap-2">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <span className="font-bold text-white text-sm">{selectedAsset.displayName} Options Chain</span>
            <span className="text-[#089981] font-mono text-xs font-semibold">
              Spot: {selectedAsset.quoteCurrency === 'INR' ? '₹' : '$'}{selectedAsset.price.toFixed(selectedAsset.decimals)}
            </span>
          </div>

          <div className="h-4 w-[1px] bg-[#2a2e39]" />

          {/* Expiry Selector */}
          <div className="flex items-center space-x-1.5 text-[11px]">
            <span className="text-[#787b86]">Expiry:</span>
            <select
              value={expiry}
              onChange={e => setExpiry(e.target.value)}
              className="bg-[#131722] border border-[#2a2e39] text-white rounded px-2 py-1 text-xs focus:outline-none focus:border-[#2962ff]"
            >
              <option value="28-Sep-2026">28 Sep 2026 (Weekly)</option>
              <option value="05-Oct-2026">05 Oct 2026 (Next Week)</option>
              <option value="29-Oct-2026">29 Oct 2026 (Monthly)</option>
            </select>
          </div>

          {/* Contracts / Lots Input */}
          <div className="flex items-center space-x-1.5 text-[11px]">
            <span className="text-[#787b86]">Lots / Contracts:</span>
            <input
              type="number"
              min="1"
              max="100"
              value={contracts}
              onChange={e => setContracts(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-16 bg-[#131722] border border-[#2a2e39] text-white font-mono rounded px-2 py-0.5 text-xs text-center"
            />
            <span className="text-[#787b86] font-mono">({contracts * lotSize} qty)</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-3 text-[10px] text-[#787b86]">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-[#089981]" />
            <span>Call (CE) In The Money</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-[#f23645]" />
            <span>Put (PE) In The Money</span>
          </span>
          <span className="bg-[#2962ff]/20 text-[#2962ff] px-1.5 py-0.5 rounded font-semibold">
            ATM: {atmStrike}
          </span>
        </div>
      </div>

      {/* Main Chain Matrix */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse font-mono text-[11px]">
          <thead>
            <tr className="bg-[#171b26] text-[#787b86] border-b border-[#2a2e39] text-[10px] sticky top-0 z-10">
              <th colSpan={5} className="py-1 px-2 text-center text-[#089981] font-bold border-r border-[#2a2e39] bg-[#089981]/10">
                CALL OPTIONS (CE)
              </th>
              <th className="py-1 px-3 text-center text-white font-bold bg-[#1e222d]">
                STRIKE
              </th>
              <th colSpan={5} className="py-1 px-2 text-center text-[#f23645] font-bold border-l border-[#2a2e39] bg-[#f23645]/10">
                PUT OPTIONS (PE)
              </th>
            </tr>
            <tr className="bg-[#1e222d] text-[#787b86] border-b border-[#2a2e39] text-[10px] sticky top-[25px] z-10">
              {/* Calls headers */}
              <th className="py-1 px-2">OI</th>
              <th className="py-1 px-2">IV%</th>
              <th className="py-1 px-2">Delta</th>
              <th className="py-1 px-2 text-right">Premium</th>
              <th className="py-1 px-2 text-center border-r border-[#2a2e39]">Action</th>

              {/* Strike */}
              <th className="py-1 px-3 text-center font-bold text-white bg-[#2a2e39]/50">STRIKE</th>

              {/* Puts headers */}
              <th className="py-1 px-2 text-center border-l border-[#2a2e39]">Action</th>
              <th className="py-1 px-2 text-left">Premium</th>
              <th className="py-1 px-2">Delta</th>
              <th className="py-1 px-2">IV%</th>
              <th className="py-1 px-2 text-right">OI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2e39]/50">
            {optionChain.map(opt => {
              const isCallITM = selectedAsset.price > opt.strike;
              const isPutITM = selectedAsset.price < opt.strike;
              const isATM = opt.strike === atmStrike;

              return (
                <tr
                  key={opt.strike}
                  className={`hover:bg-[#2a2e39]/40 transition-colors ${
                    isATM ? 'bg-[#2962ff]/10 font-bold' : ''
                  }`}
                >
                  {/* CALLS SIDE */}
                  <td className={`py-1.5 px-2 text-[#787b86] ${isCallITM ? 'bg-[#089981]/5' : ''}`}>
                    {opt.callOI.toLocaleString()}
                  </td>
                  <td className={`py-1.5 px-2 text-[#787b86] ${isCallITM ? 'bg-[#089981]/5' : ''}`}>
                    {opt.callIV}%
                  </td>
                  <td className={`py-1.5 px-2 text-[#089981] ${isCallITM ? 'bg-[#089981]/5 font-semibold' : ''}`}>
                    {opt.callDelta}
                  </td>
                  <td className={`py-1.5 px-2 text-right font-bold text-white ${isCallITM ? 'bg-[#089981]/10 text-[#089981]' : ''}`}>
                    {opt.callPremium.toFixed(2)}
                  </td>
                  <td className={`py-1.5 px-2 text-center border-r border-[#2a2e39] ${isCallITM ? 'bg-[#089981]/5' : ''}`}>
                    <button
                      onClick={() => handleTrade('buy', opt.strike, 'call', opt.callPremium)}
                      className="px-2 py-0.5 rounded bg-[#089981] hover:bg-[#067a67] text-white font-bold text-[10px] transition-colors shadow-sm"
                    >
                      BUY CE
                    </button>
                  </td>

                  {/* STRIKE CENTER */}
                  <td className={`py-1.5 px-3 text-center font-bold text-white bg-[#1e222d] ${
                    isATM ? 'border-2 border-[#2962ff] text-[#2962ff]' : ''
                  }`}>
                    {opt.strike.toLocaleString()}
                  </td>

                  {/* PUTS SIDE */}
                  <td className={`py-1.5 px-2 text-center border-l border-[#2a2e39] ${isPutITM ? 'bg-[#f23645]/5' : ''}`}>
                    <button
                      onClick={() => handleTrade('buy', opt.strike, 'put', opt.putPremium)}
                      className="px-2 py-0.5 rounded bg-[#f23645] hover:bg-[#d42c3a] text-white font-bold text-[10px] transition-colors shadow-sm"
                    >
                      BUY PE
                    </button>
                  </td>
                  <td className={`py-1.5 px-2 text-left font-bold text-white ${isPutITM ? 'bg-[#f23645]/10 text-[#f23645]' : ''}`}>
                    {opt.putPremium.toFixed(2)}
                  </td>
                  <td className={`py-1.5 px-2 text-[#f23645] ${isPutITM ? 'bg-[#f23645]/5 font-semibold' : ''}`}>
                    {opt.putDelta}
                  </td>
                  <td className={`py-1.5 px-2 text-[#787b86] ${isPutITM ? 'bg-[#f23645]/5' : ''}`}>
                    {opt.putIV}%
                  </td>
                  <td className={`py-1.5 px-2 text-right text-[#787b86] ${isPutITM ? 'bg-[#f23645]/5' : ''}`}>
                    {opt.putOI.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
