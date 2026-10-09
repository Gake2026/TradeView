import React, { useState, useEffect, memo } from 'react';
import { MarketAsset } from '../types';
import { AlertCircle, RefreshCw, BarChart2 } from 'lucide-react';

interface TradingViewWidgetProps {
  asset: MarketAsset;
  onSwitchToCustomChart?: () => void;
}

const TradingViewWidgetComponent: React.FC<TradingViewWidgetProps> = ({ 
  asset,
  onSwitchToCustomChart 
}) => {
  const [hasError, setHasError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Determine appropriate exchange symbol
  const symbolToUse = asset.tvSymbol || (asset.category === 'crypto' ? `BINANCE:${asset.symbol}` : asset.symbol);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [symbolToUse]);

  // Construct official TradingView embed iframe URL
  const queryParams = new URLSearchParams({
    symbol: symbolToUse,
    interval: '15',
    hidesidetoolbar: '0',
    symboledit: '1',
    saveimage: '1',
    toolbarbg: '131722',
    theme: 'dark',
    style: '1',
    timezone: 'Etc/UTC',
    locale: 'en',
    utm_source: 'tradingview.com',
    utm_medium: 'widget',
    utm_campaign: 'chart',
    utm_term: symbolToUse,
  });

  const iframeSrc = `https://s.tradingview.com/widgetembed/?frameElementId=tradingview_widget&${queryParams.toString()}`;

  return (
    <div className="relative w-full h-full min-h-0 bg-[#131722] overflow-hidden flex flex-col">
      {/* Loading Overlay */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#131722] text-[#787b86] space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin text-[#2962ff]" />
          <span className="text-xs font-medium">Connecting to TradingView live feed ({asset.displayName})...</span>
        </div>
      )}

      {/* Fallback if external TradingView frame is blocked */}
      {hasError ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-[#787b86] space-y-3">
          <AlertCircle className="w-10 h-10 text-[#f23645]" />
          <div>
            <h4 className="text-white font-bold text-sm">TradingView Widget Blocked</h4>
            <p className="text-xs max-w-sm mt-1">
              External TradingView iframe was restricted in this sandbox environment. Switch to the native Canvas Technical Chart for uninterrupted real-time trading.
            </p>
          </div>
          {onSwitchToCustomChart && (
            <button
              onClick={onSwitchToCustomChart}
              className="px-4 py-2 rounded bg-[#2962ff] text-white font-semibold text-xs flex items-center space-x-1.5 hover:bg-[#1e53e5] transition-colors"
            >
              <BarChart2 className="w-4 h-4" />
              <span>Switch to Native Canvas Chart</span>
            </button>
          )}
        </div>
      ) : (
        <iframe
          key={`${asset.symbol}-${symbolToUse}`}
          title={`TradingView Chart - ${asset.displayName}`}
          src={iframeSrc}
          className="w-full h-full flex-1 border-0"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
          allow="clipboard-write"
          loading="lazy"
        />
      )}
    </div>
  );
};

export const TradingViewWidget = memo(TradingViewWidgetComponent);
