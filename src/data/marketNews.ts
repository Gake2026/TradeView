export interface MarketNewsItem {
  id: string;
  headline: string;
  summary: string;
  category: 'Breaking' | 'Crypto' | 'US Stocks' | 'Indian Markets' | 'Macro & Fed';
  source: string;
  sourceIcon?: string;
  timeAgo: string;
  impact: 'High' | 'Medium' | 'Low';
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  tickers: string[];
  imageUrl: string;
  readTime: string;
}

export const TICKER_LOGOS: Record<string, string> = {
  // Crypto
  BTC: 'https://s3-symbol-logo.tradingview.com/crypto/XTVCBTC--big.svg',
  ETH: 'https://s3-symbol-logo.tradingview.com/crypto/XTVCETH--big.svg',
  SOL: 'https://s3-symbol-logo.tradingview.com/crypto/XTVCSOL--big.svg',
  BNB: 'https://s3-symbol-logo.tradingview.com/crypto/XTVCBNB--big.svg',
  XRP: 'https://s3-symbol-logo.tradingview.com/crypto/XTVCXRP--big.svg',
  DOGE: 'https://s3-symbol-logo.tradingview.com/crypto/XTVCDOGE--big.svg',
  ADA: 'https://s3-symbol-logo.tradingview.com/crypto/XTVCADA--big.svg',
  AVAX: 'https://s3-symbol-logo.tradingview.com/crypto/XTVCAVAX--big.svg',
  DOT: 'https://s3-symbol-logo.tradingview.com/crypto/XTVCDOT--big.svg',
  LINK: 'https://s3-symbol-logo.tradingview.com/crypto/XTVCLINK--big.svg',
  MATIC: 'https://s3-symbol-logo.tradingview.com/crypto/XTVCMATIC--big.svg',
  
  // US Stocks
  AAPL: 'https://s3-symbol-logo.tradingview.com/apple--big.svg',
  MSFT: 'https://s3-symbol-logo.tradingview.com/microsoft--big.svg',
  NVDA: 'https://s3-symbol-logo.tradingview.com/nvidia--big.svg',
  GOOGL: 'https://s3-symbol-logo.tradingview.com/alphabet--big.svg',
  AMZN: 'https://s3-symbol-logo.tradingview.com/amazon--big.svg',
  TSLA: 'https://s3-symbol-logo.tradingview.com/tesla--big.svg',
  META: 'https://s3-symbol-logo.tradingview.com/meta-platforms--big.svg',
  AMD: 'https://s3-symbol-logo.tradingview.com/advanced-micro-devices--big.svg',
  NFLX: 'https://s3-symbol-logo.tradingview.com/netflix--big.svg',
  COIN: 'https://s3-symbol-logo.tradingview.com/coinbase--big.svg',
  
  // Indian Bluechips
  RELIANCE: 'https://s3-symbol-logo.tradingview.com/reliance--big.svg',
  TCS: 'https://s3-symbol-logo.tradingview.com/tata--big.svg',
  HDFCBANK: 'https://s3-symbol-logo.tradingview.com/hdfc-bank--big.svg',
  ICICIBANK: 'https://s3-symbol-logo.tradingview.com/icici-bank--big.svg',
  INFY: 'https://s3-symbol-logo.tradingview.com/infosys--big.svg',
  TATAMOTORS: 'https://s3-symbol-logo.tradingview.com/tata-motors--big.svg',
  TATASTEEL: 'https://s3-symbol-logo.tradingview.com/tata-steel--big.svg',
  BHARTIARTL: 'https://s3-symbol-logo.tradingview.com/airtel--big.svg',
  ITC: 'https://s3-symbol-logo.tradingview.com/itc--big.svg',
  SBIN: 'https://s3-symbol-logo.tradingview.com/state-bank--big.svg',
  HINDUNILVR: 'https://s3-symbol-logo.tradingview.com/unilever--big.svg',
  LT: 'https://s3-symbol-logo.tradingview.com/larsen-and-toubro--big.svg',
};

export const getTickerLogo = (symbol: string): string | undefined => {
  if (!symbol) return undefined;
  const clean = symbol.replace('$', '').toUpperCase();
  if (TICKER_LOGOS[clean]) return TICKER_LOGOS[clean];
  const withoutUsdt = clean.replace(/USDT$/, '');
  if (TICKER_LOGOS[withoutUsdt]) return TICKER_LOGOS[withoutUsdt];
  return undefined;
};

export const MARKET_NEWS: MarketNewsItem[] = [
  {
    id: 'news-1',
    headline: 'Federal Reserve Holds Rates Steady: S&P 500 and Nasdaq Surge to New Session Highs',
    summary: 'Chair Powell noted disinflationary momentum remains intact while labor markets stay resilient, propelling tech megacaps and financial equities into fresh weekly resistance tests.',
    category: 'Macro & Fed',
    source: 'Wall Street Journal',
    timeAgo: '12m ago',
    impact: 'High',
    sentiment: 'Bullish',
    tickers: ['AAPL', 'MSFT', 'NVDA'],
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
    readTime: '3 min read'
  },
  {
    id: 'news-2',
    headline: 'Bitcoin Breaches $78,000 as Institutional ETF Inflows Top $1.4B in Single Trading Session',
    summary: 'Sustained spot ETF volume across BlackRock and Fidelity spurs derivative open interest to all-time highs as futures liquidations hit short sellers.',
    category: 'Crypto',
    source: 'Bloomberg Terminal',
    timeAgo: '24m ago',
    impact: 'High',
    sentiment: 'Bullish',
    tickers: ['BTC', 'ETH', 'SOL'],
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    readTime: '4 min read'
  },
  {
    id: 'news-3',
    headline: 'Nvidia Unveils Next-Gen AI Silicon Architecture, Forward Guidance Outpaces Wall Street Projections',
    summary: 'Data center revenue surged 84% year-over-year as hyperscaler demand remains constrained only by supply-chain capacity. Analysts upgrade price target consensus.',
    category: 'US Stocks',
    source: 'Financial Times',
    timeAgo: '42m ago',
    impact: 'High',
    sentiment: 'Bullish',
    tickers: ['NVDA', 'AMD', 'GOOGL'],
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
    readTime: '5 min read'
  },
  {
    id: 'news-4',
    headline: 'Dalal Street Rally: Nifty 50 Crosses 25,400 Driven by Banking and Heavyweight Reliance Industries',
    summary: 'Foreign institutional investors turned net buyers for the fourth consecutive session, lifting banking index bellwethers and infrastructure conglomerates.',
    category: 'Indian Markets',
    source: 'Reuters Markets',
    timeAgo: '1h ago',
    impact: 'High',
    sentiment: 'Bullish',
    tickers: ['RELIANCE', 'HDFCBANK', 'ICICIBANK'],
    imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80',
    readTime: '3 min read'
  },
  {
    id: 'news-5',
    headline: 'Ethereum Layer-2 Throughput Reaches Milestone as Total Value Locked Surpasses $45 Billion',
    summary: 'Network transaction costs decline by 90% following Proto-Danksharding upgrades, accelerating decentralized finance volume and enterprise treasury adoption.',
    category: 'Crypto',
    source: 'CoinDesk Pro',
    timeAgo: '2h ago',
    impact: 'Medium',
    sentiment: 'Bullish',
    tickers: ['ETH', 'AVAX', 'MATIC'],
    imageUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?auto=format&fit=crop&w=800&q=80',
    readTime: '4 min read'
  },
  {
    id: 'news-6',
    headline: 'Treasury Yields Pull Back to 3.98% as Soft-Landing Narrative Consolidates Across Global Desks',
    summary: 'Bond traders reduce expectations of stagflation as consumer spending prints in line with economists forecasts, providing tailwinds for equity valuations.',
    category: 'Macro & Fed',
    source: 'CNBC Pro',
    timeAgo: '3h ago',
    impact: 'Medium',
    sentiment: 'Neutral',
    tickers: ['AAPL', 'TSLA', 'AMZN'],
    imageUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80',
    readTime: '2 min read'
  },
  {
    id: 'news-7',
    headline: 'Tata Motors Accelerates EV Ecosystem Expansion with New Gigafactory Battery Supply Agreements',
    summary: 'Commercial vehicle exports post double-digit quarterly gains alongside robust domestic bookings, boosting broader auto sector sentiment across Mumbai indices.',
    category: 'Indian Markets',
    source: 'The Economic Times',
    timeAgo: '4h ago',
    impact: 'Medium',
    sentiment: 'Bullish',
    tickers: ['TATAMOTORS', 'TATASTEEL'],
    imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
    readTime: '3 min read'
  },
  {
    id: 'news-8',
    headline: 'Tesla Deploys FSD V13 Fleet Update Ahead of Autonomous Robotaxi Commercial Fleet Rollout',
    summary: 'Hardware 4 computational clusters demonstrate 3x intervention reductions in dense metropolitan trials, sparking speculative option call sweeps.',
    category: 'US Stocks',
    source: 'Barron’s',
    timeAgo: '5h ago',
    impact: 'Medium',
    sentiment: 'Bullish',
    tickers: ['TSLA', 'NVDA'],
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
    readTime: '4 min read'
  }
];

export const WALL_STREET_STATS = [
  { label: 'Virtual Capital', value: '$100,000', sub: 'Reset anytime with 1 click', highlight: true },
  { label: 'Market Coverage', value: '30+ Assets', sub: 'Top 10 Crypto, US & Indian Stocks' },
  { label: 'Max Leverage', value: '100x', sub: 'Cross & Isolated Margin Modes' },
  { label: 'Data Latency', value: '< 15ms', sub: 'Direct Binance WebSockets & Live Feeds' },
];
