import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTrading } from '../context/TradingContext';
import { MARKET_NEWS, WALL_STREET_STATS, getTickerLogo } from '../data/marketNews';
import { MarketAsset } from '../types';
import { 
  TrendingUp, 
  ArrowRight, 
  ShieldCheck, 
  Sliders, 
  ChevronRight, 
  LineChart, 
  Globe 
} from 'lucide-react';

interface LandingScreenProps {
  onEnterPlatform: () => void;
  onSelectAssetAndEnter?: (asset: MarketAsset) => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({
  onEnterPlatform,
  onSelectAssetAndEnter,
}) => {
  const { assets, setSelectedAsset } = useTrading();
  const [selectedNewsCategory, setSelectedNewsCategory] = useState<string>('All');
  const [activeMarketTab, setActiveMarketTab] = useState<'all' | 'crypto' | 'us_stock' | 'indian_stock'>('all');

  // Filter news
  const filteredNews = selectedNewsCategory === 'All' 
    ? MARKET_NEWS 
    : MARKET_NEWS.filter(item => item.category === selectedNewsCategory);

  // Spotlight assets
  const btcAsset = assets.find(a => a.symbol === 'BTCUSDT');
  const nvdaAsset = assets.find(a => a.symbol === 'NVDA');
  const relianceAsset = assets.find(a => a.symbol === 'RELIANCE');

  // Group assets for showcase
  const topCrypto = assets.filter(a => a.category === 'crypto').slice(0, 6);
  const topUS = assets.filter(a => a.category === 'us_stock').slice(0, 6);
  const topIndian = assets.filter(a => a.category === 'indian_stock').slice(0, 6);

  const displayedAssets = activeMarketTab === 'all' 
    ? [...topCrypto.slice(0, 3), ...topUS.slice(0, 3), ...topIndian.slice(0, 3)]
    : activeMarketTab === 'crypto' 
    ? topCrypto 
    : activeMarketTab === 'us_stock' 
    ? topUS 
    : topIndian;

  const handleAssetClick = (asset: MarketAsset) => {
    setSelectedAsset(asset);
    if (onSelectAssetAndEnter) {
      onSelectAssetAndEnter(asset);
    } else {
      onEnterPlatform();
    }
  };

  const categories = ['All', 'Macro & Fed', 'Crypto', 'US Stocks', 'Indian Markets'];

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] font-sans selection:bg-[#c59b27] selection:text-black overflow-x-hidden">
      
      {/* 1. ATMOSPHERIC SKYLINE BACKGROUND & LIQUID GLASS HERO SECTION (Optimized for 60fps Scrolling) */}
      <div className="relative overflow-hidden border-b border-[#21262d]">
        {/* Cinematic New York City Skyline Background Image - hardware accelerated with zero filter overhead */}
        <div 
          className="absolute inset-x-0 top-0 h-[880px] sm:h-[920px] md:h-[980px] overflow-hidden pointer-events-none select-none z-0"
          style={{ willChange: 'transform', transform: 'translateZ(0)', contain: 'paint' }}
        >
          <img
            src="https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?auto=format&fit=crop&w=1800&q=85"
            alt="New York Manhattan Skyline"
            referrerPolicy="no-referrer"
            loading="eager"
            className="w-full h-full object-cover object-top opacity-85"
          />
          {/* Atmospheric gradient matching the reference: keeps the sky, golden horizon, and Manhattan buildings clearly visible while gently blending into the dark base */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#070d1a]/20 via-[#070b15]/35 via-50% to-[#0d1117]" />
        </div>

        {/* 1. TOP LIQUID GLASS TICKER PILL */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-3 sm:pt-4 relative z-20">
          <div className="rounded-2xl bg-[#090f1f]/75 backdrop-blur-xl border border-cyan-400/30 px-4 py-2 text-[11px] font-mono flex items-center justify-between shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.25),0_6px_24px_rgba(0,0,0,0.45)] overflow-x-auto no-scrollbar gap-4">
            <div className="flex items-center space-x-4 sm:space-x-6 shrink-0">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#00c087] animate-pulse" />
                <span className="font-bold text-white tracking-widest text-[10px] uppercase">NYSE / NASDAQ / BINANCE / NSE</span>
                <span className="bg-[#c59b27]/30 text-[#fde68a] px-2 py-0.5 rounded-full font-bold text-[9px] border border-[#c59b27]/50 shadow-sm">REAL-TIME FEEDS</span>
              </div>

              <div className="h-3 w-[1px] bg-cyan-400/25" />

              {/* Indices Ticker with crisp contrast */}
              <div className="flex items-center space-x-4 sm:space-x-5 text-slate-200">
                <span className="flex items-center space-x-1.5">
                  <span className="text-white font-bold">S&P 500</span>
                  <span className="text-white font-mono font-medium">5,620.40</span>
                  <span className="text-[#00c087] font-bold">+0.42%</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="text-white font-bold">NASDAQ</span>
                  <span className="text-white font-mono font-medium">17,820.15</span>
                  <span className="text-[#00c087] font-bold">+0.89%</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="text-white font-bold">NIFTY 50</span>
                  <span className="text-white font-mono font-medium">25,410.80</span>
                  <span className="text-[#00c087] font-bold">+0.68%</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="text-white font-bold">BTC/USD</span>
                  <span className="text-white font-mono font-medium">$78,112</span>
                  <span className="text-[#00c087] font-bold">+1.59%</span>
                </span>
              </div>
            </div>

            <div className="shrink-0 flex items-center space-x-3">
              <span className="text-slate-200 text-[10px] hidden md:inline font-mono font-semibold">Simulated Capital: $100,000</span>
              <button 
                onClick={onEnterPlatform}
                className="group px-3 py-1 rounded-xl bg-gradient-to-b from-[#fde68a] via-[#e5b869] to-[#c59b27] hover:brightness-105 active:scale-95 text-black font-sans font-bold text-[10px] uppercase tracking-wider transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),0_2px_8px_rgba(217,119,6,0.35)] flex items-center space-x-1 cursor-pointer"
              >
                <span>Launch App</span>
                <span className="icon-bounce group-hover:translate-x-0.5">
                  <ChevronRight className="w-3 h-3" />
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. FLOATING LIQUID GLASS NAVBAR */}
        <nav className="max-w-7xl mx-auto px-3 sm:px-6 my-3 sm:my-4 relative z-20">
          <div className="rounded-2xl sm:rounded-3xl bg-[#090f1f]/75 backdrop-blur-xl border border-cyan-400/35 shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.3),0_12px_36px_rgba(0,0,0,0.5)] px-4 sm:px-6 py-3 flex items-center justify-between">
            {/* Left Logo with Liquid Glass Icon */}
            <div className="flex items-center space-x-3">
              <div 
                onClick={onEnterPlatform}
                title="Tradeview Simulation"
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00c087] via-[#0284c7] to-[#e5b869] p-[1.5px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_4px_16px_rgba(0,0,0,0.5)] cursor-pointer group"
              >
                <div className="w-full h-full rounded-[10px] bg-[#070d18]/90 flex items-center justify-center">
                  <span className="icon-bounce animate-icon-float">
                    <TrendingUp className="w-5 h-5 text-[#f5d17a] stroke-[2.5]" />
                  </span>
                </div>
              </div>
              <div>
                <span className="font-serif font-black tracking-wider text-lg sm:text-xl text-white block drop-shadow-sm">TRADEVIEW</span>
                <p className="text-[9px] font-mono text-slate-300 uppercase tracking-widest -mt-0.5 font-semibold">INSTITUTIONAL SIMULATION TERMINAL</p>
              </div>
            </div>

            {/* Right Nav Links & Liquid Gold Glass CTA */}
            <div className="flex items-center space-x-4">
              <a href="#markets" className="text-xs font-bold text-slate-200 hover:text-white transition-colors hidden sm:inline">
                Live Markets
              </a>
              <a href="#news" className="text-xs font-bold text-slate-200 hover:text-white transition-colors hidden sm:inline">
                Wall Street Wire
              </a>
              <a href="#features" className="text-xs font-bold text-slate-200 hover:text-white transition-colors hidden md:inline">
                Terminal Suite
              </a>

              {/* Liquid Gold Glass GET STARTED Button */}
              <button
                onClick={onEnterPlatform}
                className="group relative inline-flex items-center justify-center px-5 sm:px-6 py-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-b from-[#fde68a] via-[#e5b869] to-[#c59b27] border border-[#fffbeb]/80 shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.9),0_6px_20px_rgba(217,119,6,0.45)] hover:brightness-105 active:scale-95 transition-all text-black font-sans font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                <span className="flex items-center space-x-1.5">
                  <span>Get Started</span>
                  <span className="icon-bounce group-hover:translate-x-0.5">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </span>
              </button>
            </div>
          </div>
        </nav>

        {/* 3. HERO CONTENT & LIQUID GLASS CONTROLS */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-14 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-4 sm:space-y-5">
            
            {/* Main Editorial Headline - High Visibility with drop-shadow against skyline */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.15] drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
              Master Global Markets
              <span className="block mt-1 sm:mt-1.5">
                with{' '}
                <span className="italic font-serif text-[#f5a623] drop-shadow-[0_2px_18px_rgba(245,166,35,0.6)]">
                  Wall
                </span>{' '}
                <span className="italic font-serif text-[#00c087] drop-shadow-[0_2px_18px_rgba(0,192,135,0.6)]">
                  Street
                </span>
              </span>
              <span className="block mt-1 sm:mt-1.5 text-white">
                Precision.
              </span>
            </h1>

            {/* High-visibility Sub-headline with strong backdrop text shadow */}
            <p className="text-sm sm:text-base text-slate-100 font-sans max-w-2xl mx-auto leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,1)] font-medium">
              Real-time exchange execution, interactive TradingView technical charts, 
              options matrix, and up to 100x leverage on top crypto, US megacaps, and Indian blue chips.
            </p>

            {/* Primary Hero Actions (Liquid Glass Buttons with Bouncy Icons) */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <button
                onClick={onEnterPlatform}
                className="group w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-b from-[#fde68a] via-[#e5b869] to-[#c59b27] border border-[#fffbeb]/90 shadow-[inset_0_2px_1.5px_rgba(255,255,255,0.95),0_12px_32px_rgba(229,184,105,0.5)] hover:brightness-105 active:scale-95 transition-all flex items-center justify-center space-x-2 text-black font-sans font-bold text-sm tracking-wider uppercase cursor-pointer"
              >
                <span>Launch Trading Terminal</span>
                <span className="icon-bounce group-hover:translate-x-1">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </button>

              <a
                href="#markets"
                className="group w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#090f1f]/75 backdrop-blur-xl border border-cyan-400/40 hover:border-cyan-400/75 shadow-[inset_0_1.5px_1.5px_rgba(255,255,255,0.25),0_8px_24px_rgba(0,0,0,0.45)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center space-x-2 text-white font-sans font-bold text-xs tracking-wider uppercase"
              >
                <span className="icon-bounce text-[#f0c77a] group-hover:scale-110">
                  <LineChart className="w-4 h-4" />
                </span>
                <span>Explore 30+ Assets</span>
              </a>
            </div>

            {/* 4 Liquid Glass Stat Cards blending with the skyline background */}
            <div className="pt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto font-mono text-left">
              {WALL_STREET_STATS.map((stat, i) => (
                <div 
                  key={i} 
                  className="p-4 sm:p-5 rounded-2xl bg-[#090f1f]/75 backdrop-blur-xl border border-cyan-400/30 hover:border-cyan-400/55 shadow-[inset_0_1.5px_1.5px_rgba(255,255,255,0.2),0_8px_24px_rgba(0,0,0,0.45)] transition-all group"
                >
                  <div className="text-[10px] sm:text-[11px] text-slate-200 font-bold uppercase tracking-wider">{stat.label}</div>
                  <div className={`text-2xl sm:text-3xl font-bold my-1 sm:my-1.5 ${stat.highlight ? 'text-[#f5a623]' : 'text-white'} drop-shadow-sm`}>
                    {stat.value}
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-300 font-medium truncate">{stat.sub}</div>
                </div>
              ))}
            </div>

          </div>

          {/* 4. REAL-TIME SPOTLIGHT CARDS (Liquid Glass with Background Blend) */}
          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* BTC Card */}
            {btcAsset && (
              <div 
                onClick={() => handleAssetClick(btcAsset)}
                className="group p-5 rounded-2xl bg-[#090f1f]/75 backdrop-blur-xl border border-cyan-400/25 hover:border-[#f5d17a]/70 shadow-[inset_0_1.5px_1.5px_rgba(255,255,255,0.18),0_10px_30px_rgba(0,0,0,0.5)] transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="icon-bounce w-9 h-9 rounded-full bg-[#f7931a]/20 border border-[#f7931a]/40 p-1 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform overflow-hidden">
                      <img 
                        src={getTickerLogo('BTC')} 
                        alt="Bitcoin" 
                        referrerPolicy="no-referrer" 
                        className="w-full h-full object-contain rounded-full" 
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">Bitcoin</div>
                      <div className="text-[10px] font-mono text-slate-300">BTC / USDT • SPOT & FUTURES</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00c087]/20 border border-[#00c087]/40 text-[#00c087] font-bold">
                    +{btcAsset.changePercent24h.toFixed(2)}%
                  </span>
                </div>
                <div className="flex items-baseline justify-between mt-2">
                  <div className="font-mono text-2xl font-bold text-white drop-shadow-sm">
                    ${btcAsset.price.toLocaleString()}
                  </div>
                  <span className="text-xs text-[#f5d17a] group-hover:translate-x-1 transition-transform flex items-center space-x-1 font-bold">
                    <span>Trade Now</span>
                    <span className="icon-bounce">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </span>
                </div>
              </div>
            )}

            {/* NVDA Card */}
            {nvdaAsset && (
              <div 
                onClick={() => handleAssetClick(nvdaAsset)}
                className="group p-5 rounded-2xl bg-[#090f1f]/75 backdrop-blur-xl border border-cyan-400/25 hover:border-[#00c087]/70 shadow-[inset_0_1.5px_1.5px_rgba(255,255,255,0.18),0_10px_30px_rgba(0,0,0,0.5)] transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="icon-bounce w-9 h-9 rounded-full bg-[#76b900]/20 border border-[#76b900]/40 p-1 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform overflow-hidden">
                      <img 
                        src={getTickerLogo('NVDA')} 
                        alt="Nvidia" 
                        referrerPolicy="no-referrer" 
                        className="w-full h-full object-contain rounded-full" 
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">Nvidia Corp</div>
                      <div className="text-[10px] font-mono text-slate-300">NASDAQ: NVDA • AI SILICON</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00c087]/20 border border-[#00c087]/40 text-[#00c087] font-bold">
                    +{nvdaAsset.changePercent24h.toFixed(2)}%
                  </span>
                </div>
                <div className="flex items-baseline justify-between mt-2">
                  <div className="font-mono text-2xl font-bold text-white drop-shadow-sm">
                    ${nvdaAsset.price.toFixed(2)}
                  </div>
                  <span className="text-xs text-[#00c087] group-hover:translate-x-1 transition-transform flex items-center space-x-1 font-bold">
                    <span>Trade Now</span>
                    <span className="icon-bounce">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </span>
                </div>
              </div>
            )}

            {/* RELIANCE Card */}
            {relianceAsset && (
              <div 
                onClick={() => handleAssetClick(relianceAsset)}
                className="group p-5 rounded-2xl bg-[#090f1f]/75 backdrop-blur-xl border border-cyan-400/25 hover:border-[#2962ff]/70 shadow-[inset_0_1.5px_1.5px_rgba(255,255,255,0.18),0_10px_30px_rgba(0,0,0,0.5)] transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="icon-bounce w-9 h-9 rounded-full bg-[#2962ff]/20 border border-[#2962ff]/40 p-1 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform overflow-hidden">
                      <img 
                        src={getTickerLogo('RELIANCE')} 
                        alt="Reliance" 
                        referrerPolicy="no-referrer" 
                        className="w-full h-full object-contain rounded-full" 
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">Reliance Industries</div>
                      <div className="text-[10px] font-mono text-slate-300">NSE: RELIANCE • INDIA BLUECHIP</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00c087]/20 border border-[#00c087]/40 text-[#00c087] font-bold">
                    +{relianceAsset.changePercent24h.toFixed(2)}%
                  </span>
                </div>
                <div className="flex items-baseline justify-between mt-2">
                  <div className="font-mono text-2xl font-bold text-white drop-shadow-sm">
                    ₹{relianceAsset.price.toLocaleString()}
                  </div>
                  <span className="text-xs text-[#60a5fa] group-hover:translate-x-1 transition-transform flex items-center space-x-1 font-bold">
                    <span>Trade Now</span>
                    <span className="icon-bounce">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </span>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* 5. WALL STREET WIRE & MARKET NEWS (Editorial Section with Liquid Glass Cards) */}
      <section id="news" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-[#21262d]">
          <div>
            <div className="flex items-center space-x-2 text-[10px] font-mono text-[#f5d17a] uppercase tracking-widest mb-1 font-bold">
              <Globe className="w-3.5 h-3.5" />
              <span>MARKET INTELLIGENCE & DISPATCH</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-white tracking-tight drop-shadow-sm">
              The Wall Street Wire
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 mt-1 font-sans font-medium">
              Curated market catalysts, central bank developments, earnings reports, and crypto macro trends.
            </p>
          </div>

          {/* Liquid Glass Category Filter Pills */}
          <div className="flex items-center space-x-1.5 mt-4 md:mt-0 overflow-x-auto no-scrollbar py-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedNewsCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedNewsCategory === cat 
                    ? 'bg-gradient-to-b from-[#fde68a] via-[#e5b869] to-[#c59b27] text-black border border-[#fffbeb]/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_2px_8px_rgba(217,119,6,0.35)]' 
                    : 'bg-[#090f1f]/75 backdrop-blur-md text-slate-200 hover:text-white border border-cyan-400/25 hover:border-cyan-400/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* News Grid with Liquid Glass Cards */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedNewsCategory}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{ willChange: 'transform, opacity' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {filteredNews.map((item) => (
              <article 
                key={item.id}
                className="group flex flex-col bg-[#090f1f]/75 backdrop-blur-xl border border-cyan-400/25 hover:border-cyan-400/55 rounded-2xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/60 shadow-[inset_0_1.5px_1.5px_rgba(255,255,255,0.12),0_8px_28px_rgba(0,0,0,0.45)]"
              >
                {/* Image thumbnail with liquid glass badges & asset logos */}
                <div className="relative h-40 w-full overflow-hidden bg-[#070c18]">
                  <img 
                    src={item.imageUrl} 
                    alt={item.headline}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute top-2 left-2 bg-[#090f1f]/85 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-mono text-white font-bold border border-cyan-400/30 shadow-sm">
                    {item.category}
                  </div>
                  <div className="absolute top-2 right-2 bg-[#090f1f]/85 backdrop-blur-md px-2 py-0.5 rounded-md text-[9px] font-mono text-[#f5d17a] font-bold border border-[#c59b27]/40 shadow-sm">
                    {item.timeAgo}
                  </div>

                  {/* Overlaid Logos for Featured Crypto / Stocks */}
                  <div className="absolute bottom-2 left-2 flex items-center -space-x-1.5 bg-[#090f1f]/85 backdrop-blur-md px-2 py-1 rounded-full border border-cyan-400/30 shadow-md">
                    {item.tickers.slice(0, 3).map((sym) => {
                      const logoUrl = getTickerLogo(sym);
                      if (!logoUrl) return null;
                      return (
                        <img
                          key={sym}
                          src={logoUrl}
                          alt={sym}
                          title={sym}
                          referrerPolicy="no-referrer"
                          className="w-4 h-4 rounded-full object-contain bg-white/10 p-[1px] border border-white/20 shadow-sm"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Content with high-visibility typography */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-300 font-mono font-medium">
                      <span>{item.source}</span>
                      <span className={item.sentiment === 'Bullish' ? 'text-[#00c087] font-bold' : item.sentiment === 'Bearish' ? 'text-[#f85149] font-bold' : 'text-slate-300 font-bold'}>
                        ● {item.sentiment}
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-sm sm:text-base text-white leading-snug group-hover:text-[#f5d17a] transition-colors line-clamp-2 drop-shadow-sm">
                      {item.headline}
                    </h3>

                    <p className="text-xs text-slate-200 line-clamp-3 leading-relaxed font-normal">
                      {item.summary}
                    </p>
                  </div>

                  {/* Bottom Tickers with Logos & Action */}
                  <div className="pt-3 border-t border-cyan-400/20 flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                      {item.tickers.map((sym) => {
                        const logo = getTickerLogo(sym);
                        const matchedAsset = assets.find(a => 
                          a.symbol === sym || 
                          a.symbol === `${sym}USDT` || 
                          a.symbol.startsWith(sym) || 
                          a.displayName.startsWith(sym)
                        );

                        return (
                          <button 
                            key={sym}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (matchedAsset) {
                                handleAssetClick(matchedAsset);
                              } else {
                                onEnterPlatform();
                              }
                            }}
                            title={matchedAsset ? `Trade ${matchedAsset.displayName}` : `Trade ${sym}`}
                            className="inline-flex items-center space-x-1.5 text-[10px] font-mono font-bold bg-[#070d18] hover:bg-[#0d1527] text-[#f5d17a] hover:text-white pl-1.5 pr-2 py-0.5 rounded-md border border-[#c59b27]/40 hover:border-[#f5d17a] shadow-sm transition-all cursor-pointer group/ticker"
                          >
                            {logo && (
                              <img 
                                src={logo} 
                                alt={sym} 
                                referrerPolicy="no-referrer"
                                className="w-3.5 h-3.5 rounded-full object-contain bg-white/10 p-[0.5px] shrink-0 group-hover/ticker:scale-110 transition-transform"
                                onError={(e) => {
                                  (e.currentTarget as HTMLElement).style.display = 'none';
                                }}
                              />
                            )}
                            <span>${sym}</span>
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={onEnterPlatform}
                      className="group text-xs font-bold text-[#f5d17a] hover:text-white flex items-center space-x-1 cursor-pointer transition-colors shrink-0 ml-2"
                    >
                      <span>Trade</span>
                      <span className="icon-bounce group-hover:translate-x-0.5">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* 6. LIVE MARKET QUOTES TABLE (30+ Assets with Liquid Glass Styling) */}
      <section id="markets" className="py-16 bg-[#070c18]/90 border-y border-[#21262d]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-[#21262d]">
            <div>
              <div className="text-[10px] font-mono text-[#00c087] uppercase tracking-widest mb-1 font-bold">
                INSTITUTIONAL PRICE MATRIX
              </div>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-white tracking-tight drop-shadow-sm">
                Live Market Quotes
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 mt-1 font-medium">
                Direct market feeds across Top 10 Cryptocurrencies, Wall Street S&P Tech Leaders, and Dalal Street Giants.
              </p>
            </div>

            {/* Asset category tabs */}
            <div className="flex items-center space-x-1.5 mt-4 sm:mt-0 bg-[#090f1f]/80 backdrop-blur-md p-1 rounded-xl border border-cyan-400/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
              <button
                onClick={() => setActiveMarketTab('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeMarketTab === 'all' 
                    ? 'bg-gradient-to-b from-[#fde68a] via-[#e5b869] to-[#c59b27] text-black border border-[#fffbeb]/70 shadow-sm' 
                    : 'text-slate-200 hover:text-white'
                }`}
              >
                Top Movers
              </button>
              <button
                onClick={() => setActiveMarketTab('crypto')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeMarketTab === 'crypto' 
                    ? 'bg-gradient-to-b from-[#fde68a] via-[#e5b869] to-[#c59b27] text-black border border-[#fffbeb]/70 shadow-sm' 
                    : 'text-slate-200 hover:text-white'
                }`}
              >
                Crypto (10)
              </button>
              <button
                onClick={() => setActiveMarketTab('us_stock')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeMarketTab === 'us_stock' 
                    ? 'bg-gradient-to-b from-[#fde68a] via-[#e5b869] to-[#c59b27] text-black border border-[#fffbeb]/70 shadow-sm' 
                    : 'text-slate-200 hover:text-white'
                }`}
              >
                US Stocks (10)
              </button>
              <button
                onClick={() => setActiveMarketTab('indian_stock')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeMarketTab === 'indian_stock' 
                    ? 'bg-gradient-to-b from-[#fde68a] via-[#e5b869] to-[#c59b27] text-black border border-[#fffbeb]/70 shadow-sm' 
                    : 'text-slate-200 hover:text-white'
                }`}
              >
                Indian Bluechips (10)
              </button>
            </div>
          </div>

          {/* Table Container with Liquid Glass Frame */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMarketTab}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              style={{ willChange: 'transform, opacity' }}
              className="overflow-x-auto rounded-2xl border border-cyan-400/25 bg-[#090f1f]/75 backdrop-blur-xl shadow-[inset_0_1.5px_1.5px_rgba(255,255,255,0.15),0_10px_32px_rgba(0,0,0,0.5)]"
            >
              <table className="w-full text-left text-xs">
                <thead className="bg-[#070c18]/90 text-slate-200 font-mono text-[10px] uppercase border-b border-cyan-400/20">
                  <tr>
                    <th className="px-4 py-3 font-bold">Asset</th>
                    <th className="px-4 py-3 font-bold">Exchange / Sector</th>
                    <th className="px-4 py-3 text-right font-bold">Price</th>
                    <th className="px-4 py-3 text-right font-bold">24h Change</th>
                    <th className="px-4 py-3 text-right font-bold">24h High / Low</th>
                    <th className="px-4 py-3 text-right font-bold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#21262d] font-sans">
                  {displayedAssets.map((asset) => {
                    const isBull = asset.changePercent24h >= 0;
                    const prefix = asset.quoteCurrency === 'INR' ? '₹' : '$';

                    return (
                      <tr 
                        key={asset.symbol} 
                        onClick={() => handleAssetClick(asset)}
                        className="hover:bg-cyan-900/20 transition-colors cursor-pointer group"
                      >
                        <td className="px-4 py-3.5">
                          <div className="flex items-center space-x-3">
                            <div className="icon-bounce w-8 h-8 rounded-xl bg-[#070d18] border border-cyan-400/30 p-1 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform overflow-hidden">
                              {getTickerLogo(asset.symbol) ? (
                                <img 
                                  src={getTickerLogo(asset.symbol)} 
                                  alt={asset.displayName}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-contain rounded-lg"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLElement).style.display = 'none';
                                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                    if (fallback) fallback.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <span 
                                className={`font-bold text-xs text-[#f5d17a] ${getTickerLogo(asset.symbol) ? 'hidden' : 'flex'} items-center justify-center`}
                              >
                                {asset.symbol.slice(0, 2)}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-white group-hover:text-[#f5d17a] transition-colors text-sm whitespace-nowrap">
                                {asset.displayName}
                              </div>
                              <div className="text-[11px] text-slate-300 font-medium whitespace-nowrap">{asset.name}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 text-slate-200 font-mono text-[11px]">
                          <span className="px-2 py-0.5 rounded-md bg-[#070d18] border border-cyan-400/20 font-semibold">
                            {asset.category === 'crypto' ? 'BINANCE' : asset.category === 'us_stock' ? 'NASDAQ / NYSE' : 'NSE INDIA'}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-right font-mono font-bold text-white text-sm drop-shadow-sm">
                          {prefix}{asset.price.toLocaleString(undefined, { minimumFractionDigits: asset.decimals, maximumFractionDigits: asset.decimals })}
                        </td>

                        <td className="px-4 py-3.5 text-right font-mono">
                          <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold ${
                            isBull ? 'bg-[#00c087]/20 border border-[#00c087]/40 text-[#00c087]' : 'bg-[#f85149]/20 border border-[#f85149]/40 text-[#f85149]'
                          }`}>
                            {isBull ? '+' : ''}{asset.changePercent24h.toFixed(2)}%
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-right font-mono text-[11px] text-slate-200">
                          <div className="font-medium">H: {prefix}{asset.high24h.toLocaleString()}</div>
                          <div className="text-[10px] text-slate-300 font-medium">L: {prefix}{asset.low24h.toLocaleString()}</div>
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAssetClick(asset);
                            }}
                            className="group/btn px-3 py-1.5 rounded-xl bg-gradient-to-b from-[#fde68a] via-[#e5b869] to-[#c59b27] hover:brightness-105 active:scale-95 text-black font-bold text-[11px] uppercase tracking-wider transition-all shadow-sm inline-flex items-center space-x-1 cursor-pointer"
                          >
                            <span>Trade</span>
                            <span className="icon-bounce group-hover/btn:translate-x-0.5">
                              <ChevronRight className="w-3 h-3" />
                            </span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* 7. COMPLETE TRADING ARSENAL FEATURES (Liquid Glass Cards) */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="text-[10px] font-mono text-[#f5d17a] uppercase tracking-widest font-bold">
            ENGINEERED FOR PROFESSIONAL TRADERS
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight drop-shadow-sm">
            Institutional-Grade Capabilities
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 font-medium">
            Built with the analytical depth of Bloomberg terminals and the fluid interactivity of TradingView.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#090f1f]/75 backdrop-blur-xl border border-cyan-400/25 hover:border-cyan-400/50 shadow-[inset_0_1.5px_1.5px_rgba(255,255,255,0.15),0_8px_28px_rgba(0,0,0,0.45)] space-y-3 transition-all">
            <div className="icon-bounce w-11 h-11 rounded-xl bg-[#070d18] border border-cyan-400/30 text-[#f5d17a] flex items-center justify-center shadow-sm">
              <LineChart className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-lg text-white">Dual Charting Engines</h3>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
              Switch seamlessly between official TradingView interactive widgets and custom high-fps Canvas charts with technical indicators (RSI, MACD, Bollinger Bands, EMA).
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#090f1f]/75 backdrop-blur-xl border border-cyan-400/25 hover:border-cyan-400/50 shadow-[inset_0_1.5px_1.5px_rgba(255,255,255,0.15),0_8px_28px_rgba(0,0,0,0.45)] space-y-3 transition-all">
            <div className="icon-bounce w-11 h-11 rounded-xl bg-[#070d18] border border-cyan-400/30 text-[#00c087] flex items-center justify-center shadow-sm">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-lg text-white">Futures & Options Derivatives</h3>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
              Execute cross & isolated margin futures up to 100x leverage, or trade real-time options chains with Greeks (Delta, Gamma, Theta) and automated settlement.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#090f1f]/75 backdrop-blur-xl border border-cyan-400/25 hover:border-cyan-400/50 shadow-[inset_0_1.5px_1.5px_rgba(255,255,255,0.15),0_8px_28px_rgba(0,0,0,0.45)] space-y-3 transition-all">
            <div className="icon-bounce w-11 h-11 rounded-xl bg-[#070d18] border border-cyan-400/30 text-[#60a5fa] flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-lg text-white">Institutional Risk Controls</h3>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
              Position sizing calculator, stop-loss and take-profit brackets, real-time liquidation thresholds, and comprehensive trading journal analytics.
            </p>
          </div>
        </div>
      </section>

      {/* 8. CALL TO ACTION FINALE */}
      <section className="py-20 bg-gradient-to-b from-[#090f1f] via-[#070d1a] to-[#0d1117] border-t border-[#21262d] text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="icon-bounce animate-icon-float inline-block p-3.5 rounded-2xl bg-[#090f1f]/80 border border-[#c59b27]/40 text-[#f5d17a] shadow-lg shadow-[#c59b27]/15">
            <TrendingUp className="w-6 h-6" />
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight drop-shadow-sm">
            Ready to Take the Trading Floor?
          </h2>

          <p className="text-sm sm:text-base text-slate-200 max-w-xl mx-auto font-medium">
            Experience real-time market execution with $100,000 in virtual funds. No deposit required, zero capital risk.
          </p>

          <div className="pt-2">
            <button
              onClick={onEnterPlatform}
              className="px-10 py-4 rounded-2xl font-sans font-bold text-sm tracking-wider uppercase text-black bg-gradient-to-b from-[#fde68a] via-[#e5b869] to-[#c59b27] border border-[#fffbeb]/90 shadow-[inset_0_2px_1.5px_rgba(255,255,255,0.95),0_12px_32px_rgba(229,184,105,0.45)] hover:brightness-105 active:scale-95 transition-all cursor-pointer"
            >
              Start Trading Now — Free $100,000
            </button>
          </div>

          <p className="text-[11px] font-mono text-slate-300 pt-4 font-medium">
            Simulated paper trading platform for educational and strategy testing purposes.
          </p>
        </div>
      </section>

      {/* 9. WALL STREET FOOTER */}
      <footer className="border-t border-[#21262d] bg-[#070c18] py-8 text-xs text-slate-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-serif font-bold text-white text-sm">TRADEVIEW PRO</span>
            <span className="text-slate-400">| Wall Street Paper Trading Terminal</span>
          </div>

          <div className="text-[11px] font-mono text-slate-400">
            Real-time feeds powered by Binance WebSockets & Global Market Feeds
          </div>

          <button
            onClick={onEnterPlatform}
            className="text-xs font-bold text-[#f5d17a] hover:text-white transition-colors cursor-pointer"
          >
            Launch Terminal →
          </button>
        </div>
      </footer>

    </div>
  );
};
