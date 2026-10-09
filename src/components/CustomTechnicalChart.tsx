import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  MarketAsset, 
  CandlestickData, 
  DrawingToolType, 
  ChartDrawing, 
  ChartIndicatorConfig 
} from '../types';
import { generateInitialCandles } from '../data/assets';
import { 
  MousePointer, 
  TrendingUp, 
  Minus, 
  Maximize2, 
  Square, 
  PenTool, 
  Ruler, 
  Trash2, 
  Sliders, 
  Eye, 
  EyeOff 
} from 'lucide-react';

interface CustomTechnicalChartProps {
  asset: MarketAsset;
  onQuickBuy?: () => void;
  onQuickSell?: () => void;
}

export const CustomTechnicalChart: React.FC<CustomTechnicalChartProps> = ({ 
  asset, 
  onQuickBuy, 
  onQuickSell 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Candles data
  const [candles, setCandles] = useState<CandlestickData[]>(() => generateInitialCandles(asset.price, 80));
  const [timeframe, setTimeframe] = useState<string>('15m');
  const [activeTool, setActiveTool] = useState<DrawingToolType>('cursor');
  const [drawings, setDrawings] = useState<ChartDrawing[]>([]);
  const [currentDrawing, setCurrentDrawing] = useState<ChartDrawing | null>(null);

  // Hovered candle for OHLC
  const [hoveredCandle, setHoveredCandle] = useState<CandlestickData | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Indicator configs
  const [indicators, setIndicators] = useState<ChartIndicatorConfig>({
    ema20: true,
    ema50: true,
    ema200: false,
    bollingerBands: true,
    rsi14: true,
    macd: false,
    volume: true,
  });
  const [showIndicatorMenu, setShowIndicatorMenu] = useState<boolean>(false);

  // Regenerate candles when asset changes completely
  useEffect(() => {
    setCandles(generateInitialCandles(asset.price, 80));
    setDrawings([]);
    setCurrentDrawing(null);
  }, [asset.symbol]);

  // Update current live candle with incoming asset price ticks
  useEffect(() => {
    setCandles(prev => {
      if (prev.length === 0) return prev;
      const copy = [...prev];
      const lastIndex = copy.length - 1;
      const last = { ...copy[lastIndex] };

      last.close = asset.price;
      last.high = Math.max(last.high, asset.price);
      last.low = Math.min(last.low, asset.price);
      last.volume += Math.floor(Math.random() * 5);
      copy[lastIndex] = last;
      return copy;
    });
  }, [asset.price]);

  // Exponential Moving Average calculation
  const calculateEMA = useCallback((period: number): (number | null)[] => {
    const k = 2 / (period + 1);
    const emaValues: (number | null)[] = [];
    let prevEMA: number | null = null;

    candles.forEach((c, idx) => {
      if (idx < period - 1) {
        emaValues.push(null);
      } else if (idx === period - 1) {
        const sum = candles.slice(0, period).reduce((acc, curr) => acc + curr.close, 0);
        prevEMA = sum / period;
        emaValues.push(prevEMA);
      } else if (prevEMA !== null) {
        prevEMA = c.close * k + prevEMA * (1 - k);
        emaValues.push(prevEMA);
      } else {
        emaValues.push(null);
      }
    });

    return emaValues;
  }, [candles]);

  // Bollinger Bands
  const calculateBollingerBands = useCallback((period = 20, multiplier = 2) => {
    const upper: (number | null)[] = [];
    const lower: (number | null)[] = [];
    const middle: (number | null)[] = [];

    candles.forEach((_, idx) => {
      if (idx < period - 1) {
        upper.push(null);
        lower.push(null);
        middle.push(null);
      } else {
        const slice = candles.slice(idx - period + 1, idx + 1);
        const mean = slice.reduce((sum, c) => sum + c.close, 0) / period;
        const variance = slice.reduce((sum, c) => sum + Math.pow(c.close - mean, 2), 0) / period;
        const stdDev = Math.sqrt(variance);

        middle.push(mean);
        upper.push(mean + multiplier * stdDev);
        lower.push(mean - multiplier * stdDev);
      }
    });

    return { upper, lower, middle };
  }, [candles]);

  // RSI calculation
  const calculateRSI = useCallback((period = 14): (number | null)[] => {
    const rsiValues: (number | null)[] = [];
    let gains = 0;
    let losses = 0;

    for (let i = 0; i < candles.length; i++) {
      if (i === 0) {
        rsiValues.push(null);
        continue;
      }
      const change = candles[i].close - candles[i - 1].close;
      const gain = change > 0 ? change : 0;
      const loss = change < 0 ? Math.abs(change) : 0;

      if (i < period) {
        gains += gain;
        losses += loss;
        rsiValues.push(null);
      } else if (i === period) {
        gains += gain;
        losses += loss;
        let avgGain = gains / period;
        let avgLoss = losses / period;
        let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        rsiValues.push(100 - (100 / (1 + rs)));
      } else {
        const prevRSI = rsiValues[i - 1];
        if (prevRSI !== null) {
          let avgGain = ((gains * (period - 1)) + gain) / period;
          let avgLoss = ((losses * (period - 1)) + loss) / period;
          gains = avgGain;
          losses = avgLoss;
          let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
          rsiValues.push(100 - (100 / (1 + rs)));
        } else {
          rsiValues.push(50);
        }
      }
    }
    return rsiValues;
  }, [candles]);

  const ema20Data = useMemo(() => indicators.ema20 ? calculateEMA(20) : [], [indicators.ema20, calculateEMA]);
  const ema50Data = useMemo(() => indicators.ema50 ? calculateEMA(50) : [], [indicators.ema50, calculateEMA]);
  const ema200Data = useMemo(() => indicators.ema200 ? calculateEMA(200) : [], [indicators.ema200, calculateEMA]);
  const bbData = useMemo(() => indicators.bollingerBands ? calculateBollingerBands(20, 2) : { upper: [], lower: [], middle: [] }, [indicators.bollingerBands, calculateBollingerBands]);
  const rsiData = useMemo(() => indicators.rsi14 ? calculateRSI(14) : [], [indicators.rsi14, calculateRSI]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Background
    ctx.fillStyle = '#131722';
    ctx.fillRect(0, 0, width, height);

    if (candles.length === 0) return;

    // Layout partitioning: Main chart 70%, RSI sub-chart 20%, Volume 10%
    const hasSubchart = indicators.rsi14;
    const mainHeight = hasSubchart ? height * 0.70 : height * 0.88;
    const subchartTop = mainHeight + 10;
    const subchartHeight = height - subchartTop - 20;

    const paddingRight = 65;
    const chartWidth = width - paddingRight;

    // Price scaling
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    candles.forEach(c => {
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
    });

    // Add padding to price range
    const priceRange = maxPrice - minPrice || 1;
    minPrice -= priceRange * 0.05;
    maxPrice += priceRange * 0.05;
    const adjustedRange = maxPrice - minPrice;

    const candleWidth = Math.max(3, (chartWidth / candles.length) * 0.7);
    const candleSpacing = chartWidth / candles.length;

    // Helper coordinate conversion
    const getX = (index: number) => index * candleSpacing + candleSpacing / 2;
    const getY = (price: number) => mainHeight - ((price - minPrice) / adjustedRange) * mainHeight;

    // 1. Draw Grid lines
    ctx.strokeStyle = '#1e222d';
    ctx.lineWidth = 1;

    // Horizontal grid
    const gridSteps = 6;
    for (let i = 0; i <= gridSteps; i++) {
      const p = minPrice + (adjustedRange / gridSteps) * i;
      const y = getY(p);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartWidth, y);
      ctx.stroke();

      // Price label in right axis
      ctx.fillStyle = '#787b86';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(p.toFixed(asset.decimals), chartWidth + 6, y + 4);
    }

    // 2. Draw Volume histogram
    if (indicators.volume) {
      let maxVol = 1;
      candles.forEach(c => { if (c.volume > maxVol) maxVol = c.volume; });
      const volHeight = mainHeight * 0.18;

      candles.forEach((c, idx) => {
        const x = getX(idx);
        const barH = (c.volume / maxVol) * volHeight;
        const isUp = c.close >= c.open;
        ctx.fillStyle = isUp ? 'rgba(8, 153, 129, 0.25)' : 'rgba(242, 54, 69, 0.25)';
        ctx.fillRect(x - candleWidth / 2, mainHeight - barH, candleWidth, barH);
      });
    }

    // 3. Draw Bollinger Bands
    if (indicators.bollingerBands && bbData.upper.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(41, 98, 255, 0.35)';
      ctx.lineWidth = 1;
      bbData.upper.forEach((p, idx) => {
        if (p === null) return;
        const x = getX(idx);
        const y = getY(p);
        if (idx === 20) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();

      ctx.beginPath();
      ctx.strokeStyle = 'rgba(41, 98, 255, 0.35)';
      bbData.lower.forEach((p, idx) => {
        if (p === null) return;
        const x = getX(idx);
        const y = getY(p);
        if (idx === 20) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    // 4. Draw EMAs
    const drawLineIndicator = (data: (number | null)[], color: string, width = 1.5) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      let started = false;
      data.forEach((val, idx) => {
        if (val === null) return;
        const x = getX(idx);
        const y = getY(val);
        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    };

    if (indicators.ema20) drawLineIndicator(ema20Data, '#f59e0b'); // Amber
    if (indicators.ema50) drawLineIndicator(ema50Data, '#3b82f6'); // Blue
    if (indicators.ema200) drawLineIndicator(ema200Data, '#a855f7'); // Purple

    // 5. Draw Candlesticks
    candles.forEach((c, idx) => {
      const x = getX(idx);
      const isUp = c.close >= c.open;
      const color = isUp ? '#089981' : '#f23645';

      const highY = getY(c.high);
      const lowY = getY(c.low);
      const openY = getY(c.open);
      const closeY = getY(c.close);

      // Wick
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // Body
      const top = Math.min(openY, closeY);
      const bottom = Math.max(openY, closeY);
      const bodyH = Math.max(1.5, bottom - top);

      ctx.fillStyle = color;
      ctx.fillRect(x - candleWidth / 2, top, candleWidth, bodyH);
    });

    // 6. Active Live Price Line
    const currentY = getY(asset.price);
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#2962ff';
    ctx.lineWidth = 1;
    ctx.moveTo(0, currentY);
    ctx.lineTo(chartWidth, currentY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Right axis price badge
    ctx.fillStyle = '#2962ff';
    ctx.fillRect(chartWidth, currentY - 10, paddingRight, 20);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px "JetBrains Mono", monospace';
    ctx.fillText(asset.price.toFixed(asset.decimals), chartWidth + 6, currentY + 4);

    // 7. Sub-chart (RSI 14)
    if (hasSubchart && rsiData.length > 0) {
      // Divider
      ctx.strokeStyle = '#2a2e39';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, subchartTop);
      ctx.lineTo(width, subchartTop);
      ctx.stroke();

      // RSI Bands: 70 and 30
      const getRSIY = (val: number) => subchartTop + subchartHeight - (val / 100) * subchartHeight;

      ctx.strokeStyle = 'rgba(120, 123, 134, 0.4)';
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(0, getRSIY(70));
      ctx.lineTo(chartWidth, getRSIY(70));
      ctx.moveTo(0, getRSIY(30));
      ctx.lineTo(chartWidth, getRSIY(30));
      ctx.stroke();
      ctx.setLineDash([]);

      // Fill RSI range
      ctx.fillStyle = 'rgba(120, 123, 134, 0.05)';
      ctx.fillRect(0, getRSIY(70), chartWidth, getRSIY(30) - getRSIY(70));

      // Right axis labels for RSI
      ctx.fillStyle = '#787b86';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText('70', chartWidth + 6, getRSIY(70) + 3);
      ctx.fillText('30', chartWidth + 6, getRSIY(30) + 3);

      // Draw RSI line
      ctx.beginPath();
      ctx.strokeStyle = '#e040fb'; // Purple neon
      ctx.lineWidth = 1.5;
      let rsiStarted = false;
      rsiData.forEach((val, idx) => {
        if (val === null) return;
        const x = getX(idx);
        const y = getRSIY(val);
        if (!rsiStarted) {
          ctx.moveTo(x, y);
          rsiStarted = true;
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();

      // Current RSI label
      const lastRSI = rsiData[rsiData.length - 1];
      if (lastRSI !== null) {
        ctx.fillStyle = '#e040fb';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(`RSI(14): ${lastRSI.toFixed(1)}`, 10, subchartTop + 16);
      }
    }

    // 8. Draw Persistent User Drawings
    const allDrawings = [...drawings];
    if (currentDrawing) allDrawings.push(currentDrawing);

    allDrawings.forEach(d => {
      ctx.strokeStyle = d.color;
      ctx.lineWidth = d.lineWidth;
      ctx.fillStyle = d.color;

      if (d.type === 'trendline' && d.points.length >= 2) {
        ctx.beginPath();
        ctx.moveTo(d.points[0].x, d.points[0].y);
        ctx.lineTo(d.points[1].x, d.points[1].y);
        ctx.stroke();
      } else if (d.type === 'horizontal' && d.points.length >= 1) {
        ctx.beginPath();
        ctx.setLineDash([4, 2]);
        ctx.moveTo(0, d.points[0].y);
        ctx.lineTo(chartWidth, d.points[0].y);
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (d.type === 'fibonacci' && d.points.length >= 2) {
        const p1 = d.points[0];
        const p2 = d.points[1];
        const dy = p2.y - p1.y;
        const levels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1.0];
        const colors = ['#787b86', '#089981', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7', '#787b86'];

        levels.forEach((lvl, lIdx) => {
          const y = p1.y + dy * lvl;
          ctx.strokeStyle = colors[lIdx];
          ctx.beginPath();
          ctx.moveTo(Math.min(p1.x, p2.x), y);
          ctx.lineTo(chartWidth, y);
          ctx.stroke();

          ctx.fillStyle = colors[lIdx];
          ctx.font = '10px "JetBrains Mono", monospace';
          ctx.fillText(`Fib ${lvl} (${(lvl * 100).toFixed(1)}%)`, Math.min(p1.x, p2.x) + 4, y - 4);
        });
      } else if (d.type === 'rectangle' && d.points.length >= 2) {
        const p1 = d.points[0];
        const p2 = d.points[1];
        ctx.strokeStyle = d.color;
        ctx.strokeRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
        ctx.fillStyle = 'rgba(41, 98, 255, 0.1)';
        ctx.fillRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
      } else if (d.type === 'brush' && d.points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(d.points[0].x, d.points[0].y);
        d.points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.stroke();
      } else if (d.type === 'measure' && d.points.length >= 2) {
        const p1 = d.points[0];
        const p2 = d.points[1];
        ctx.beginPath();
        ctx.setLineDash([2, 2]);
        ctx.strokeStyle = '#38bdf8';
        ctx.strokeRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
        ctx.fillRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);

        // Delta calculation
        const price1 = minPrice + (1 - p1.y / mainHeight) * adjustedRange;
        const price2 = minPrice + (1 - p2.y / mainHeight) * adjustedRange;
        const deltaPrice = price2 - price1;
        const deltaPct = (deltaPrice / price1) * 100;

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(`Δ: ${deltaPrice.toFixed(asset.decimals)} (${deltaPct.toFixed(2)}%)`, Math.min(p1.x, p2.x) + 6, Math.min(p1.y, p2.y) + 16);
      }
    });

    // 9. Crosshair & Hover Coordinate lines
    if (mousePos && mousePos.x < chartWidth && mousePos.y < height) {
      ctx.beginPath();
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = 'rgba(209, 212, 220, 0.4)';
      ctx.lineWidth = 1;

      // Vertical line
      ctx.moveTo(mousePos.x, 0);
      ctx.lineTo(mousePos.x, height);

      // Horizontal line
      ctx.moveTo(0, mousePos.y);
      ctx.lineTo(chartWidth, mousePos.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Floating price tag on cursor
      if (mousePos.y <= mainHeight) {
        const cursorPrice = minPrice + (1 - mousePos.y / mainHeight) * adjustedRange;
        ctx.fillStyle = '#363a45';
        ctx.fillRect(chartWidth, mousePos.y - 10, paddingRight, 20);
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillText(cursorPrice.toFixed(asset.decimals), chartWidth + 6, mousePos.y + 4);
      }
    }

  }, [candles, indicators, ema20Data, ema50Data, ema200Data, bbData, rsiData, drawings, currentDrawing, mousePos, asset.price, asset.decimals, canvasSize]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        canvas.width = rect.width;
        canvas.height = rect.height;
        setCanvasSize({ width: rect.width, height: rect.height });
      }
    };

    handleResize();
    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  // Mouse Interactivity for Drawings & OHLC
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === 'cursor') return;

    if (activeTool === 'horizontal') {
      const newD: ChartDrawing = {
        id: `d-${Date.now()}`,
        type: 'horizontal',
        points: [{ x, y }],
        color: '#f59e0b',
        lineWidth: 1.5,
      };
      setDrawings(prev => [...prev, newD]);
      return;
    }

    setCurrentDrawing({
      id: `d-${Date.now()}`,
      type: activeTool,
      points: [{ x, y }],
      color: activeTool === 'fibonacci' ? '#3b82f6' : activeTool === 'measure' ? '#38bdf8' : '#2962ff',
      lineWidth: 2,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    // Update hovered candle
    const chartWidth = rect.width - 65;
    const candleSpacing = chartWidth / candles.length;
    const candleIndex = Math.min(candles.length - 1, Math.max(0, Math.floor(x / candleSpacing)));
    if (candles[candleIndex]) {
      setHoveredCandle(candles[candleIndex]);
    }

    if (!currentDrawing) return;

    if (currentDrawing.type === 'brush') {
      setCurrentDrawing(prev => prev ? {
        ...prev,
        points: [...prev.points, { x, y }],
      } : null);
    } else {
      setCurrentDrawing(prev => prev ? {
        ...prev,
        points: [prev.points[0], { x, y }],
      } : null);
    }
  };

  const handleMouseUp = () => {
    if (currentDrawing) {
      setDrawings(prev => [...prev, currentDrawing]);
      setCurrentDrawing(null);
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 0) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    setMousePos({ x, y });
    const chartWidth = rect.width - 65;
    const candleSpacing = chartWidth / candles.length;
    const candleIndex = Math.min(candles.length - 1, Math.max(0, Math.floor(x / candleSpacing)));
    if (candles[candleIndex]) {
      setHoveredCandle(candles[candleIndex]);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 0) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    setMousePos({ x, y });
    const chartWidth = rect.width - 65;
    const candleSpacing = chartWidth / candles.length;
    const candleIndex = Math.min(candles.length - 1, Math.max(0, Math.floor(x / candleSpacing)));
    if (candles[candleIndex]) {
      setHoveredCandle(candles[candleIndex]);
    }
  };

  const handleTouchEnd = () => {
    setMousePos(null);
  };

  const clearAllDrawings = () => {
    setDrawings([]);
    setCurrentDrawing(null);
  };

  const currentCandleDisplay = hoveredCandle || (candles.length > 0 ? candles[candles.length - 1] : null);

  return (
    <div className="relative w-full h-full min-h-0 bg-[#131722] flex flex-col select-none overflow-hidden" ref={containerRef}>
      {/* Top Chart Toolbar */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#2a2e39] px-3 py-1.5 bg-[#171b26] text-xs text-[#90939e] gap-2 z-10">
        {/* Left: Ticker & Timeframe */}
        <div className="flex items-center space-x-2">
          <span className="font-bold text-white text-sm tracking-tight">{asset.displayName}</span>
          <span className="text-[#787b86] text-[11px] uppercase bg-[#2a2e39] px-1.5 py-0.5 rounded">
            {asset.category.replace('_', ' ')}
          </span>

          <div className="h-4 w-[1px] bg-[#2a2e39] mx-1" />

          {/* Timeframe buttons */}
          <div className="flex items-center space-x-1 bg-[#1e222d] p-0.5 rounded">
            {['1m', '5m', '15m', '1h', '4h', '1D'].map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  timeframe === tf ? 'bg-[#2962ff] text-white shadow-sm' : 'text-[#787b86] hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <div className="h-4 w-[1px] bg-[#2a2e39] mx-1" />

          {/* Indicators dropdown toggle */}
          <div className="relative">
            <button
              onClick={() => setShowIndicatorMenu(prev => !prev)}
              className="flex items-center space-x-1.5 px-2 py-1 rounded bg-[#1e222d] hover:bg-[#2a2e39] text-[#d1d4dc] transition-colors"
              title="Technical Indicators"
            >
              <Sliders className="w-3.5 h-3.5 text-[#2962ff]" />
              <span>Indicators</span>
            </button>

            {showIndicatorMenu && (
              <div className="absolute top-full left-0 mt-1 w-52 bg-[#1e222d] border border-[#2a2e39] rounded-lg shadow-2xl p-2 z-50 text-xs text-[#d1d4dc] space-y-1">
                <div className="text-[11px] font-semibold text-[#787b86] px-1.5 py-0.5">OVERLAYS</div>
                <label className="flex items-center justify-between px-2 py-1 hover:bg-[#2a2e39] rounded cursor-pointer">
                  <span>EMA 20 (Trend)</span>
                  <input
                    type="checkbox"
                    checked={indicators.ema20}
                    onChange={e => setIndicators(prev => ({ ...prev, ema20: e.target.checked }))}
                    className="accent-[#2962ff]"
                  />
                </label>
                <label className="flex items-center justify-between px-2 py-1 hover:bg-[#2a2e39] rounded cursor-pointer">
                  <span>EMA 50 (Intermediate)</span>
                  <input
                    type="checkbox"
                    checked={indicators.ema50}
                    onChange={e => setIndicators(prev => ({ ...prev, ema50: e.target.checked }))}
                    className="accent-[#2962ff]"
                  />
                </label>
                <label className="flex items-center justify-between px-2 py-1 hover:bg-[#2a2e39] rounded cursor-pointer">
                  <span>EMA 200 (Long Term)</span>
                  <input
                    type="checkbox"
                    checked={indicators.ema200}
                    onChange={e => setIndicators(prev => ({ ...prev, ema200: e.target.checked }))}
                    className="accent-[#2962ff]"
                  />
                </label>
                <label className="flex items-center justify-between px-2 py-1 hover:bg-[#2a2e39] rounded cursor-pointer">
                  <span>Bollinger Bands (20, 2)</span>
                  <input
                    type="checkbox"
                    checked={indicators.bollingerBands}
                    onChange={e => setIndicators(prev => ({ ...prev, bollingerBands: e.target.checked }))}
                    className="accent-[#2962ff]"
                  />
                </label>

                <div className="text-[11px] font-semibold text-[#787b86] px-1.5 py-0.5 pt-2 border-t border-[#2a2e39]">OSCILLATORS</div>
                <label className="flex items-center justify-between px-2 py-1 hover:bg-[#2a2e39] rounded cursor-pointer">
                  <span>RSI (14)</span>
                  <input
                    type="checkbox"
                    checked={indicators.rsi14}
                    onChange={e => setIndicators(prev => ({ ...prev, rsi14: e.target.checked }))}
                    className="accent-[#2962ff]"
                  />
                </label>
                <label className="flex items-center justify-between px-2 py-1 hover:bg-[#2a2e39] rounded cursor-pointer">
                  <span>Volume Bars</span>
                  <input
                    type="checkbox"
                    checked={indicators.volume}
                    onChange={e => setIndicators(prev => ({ ...prev, volume: e.target.checked }))}
                    className="accent-[#2962ff]"
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick Buy / Sell Bar directly on chart */}
        <div className="flex items-center space-x-2">
          {onQuickSell && (
            <button
              onClick={onQuickSell}
              className="px-2.5 py-1 rounded bg-[#f23645]/20 hover:bg-[#f23645] text-[#f23645] hover:text-white font-semibold transition-all flex items-center space-x-1"
            >
              <span>SELL</span>
              <span className="font-mono text-[11px]">{asset.price.toFixed(asset.decimals)}</span>
            </button>
          )}
          {onQuickBuy && (
            <button
              onClick={onQuickBuy}
              className="px-2.5 py-1 rounded bg-[#089981]/20 hover:bg-[#089981] text-[#089981] hover:text-white font-semibold transition-all flex items-center space-x-1"
            >
              <span>BUY</span>
              <span className="font-mono text-[11px]">{asset.price.toFixed(asset.decimals)}</span>
            </button>
          )}
        </div>
      </div>

      {/* OHLC Bar */}
      <div className="flex flex-wrap items-center space-x-3 px-3 py-1 bg-[#131722] text-[11px] font-mono text-[#787b86] border-b border-[#1e222d] z-10">
        {currentCandleDisplay && (
          <>
            <span>O: <span className="text-white">{currentCandleDisplay.open.toFixed(asset.decimals)}</span></span>
            <span>H: <span className="text-white">{currentCandleDisplay.high.toFixed(asset.decimals)}</span></span>
            <span>L: <span className="text-white">{currentCandleDisplay.low.toFixed(asset.decimals)}</span></span>
            <span>C: <span className={currentCandleDisplay.close >= currentCandleDisplay.open ? 'text-[#089981]' : 'text-[#f23645]'}>
              {currentCandleDisplay.close.toFixed(asset.decimals)}
            </span></span>
            <span>Vol: <span className="text-white">{currentCandleDisplay.volume.toLocaleString()}</span></span>
          </>
        )}
      </div>

      {/* Main Chart Area with Left Drawing Toolbar */}
      <div className="relative flex-1 w-full h-full flex">
        {/* Left Drawing Toolbar */}
        <div className="w-10 bg-[#171b26] border-r border-[#2a2e39] flex flex-col items-center py-2 space-y-1.5 z-20">
          <button
            onClick={() => setActiveTool('cursor')}
            className={`p-1.5 rounded transition-colors ${activeTool === 'cursor' ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:text-white'}`}
            title="Crosshair Cursor"
          >
            <MousePointer className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTool('trendline')}
            className={`p-1.5 rounded transition-colors ${activeTool === 'trendline' ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:text-white'}`}
            title="Trendline"
          >
            <TrendingUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTool('horizontal')}
            className={`p-1.5 rounded transition-colors ${activeTool === 'horizontal' ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:text-white'}`}
            title="Horizontal Ray / Support & Resistance"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTool('fibonacci')}
            className={`p-1.5 rounded transition-colors ${activeTool === 'fibonacci' ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:text-white'}`}
            title="Fibonacci Retracement"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTool('rectangle')}
            className={`p-1.5 rounded transition-colors ${activeTool === 'rectangle' ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:text-white'}`}
            title="Rectangle Zone"
          >
            <Square className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTool('brush')}
            className={`p-1.5 rounded transition-colors ${activeTool === 'brush' ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:text-white'}`}
            title="Freeform Brush"
          >
            <PenTool className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTool('measure')}
            className={`p-1.5 rounded transition-colors ${activeTool === 'measure' ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:text-white'}`}
            title="Price / Time Measurement Ruler"
          >
            <Ruler className="w-4 h-4" />
          </button>

          <div className="w-6 h-[1px] bg-[#2a2e39] my-1" />

          <button
            onClick={clearAllDrawings}
            className="p-1.5 rounded text-[#787b86] hover:text-[#f23645] transition-colors"
            title="Clear All Drawings"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => setMousePos(null)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="flex-1 w-full h-full cursor-crosshair touch-none"
        />
      </div>
    </div>
  );
};
