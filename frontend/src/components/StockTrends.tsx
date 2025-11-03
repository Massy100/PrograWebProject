"use client";
import React, { useEffect, useState } from "react";
import "../styles/StockTrends.css";

interface StockTransaction {
  symbol: string;
  name: string;
  currentPrice: number;
  is_active: boolean;
  changePct: number;
}

interface StockTrendsProps {
  loading?: boolean;
}

const StockTrends: React.FC<StockTrendsProps> = ({ loading = false }) => {
  const [offset, setOffset] = useState(0);
  const [stocks, setStocks] = useState<StockTransaction[]>([]);
  const [fetching, setFetching] = useState(true);

  const fetchStocks = async () => {
    try {
      setFetching(true);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stocks/active/`);
      if (!response.ok) throw new Error("Failed to fetch active stocks");

      const data = await response.json();

      const parsed: StockTransaction[] = data.map((s: any) => ({
        symbol: s.symbol,
        name: s.name,
        currentPrice: s.last_price ?? 0,
        is_active: s.is_active ?? true,
        changePct: s.variation ?? 0,
      }));

      setStocks(parsed);
    } catch (error) {
      console.error("Error loading stocks:", error);
      setStocks([]);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchStocks();
    const interval = setInterval(fetchStocks, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setOffset((prev) => (prev - 1) % ((stocks.length || 1) * 240));
    }, 20);
    return () => clearInterval(interval);
  }, [stocks.length]);

  if (loading || fetching) {
    return (
      <div className="carousel-container">
        <div className="loading-spinner">Loading market trends...</div>
      </div>
    );
  }

  if (stocks.length === 0) {
    return (
      <div className="carousel-container">
        <p>No stocks available right now.</p>
      </div>
    );
  }

  return (
    <div className="carousel-container">
      <div className="carousel-wrapper">
        <div
          className="carousel-track"
          style={{ transform: `translateX(${offset}px)` }}
        >
          {[...stocks, ...stocks].map((tx, idx) => (
            <a key={idx} href={`/stocks/${tx.symbol}`} className="stock-link">
              <div className="stock-card">
                <div className="stock-card-header">
                  <h3>{tx.symbol}</h3>
                  <span className={tx.is_active ? "active" : "inactive"}>
                    {tx.is_active ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="stock-amount">
                  <h4>$.{tx.currentPrice}</h4>
                </div>

                <p
                  className={`stock-change ${
                    tx.changePct >= 0 ? "positive" : "negative"
                  }`}
                >
                  {tx.changePct >= 0 ? "+" : ""}
                  {tx.changePct}%
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StockTrends;
