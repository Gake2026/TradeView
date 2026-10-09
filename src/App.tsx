import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TradingProvider, useTrading } from './context/TradingContext';
import { TopTickerBar } from './components/TopTickerBar';
import { WatchlistSidebar } from './components/WatchlistSidebar';
import { TradingViewWidget } from './components/TradingViewWidget';
import { CustomTechnicalChart } from './components/CustomTechnicalChart';
import { TradeExecutionPanel } from './components/TradeExecutionPanel';
import { OptionsChainPanel } from './components/OptionsChainPanel';
import { OrderBookDepth } from './components/OrderBookDepth';
import { BottomTradeTabs } from './components/BottomTradeTabs';
import { LandingScreen } from './components/LandingScreen';
import { 
  DepositModal, 
  ResetModal, 
  AlertModal, 
  PositionSizingModal, 
  EditTPSLModal, 
  NotificationToasts 
} from './components/TradingModals';
import { Position } from './types';
import { 
  BarChart2, 
  List, 
  TrendingUp, 
  Briefcase, 
  Newspaper 
} from 'lucide-react';

interface MainDashboardProps {
  onReturnToLanding: () => void;
  initialMobileView?: 'chart' | 'trade' | 'watchlist' | 'positions';
}

const MainDashboard: React.FC<MainDashboardProps> = ({ onReturnToLanding, initialMobileView }) => {
  const { selectedAsset, tradeMode, placeSpotOrder } = useTrading();

  // View state
  const [chartEngine, setChartEngine] = useState<'tradingview' | 'custom'>('tradingview');
  const [isWatchlistOpen, setIsWatchlistOpen] = useState<boolean>(true);
  const [isTradePanelOpen, setIsTradePanelOpen] = useState<boolean>(true);
  const [showOrderBook, setShowOrderBook] = useState<boolean>(true);

  // Modals state
  const [isDepositOpen, setIsDepositOpen] = useState<boolean>(false);
  const [isResetOpen, setIsResetOpen] = useState<boolean>(false);
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [isSizingOpen, setIsSizingOpen] = useState<boolean>(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);

  // Mobile navigation active view
  const [mobileView, setMobileView] = useState<'chart' | 'trade' | 'watchlist' | 'positions'>(initialMobileView || 'chart');

  useEffect(() => {
    if (initialMobileView) {
      setMobileView(initialMobileView);
    }
  }, [initialMobileView]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#131722] text-[#d1d4dc] font-sans select-none">
      {/* 1. Top Ticker & Header */}
      <TopTickerBar
        chartEngine={chartEngine}
        setChartEngine={setChartEngine}
        onOpenAlertModal={() => setIsAlertOpen(true)}
        onOpenDepositModal={() => setIsDepositOpen(true)}
        onOpenResetModal={() => setIsResetOpen(true)}
        onToggleWatchlist={() => {
          setIsWatchlistOpen(prev => !prev);
          setMobileView(prev => (prev === 'watchlist' ? 'chart' : 'watchlist'));
        }}
        onToggleTradePanel={() => setIsTradePanelOpen(prev => !prev)}
        isTradePanelOpen={isTradePanelOpen}
        onReturnToLanding={onReturnToLanding}
      />

      {/* 2. Main Center Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Watchlist Sidebar (Desktop) */}
        <div className="hidden lg:flex">
          <WatchlistSidebar
            isOpen={isWatchlistOpen}
            onClose={() => setIsWatchlistOpen(false)}
          />
        </div>

        {/* Center Main Stage (Desktop) */}
        <main className="hidden lg:flex flex-1 flex-col h-full overflow-hidden bg-[#131722]">
          <div className="flex-1 w-full h-full relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={tradeMode === 'options' ? 'options' : chartEngine}
                initial={{ opacity: 0, scale: 0.995 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.005 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                style={{ willChange: 'opacity, transform' }}
                className="w-full h-full"
              >
                {tradeMode === 'options' ? (
                  <OptionsChainPanel />
                ) : chartEngine === 'tradingview' ? (
                  <TradingViewWidget 
                    asset={selectedAsset} 
                    onSwitchToCustomChart={() => setChartEngine('custom')}
                  />
                ) : (
                  <CustomTechnicalChart
                    asset={selectedAsset}
                    onQuickBuy={() => placeSpotOrder({ side: 'buy', orderType: 'market', size: selectedAsset.lotSize || 1 })}
                    onQuickSell={() => placeSpotOrder({ side: 'sell', orderType: 'market', size: selectedAsset.lotSize || 1 })}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom Tabs Panel (Desktop) */}
          <div className="h-64 border-t border-[#2a2e39] flex flex-col shrink-0">
            <BottomTradeTabs
              onOpenEditTPSL={(pos) => setEditingPosition(pos)}
              onOpenAlertModal={() => setIsAlertOpen(true)}
              onOpenTrade={() => setIsTradePanelOpen(true)}
            />
          </div>
        </main>

        {/* Right Side: Order Book & Trades (Desktop only) */}
        <div className="hidden xl:flex h-full">
          {showOrderBook && <OrderBookDepth />}
        </div>

        {/* Right Side: Trade Execution Panel (Desktop) */}
        <div className={isTradePanelOpen ? 'hidden lg:flex' : 'hidden'}>
          <TradeExecutionPanel
            onOpenPositionSizingModal={() => setIsSizingOpen(true)}
            onClose={() => setIsTradePanelOpen(false)}
          />
        </div>

        {/* Quick reopen tab for Trade Panel on desktop when closed */}
        {!isTradePanelOpen && (
          <button
            onClick={() => setIsTradePanelOpen(true)}
            className="hidden lg:flex fixed right-0 top-1/2 -translate-y-1/2 z-30 bg-[#2962ff] hover:bg-[#1e53e5] text-white py-2.5 px-2 rounded-l-md font-bold text-xs items-center space-x-1.5 shadow-xl transition-all cursor-pointer"
            title="Open Trade Execution Panel"
          >
            <span className="icon-bounce"><TrendingUp className="w-3.5 h-3.5" /></span>
            <span className="text-[11px]">TRADE</span>
          </button>
        )}

        {/* Mobile View Container - Fully Responsive & Screen-Fitted (No Overlap, No Void) */}
        <div className="flex-1 flex flex-col h-full w-full overflow-hidden lg:hidden relative bg-[#131722]">
          <AnimatePresence mode="wait">
            {mobileView === 'chart' && (
              <motion.div
                key="mobile-chart"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                style={{ willChange: 'opacity' }}
                className="w-full h-full relative overflow-hidden"
              >
                {tradeMode === 'options' ? (
                  <OptionsChainPanel />
                ) : chartEngine === 'tradingview' ? (
                  <TradingViewWidget 
                    asset={selectedAsset} 
                    onSwitchToCustomChart={() => setChartEngine('custom')}
                  />
                ) : (
                  <CustomTechnicalChart
                    asset={selectedAsset}
                    onQuickBuy={() => placeSpotOrder({ side: 'buy', orderType: 'market', size: selectedAsset.lotSize || 1 })}
                    onQuickSell={() => placeSpotOrder({ side: 'sell', orderType: 'market', size: selectedAsset.lotSize || 1 })}
                  />
                )}
              </motion.div>
            )}

            {mobileView === 'watchlist' && (
              <motion.div
                key="mobile-watchlist"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                style={{ willChange: 'transform, opacity' }}
                className="w-full h-full bg-[#1e222d] overflow-hidden"
              >
                <WatchlistSidebar
                  isOpen={true}
                  onClose={() => setMobileView('chart')}
                />
              </motion.div>
            )}

            {mobileView === 'trade' && (
              <motion.div
                key="mobile-trade"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                style={{ willChange: 'transform, opacity' }}
                className="w-full h-full bg-[#1e222d] overflow-hidden"
              >
                <TradeExecutionPanel
                  onOpenPositionSizingModal={() => setIsSizingOpen(true)}
                  onClose={() => setMobileView('chart')}
                />
              </motion.div>
            )}

            {mobileView === 'positions' && (
              <motion.div
                key="mobile-positions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                style={{ willChange: 'transform, opacity' }}
                className="w-full h-full bg-[#1e222d] flex flex-col overflow-hidden"
              >
                <div className="flex justify-between items-center px-3 py-2 bg-[#171b26] border-b border-[#2a2e39] shrink-0">
                  <span className="font-bold text-white text-xs">Positions & Orders</span>
                  <button
                    onClick={() => setMobileView('chart')}
                    className="text-[#787b86] hover:text-white text-[11px] font-semibold px-2 py-0.5 bg-[#2a2e39] hover:bg-[#363a45] rounded transition-colors cursor-pointer"
                  >
                    Back to Chart
                  </button>
                </div>
                <div className="flex-1 min-h-0 overflow-hidden">
                  <BottomTradeTabs
                    onOpenEditTPSL={(pos) => setEditingPosition(pos)}
                    onOpenAlertModal={() => setIsAlertOpen(true)}
                    onOpenTrade={() => setMobileView('trade')}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (Always Visible on Small Screens, Zero Overlap) */}
      <div className="flex lg:hidden items-center justify-around bg-[#1e222d] border-t border-[#2a2e39] py-2 px-1 text-[11px] font-semibold z-30 shrink-0">
        <button
          onClick={() => setMobileView('watchlist')}
          className={`flex flex-col items-center space-y-0.5 transition-colors cursor-pointer ${mobileView === 'watchlist' ? 'text-[#2962ff]' : 'text-[#787b86] hover:text-white'}`}
        >
          <span className="icon-bounce"><List className="w-4 h-4" /></span>
          <span>Watchlist</span>
        </button>

        <button
          onClick={() => setMobileView('chart')}
          className={`flex flex-col items-center space-y-0.5 transition-colors cursor-pointer ${mobileView === 'chart' ? 'text-[#2962ff]' : 'text-[#787b86] hover:text-white'}`}
        >
          <span className="icon-bounce"><BarChart2 className="w-4 h-4" /></span>
          <span>Chart</span>
        </button>

        <button
          onClick={() => setMobileView('trade')}
          className={`flex flex-col items-center space-y-0.5 transition-colors cursor-pointer ${mobileView === 'trade' ? 'text-[#2962ff]' : 'text-[#787b86] hover:text-white'}`}
        >
          <span className="icon-bounce"><TrendingUp className="w-4 h-4" /></span>
          <span>Trade</span>
        </button>

        <button
          onClick={() => setMobileView('positions')}
          className={`flex flex-col items-center space-y-0.5 transition-colors cursor-pointer ${mobileView === 'positions' ? 'text-[#2962ff]' : 'text-[#787b86] hover:text-white'}`}
        >
          <span className="icon-bounce"><Briefcase className="w-4 h-4" /></span>
          <span>Positions</span>
        </button>

        <button
          onClick={onReturnToLanding}
          className="flex flex-col items-center space-y-0.5 text-[#e5b869] hover:text-white transition-colors cursor-pointer"
          title="Wall Street Wire & News"
        >
          <span className="icon-bounce"><Newspaper className="w-4 h-4 text-[#c59b27]" /></span>
          <span>News</span>
        </button>
      </div>

      {/* Modals & Dialogs */}
      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
      />

      <ResetModal
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
      />

      <AlertModal
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
      />

      <PositionSizingModal
        isOpen={isSizingOpen}
        onClose={() => setIsSizingOpen(false)}
      />

      <EditTPSLModal
        position={editingPosition}
        onClose={() => setEditingPosition(null)}
      />

      {/* Real-time Toast Notifications */}
      <NotificationToasts />
    </div>
  );
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'landing' | 'terminal'>('landing');
  const [targetMobileView, setTargetMobileView] = useState<'chart' | 'trade' | 'watchlist' | 'positions'>('chart');
  const scrollPosRef = React.useRef<number>(0);

  const handleEnterTerminal = (view: 'chart' | 'trade' | 'watchlist' | 'positions' = 'chart') => {
    scrollPosRef.current = window.scrollY;
    setTargetMobileView(view);
    setCurrentScreen('terminal');
  };

  const handleReturnToLanding = () => {
    setCurrentScreen('landing');
    requestAnimationFrame(() => {
      window.scrollTo({ top: scrollPosRef.current, behavior: 'instant' });
    });
  };

  return (
    <TradingProvider>
      <div className="w-full min-h-screen bg-[#0d1117] overflow-x-hidden relative">
        {/* News & Landing Screen with simple smooth crossfade */}
        <div 
          className={`w-full min-h-screen transition-opacity duration-200 ease-out ${
            currentScreen === 'landing' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          style={{ willChange: 'opacity' }}
        >
          <LandingScreen 
            onEnterPlatform={() => handleEnterTerminal('chart')}
            onSelectAssetAndEnter={(_asset) => handleEnterTerminal('trade')}
          />
        </div>

        {/* Trading Terminal / Charts Dashboard with simple smooth crossfade */}
        <div 
          className={`fixed inset-0 w-full h-screen overflow-hidden z-30 transition-opacity duration-200 ease-out ${
            currentScreen === 'terminal' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          style={{ willChange: 'opacity' }}
        >
          <MainDashboard 
            onReturnToLanding={handleReturnToLanding} 
            initialMobileView={targetMobileView}
          />
        </div>
      </div>
    </TradingProvider>
  );
}

