"use client";
import React, { useEffect, useState } from "react";
import "../styles/StockTrends.css";

interface StockTransaction {
  stock: string;
  amount: number;
  is_active: boolean;
  change_percentage: number;
}

interface StockTrendsProps {
  loading?: boolean;
}

const StockTrends: React.FC<StockTrendsProps> = ({ loading = false }) => {
  const [offset, setOffset] = useState(0);

  const stockData: StockTransaction[] = [
    { is_active: true, stock: "MSFT", amount: 1200, change_percentage: 1.2 },
    { is_active: true, stock: "AAPL", amount: 980, change_percentage: -0.8 },
    { is_active: false, stock: "TSLA", amount: 1500, change_percentage: 2.3 },
    { is_active: true, stock: "AMZN", amount: 2100, change_percentage: 0.9 },
    { is_active: true, stock: "GOOG", amount: 1400, change_percentage: -1.5 },
    { is_active: true, stock: "NVDA", amount: 1800, change_percentage: 1.8 },
    { is_active: true, stock: "META", amount: 1300, change_percentage: 2.1 },
    { is_active: true, stock: "NFLX", amount: 1100, change_percentage: -0.6 },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setOffset((prev) => (prev - 1) % (stockData.length * 240));
    }, 20);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="carousel-container">
        <div className="loading-spinner">Loading market trends...</div>
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
          {[...stockData, ...stockData].map((tx, idx) => (
            <a
              key={idx}
              href={`/stocks/${tx.stock}`}
              className="stock-link"
            >
              <div className="stock-card">
                <div className="stock-card-header">
                  <h3>{tx.stock}</h3>
                  <span className={tx.is_active ? "active" : "inactive"}>
                    {tx.is_active ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="stock-amount">
                  <h4>Q.{tx.amount}</h4>
                </div>

                <p
                  className={`stock-change ${
                    tx.change_percentage >= 0 ? "positive" : "negative"
                  }`}
                >
                  {tx.change_percentage >= 0 ? "+" : ""}
                  {tx.change_percentage}%
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