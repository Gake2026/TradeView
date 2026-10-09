import React, { useState, useEffect } from 'react';
import { useTrading } from '../context/TradingContext';
import { Position } from '../types';
import { X, DollarSign, AlertCircle, CheckCircle, Calculator, ShieldCheck, Bell } from 'lucide-react';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose }) => {
  const { depositVirtualCash, formatCurrency } = useTrading();
  const [customAmount, setCustomAmount] = useState<string>('50000');

  if (!isOpen) return null;

  const handleDeposit = (amount: number) => {
    depositVirtualCash(amount);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#1e222d] border border-[#2a2e39] rounded-xl w-full max-w-md p-5 shadow-2xl text-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#2a2e39] pb-3">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-[#089981]" />
            <h3 className="font-bold text-sm text-white">Deposit Virtual Funds</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-[#787b86] hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[#787b86]">
          Add risk-free paper money to test high-leverage strategies, options chains, and portfolio risk management.
        </p>

        {/* Quick buttons */}
        <div className="grid grid-cols-3 gap-2">
          {[10000, 50000, 100000].map(amt => (
            <button
              key={amt}
              onClick={() => handleDeposit(amt)}
              className="py-2.5 rounded-lg bg-[#131722] hover:bg-[#2962ff] text-white font-mono font-bold transition-all border border-[#2a2e39]"
            >
              +${amt.toLocaleString()}
            </button>
          ))}
        </div>

        <div>
          <label className="text-[#787b86] block mb-1">Custom Amount (USD)</label>
          <div className="flex space-x-2">
            <input
              type="number"
              value={customAmount}
              onChange={e => setCustomAmount(e.target.value)}
              className="flex-1 bg-[#131722] border border-[#2a2e39] rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-[#2962ff]"
            />
            <button
              onClick={() => {
                const num = parseFloat(customAmount);
                if (num > 0) handleDeposit(num);
              }}
              className="px-4 py-2 rounded bg-[#089981] hover:bg-[#067a67] text-white font-bold transition-colors"
            >
              Deposit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ResetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResetModal: React.FC<ResetModalProps> = ({ isOpen, onClose }) => {
  const { resetAccount } = useTrading();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#1e222d] border border-[#2a2e39] rounded-xl w-full max-w-sm p-5 shadow-2xl text-xs space-y-4">
        <div className="flex items-center space-x-2 text-[#f23645]">
          <AlertCircle className="w-5 h-5" />
          <h3 className="font-bold text-sm text-white">Reset Paper Trading Account</h3>
        </div>

        <p className="text-[#787b86]">
          This will reset your paper trading balance back to initial $100,000 USD and clear all open positions, pending orders, alerts, and trade history. This action cannot be undone.
        </p>

        <div className="flex space-x-2 justify-end pt-2">
          <button
            onClick={onClose}
            className="px-3 py-2 rounded bg-[#2a2e39] hover:bg-[#363a45] text-[#d1d4dc] font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              resetAccount();
              onClose();
            }}
            className="px-4 py-2 rounded bg-[#f23645] hover:bg-[#d42c3a] text-white font-bold"
          >
            Confirm Reset
          </button>
        </div>
      </div>
    </div>
  );
};

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AlertModal: React.FC<AlertModalProps> = ({ isOpen, onClose }) => {
  const { selectedAsset, addAlert } = useTrading();
  const [targetPrice, setTargetPrice] = useState<string>(selectedAsset.price.toString());
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const handleSave = () => {
    const num = parseFloat(targetPrice);
    if (!num) return;
    addAlert(num, condition, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#1e222d] border border-[#2a2e39] rounded-xl w-full max-w-md p-5 shadow-2xl text-xs space-y-3.5">
        <div className="flex items-center justify-between border-b border-[#2a2e39] pb-3">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-[#2962ff]" />
            <h3 className="font-bold text-sm text-white">Set Price Alert for {selectedAsset.displayName}</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-[#787b86] hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-[#131722] p-2.5 rounded border border-[#2a2e39] flex justify-between font-mono">
          <span className="text-[#787b86]">Current Market Price:</span>
          <span className="font-bold text-white">${selectedAsset.price.toFixed(selectedAsset.decimals)}</span>
        </div>

        <div>
          <label className="text-[#787b86] block mb-1">Trigger Condition</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setCondition('above')}
              className={`py-2 rounded font-bold transition-colors ${
                condition === 'above' ? 'bg-[#089981] text-white' : 'bg-[#131722] text-[#787b86] border border-[#2a2e39]'
              }`}
            >
              Price Rises Above (≥)
            </button>
            <button
              onClick={() => setCondition('below')}
              className={`py-2 rounded font-bold transition-colors ${
                condition === 'below' ? 'bg-[#f23645] text-white' : 'bg-[#131722] text-[#787b86] border border-[#2a2e39]'
              }`}
            >
              Price Drops Below (≤)
            </button>
          </div>
        </div>

        <div>
          <label className="text-[#787b86] block mb-1">Target Price ($)</label>
          <input
            type="number"
            value={targetPrice}
            onChange={e => setTargetPrice(e.target.value)}
            className="w-full bg-[#131722] border border-[#2a2e39] rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-[#2962ff]"
          />
        </div>

        <div>
          <label className="text-[#787b86] block mb-1">Alert Notes / Reminder (Optional)</label>
          <input
            type="text"
            placeholder="e.g. Breakout retest level or take profit"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full bg-[#131722] border border-[#2a2e39] rounded px-3 py-2 text-white placeholder-[#787b86] focus:outline-none focus:border-[#2962ff]"
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full py-2.5 rounded bg-[#2962ff] hover:bg-[#1e53e5] text-white font-bold transition-colors shadow"
        >
          Create Alert
        </button>
      </div>
    </div>
  );
};

interface PositionSizingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PositionSizingModal: React.FC<PositionSizingModalProps> = ({ isOpen, onClose }) => {
  const { totalEquityUSD, selectedAsset } = useTrading();
  const [riskPercent, setRiskPercent] = useState<string>('2');
  const [entryPrice, setEntryPrice] = useState<string>(selectedAsset.price.toString());
  const [stopLossPrice, setStopLossPrice] = useState<string>((selectedAsset.price * 0.97).toFixed(selectedAsset.decimals));

  if (!isOpen) return null;

  const numEquity = totalEquityUSD;
  const numRiskPct = parseFloat(riskPercent) || 0;
  const numEntry = parseFloat(entryPrice) || 0;
  const numSL = parseFloat(stopLossPrice) || 0;

  const riskAmountUSD = (numEquity * numRiskPct) / 100;
  const stopDistance = Math.abs(numEntry - numSL);
  const recommendedQty = stopDistance > 0 ? riskAmountUSD / stopDistance : 0;
  const positionValueUSD = recommendedQty * numEntry;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#1e222d] border border-[#2a2e39] rounded-xl w-full max-w-md p-5 shadow-2xl text-xs space-y-3.5">
        <div className="flex items-center justify-between border-b border-[#2a2e39] pb-3">
          <div className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-[#2962ff]" />
            <h3 className="font-bold text-sm text-white">Position Sizing & Risk Calculator</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-[#787b86] hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5">
          <div className="flex justify-between items-center bg-[#131722] p-2.5 rounded border border-[#2a2e39]">
            <span className="text-[#787b86]">Total Account Equity:</span>
            <span className="font-mono font-bold text-white">${numEquity.toLocaleString()}</span>
          </div>

          <div>
            <label className="text-[#787b86] block mb-1">Max Risk Per Trade (%)</label>
            <div className="flex space-x-2">
              {[1, 2, 3, 5].map(pct => (
                <button
                  key={pct}
                  onClick={() => setRiskPercent(pct.toString())}
                  className={`flex-1 py-1.5 rounded font-mono font-bold ${
                    riskPercent === pct.toString() ? 'bg-[#2962ff] text-white' : 'bg-[#131722] text-[#787b86] border border-[#2a2e39]'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[#787b86] block mb-1">Planned Entry Price</label>
              <input
                type="number"
                value={entryPrice}
                onChange={e => setEntryPrice(e.target.value)}
                className="w-full bg-[#131722] border border-[#2a2e39] rounded px-3 py-1.5 text-white font-mono"
              />
            </div>
            <div>
              <label className="text-[#787b86] block mb-1">Stop Loss Price</label>
              <input
                type="number"
                value={stopLossPrice}
                onChange={e => setStopLossPrice(e.target.value)}
                className="w-full bg-[#131722] border border-[#2a2e39] rounded px-3 py-1.5 text-white font-mono"
              />
            </div>
          </div>

          {/* Results calculation */}
          <div className="bg-[#131722] p-3 rounded-lg border border-[#2a2e39] space-y-2 font-mono">
            <div className="flex justify-between">
              <span className="text-[#787b86]">Max Capital at Risk:</span>
              <span className="text-[#f23645] font-bold">${riskAmountUSD.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#787b86]">Stop Distance:</span>
              <span className="text-white">${stopDistance.toFixed(selectedAsset.decimals)}</span>
            </div>
            <div className="flex justify-between border-t border-[#2a2e39] pt-1.5 text-sm">
              <span className="text-white font-bold font-sans">Recommended Size:</span>
              <span className="text-[#089981] font-bold">
                {selectedAsset.minQty < 1 ? recommendedQty.toFixed(3) : Math.floor(recommendedQty)}{' '}
                {selectedAsset.displayName.split('/')[0]}
              </span>
            </div>
            <div className="flex justify-between text-[#787b86] text-[11px]">
              <span>Total Position Value:</span>
              <span>${positionValueUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded bg-[#2962ff] hover:bg-[#1e53e5] text-white font-bold transition-colors"
        >
          Got It
        </button>
      </div>
    </div>
  );
};

interface EditTPSLModalProps {
  position: Position | null;
  onClose: () => void;
}

export const EditTPSLModal: React.FC<EditTPSLModalProps> = ({ position, onClose }) => {
  const { updatePositionTPSL } = useTrading();
  const [tp, setTp] = useState<string>(position?.takeProfit?.toString() || '');
  const [sl, setSl] = useState<string>(position?.stopLoss?.toString() || '');

  useEffect(() => {
    setTp(position?.takeProfit?.toString() || '');
    setSl(position?.stopLoss?.toString() || '');
  }, [position]);

  if (!position) return null;

  const handleSave = () => {
    const numTP = parseFloat(tp) || undefined;
    const numSL = parseFloat(sl) || undefined;
    updatePositionTPSL(position.id, numTP, numSL);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#1e222d] border border-[#2a2e39] rounded-xl w-full max-w-sm p-5 shadow-2xl text-xs space-y-3.5">
        <div className="flex items-center justify-between border-b border-[#2a2e39] pb-3">
          <h3 className="font-bold text-sm text-white">Edit TP / SL ({position.displayName})</h3>
          <button onClick={onClose} className="p-1 rounded text-[#787b86] hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          <div>
            <label className="text-[#787b86] block mb-1">Take Profit Price</label>
            <input
              type="number"
              value={tp}
              placeholder="No Take Profit"
              onChange={e => setTp(e.target.value)}
              className="w-full bg-[#131722] border border-[#2a2e39] rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-[#089981]"
            />
          </div>

          <div>
            <label className="text-[#787b86] block mb-1">Stop Loss Price</label>
            <input
              type="number"
              value={sl}
              placeholder="No Stop Loss"
              onChange={e => setSl(e.target.value)}
              className="w-full bg-[#131722] border border-[#2a2e39] rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-[#f23645]"
            />
          </div>
        </div>

        <div className="flex space-x-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded bg-[#2a2e39] text-white font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2 rounded bg-[#2962ff] text-white font-bold"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export const NotificationToasts: React.FC = () => {
  const { notifications, dismissNotification } = useTrading();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-sm pointer-events-none">
      {notifications.map(n => {
        const isSuccess = n.type === 'success';
        const isError = n.type === 'error';
        const isWarning = n.type === 'warning';

        return (
          <div
            key={n.id}
            className={`p-3 rounded-lg shadow-2xl border text-xs pointer-events-auto flex items-start space-x-2.5 transition-all animate-in slide-in-from-right-4 ${
              isSuccess
                ? 'bg-[#131722] border-[#089981] text-white'
                : isError
                ? 'bg-[#131722] border-[#f23645] text-white'
                : isWarning
                ? 'bg-[#131722] border-[#f59e0b] text-white'
                : 'bg-[#131722] border-[#2962ff] text-white'
            }`}
          >
            {isSuccess && <CheckCircle className="w-4 h-4 text-[#089981] shrink-0 mt-0.5" />}
            {isError && <AlertCircle className="w-4 h-4 text-[#f23645] shrink-0 mt-0.5" />}
            {isWarning && <ShieldCheck className="w-4 h-4 text-[#f59e0b] shrink-0 mt-0.5" />}
            {!isSuccess && !isError && !isWarning && <Bell className="w-4 h-4 text-[#2962ff] shrink-0 mt-0.5" />}

            <div className="flex-1">
              <div className="font-bold text-white">{n.title}</div>
              <div className="text-[#d1d4dc] text-[11px] mt-0.5">{n.message}</div>
            </div>

            <button
              onClick={() => dismissNotification(n.id)}
              className="text-[#787b86] hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
