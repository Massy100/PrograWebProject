"use client";
import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic"; // ⬅️ AÑADE ESTA IMPORT
import "../styles/StockGraphCarousel.css";

const StockTrendCard = dynamic(() => import("./StockTrendCard") as any, {
  ssr: false,
  loading: () => <div>Loading trend card...</div>,
});

interface StockItem {
  id?: number;
  symbol: string;
  name: string;
  currentPrice: number;
  changePct: number;
  last30d: number[];
  targetPrice: number;
  recommendation: string;
}

const StockGraphCarousel: React.FC = () => {
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const fetchStocks = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stocks/active/`);
      if (!res.ok) throw new Error("Failed to fetch active stocks");

      const data = await res.json();

      const parsed: StockItem[] = data.map((s: any) => ({
        id: s.id,
        symbol: s.symbol,
        name: s.name,
        currentPrice: s.last_price ?? 0,
        changePct: s.variation ?? 0,
        last30d: [],
        targetPrice: s.last_price ?? 0,
        recommendation:
          s.variation > 5
            ? "STRONG BUY"
            : s.variation > 2
            ? "BUY"
            : s.variation < -5
            ? "STRONG SELL"
            : s.variation < -2
            ? "SELL"
            : "HOLD",
      }));

      setStocks(parsed);
    } catch (error) {
      console.error("Error fetching stocks:", error);
      setStocks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
    const interval = setInterval(fetchStocks, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let position = 0;
    let animationFrame: number;

    const move = () => {
      position -= 0.5;
      if (Math.abs(position) >= track.scrollWidth / 2) {
        position = 0;
      }
      track.style.transform = `translateX(${position}px)`;
      animationFrame = requestAnimationFrame(move);
    };

    animationFrame = requestAnimationFrame(move);
    return () => cancelAnimationFrame(animationFrame);
  }, [stocks.length]);

  // 🟡 Estado de carga
  if (loading) {
    return (
      <div className="loop-carousel-container">
        <h2 className="loop-carousel-title">Live Market Trends</h2>
        <div className="loading-spinner">Loading market trends...</div>
      </div>
    );
  }

  if (stocks.length === 0) {
    return (
      <div className="loop-carousel-container">
        <h2 className="loop-carousel-title">Live Market Trends</h2>
        <p>No stock data available.</p>
      </div>
    );
  }

  const loopedStocks = [...stocks, ...stocks].map((stock) => ({
    name: stock.name,
    symbol: stock.symbol,
    currentPrice: stock.currentPrice,
    changePercent: stock.changePct,
    history:
      stock.last30d.length > 0
        ? stock.last30d
        : [
            stock.currentPrice * 0.9,
            stock.currentPrice * 0.95,
            stock.currentPrice,
          ],
    status: stock.changePct >= 0 ? "up" : "down" as "up" | "down",
  }));

  return (
    <div className="loop-carousel-container">
      <h2 className="loop-carousel-title">Live Market Trends</h2>

      <div className="loop-carousel-wrapper">
        <div className="loop-carousel-track" ref={trackRef}>
          {loopedStocks.map((stock, i) => (
            <div className="loop-carousel-slide" key={i}>
              <StockTrendCard stocks={[stock]} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StockGraphCarousel;
