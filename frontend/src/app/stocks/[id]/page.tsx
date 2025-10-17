"use client";

import React, { useState } from "react";
import "./StockPage.css";
import { StockChart } from "@/components/StockChart";
import { BuyStockSidebar } from "@/components/BuyStockSidebar";

export default function StockOverviewPage() {
  const [showSidebar, setShowSidebar] = useState(false);

  // esta es la info que se tiene que fijooo recibir para la grafica osea, la hora o la fecha y el precio tiene que existir varios datos
  // para que se pueda ver mejor la grafica
  const stockData = [
    { date: "9 AM", value: 120 },
    { date: "10 AM", value: 135 },
    { date: "11 AM", value: 150 },
    { date: "12 PM", value: 160 },
    { date: "1 PM", value: 158 },
    { date: "2 PM", value: 165 },
    { date: "3 PM", value: 172 },
    { date: "9 AM", value: 20 },
    { date: "10 AM", value: 75 },
    { date: "11 AM", value: 150 },
    { date: "12 PM", value: 140 },
    { date: "1 PM", value: 60 },
    { date: "2 PM", value: 125 },
    { date: "3 PM", value: 90 },
  ];

  const stockInfo = {
    symbol: "TSLA",
    name: "Tesla Inc.",
    category: "Automotive / Technology",
    lastPrice: 172.35,
    variation: 1.45,
    updatedAt: "15/10/2025, 14:32",
    createdAt: "10/01/2020, 09:00",
    status: "Active",
  };

  const isPositive = stockInfo.variation >= 0;

  return (
    <div className="stock-page">
      <section className="stock-hero">
        <div>
          <h1 className="hero-title">
            {stockInfo.name} <br /> ({stockInfo.symbol})
          </h1>
          <p className="hero-subtitle">{stockInfo.category}.</p>
        </div>

        <button className="buy-stock-btn" onClick={() => setShowSidebar(true)}>
          Add Stock
        </button>
      </section>

      <section className="stock-metrics">
        <div className="metric">
          <span>SYMBOL</span>
          <p>{stockInfo.symbol}</p>
        </div>
        <div className="metric">
          <span>LAST PRICE</span>
          <p>Q{stockInfo.lastPrice.toFixed(2)}</p>
        </div>
        <div className="metric">
          <span>VARIATION</span>
          <p className={isPositive ? "positive" : "negative"}>
            {isPositive ? "+" : ""}
            {stockInfo.variation.toFixed(2)}%
          </p>
        </div>
        <div className="metric">
          <span>STATUS</span>
          <p className={stockInfo.status === "Active" ? "active" : "inactive"}>
            {stockInfo.status}
          </p>
        </div>
      </section>

      <div className="stock-chart-section">
        <StockChart name={stockInfo.symbol} data={stockData} theme="dark" />
      </div>

      {/* Detailed Info Section */}
      <div className="stock-info-section">
        <div className="stock-info-card">
          <h3>Stock Information</h3>
          <div className="stock-info-row">
            <span>Symbol</span>
            <p>{stockInfo.symbol}</p>
          </div>
          <div className="stock-info-row">
            <span>Name</span>
            <p>{stockInfo.name}</p>
          </div>
          <div className="stock-info-row">
            <span>Category</span>
            <p>{stockInfo.category}</p>
          </div>
          <div className="stock-info-row">
            <span>Created At</span>
            <p>{stockInfo.createdAt}</p>
          </div>
          <div className="stock-info-row">
            <span>Last Updated</span>
            <p>{stockInfo.updatedAt}</p>
          </div>
          <div className="stock-info-row">
            <span>Status</span>
            <div
              className={`status-badge ${
                stockInfo.status === "Active" ? "active" : "inactive"
              }`}
            >
              {stockInfo.status}
            </div>
          </div>
        </div>

        <div className="stock-info-card">
          <h3>Market Data</h3>
          <div className="stock-info-row">
            <span>Last Price</span>
            <p className="stock-price">Q{stockInfo.lastPrice.toFixed(2)}</p>
          </div>
          <div className="stock-info-row">
            <span>Variation</span>
            <p
              className={`stock-variation ${
                isPositive ? "positive" : "negative"
              }`}
            >
              {isPositive ? "+" : ""}
              {stockInfo.variation.toFixed(2)}%
            </p>
          </div>
          <div className="stock-info-row">
            <span>Market Trend</span>
            <p className={`trend ${isPositive ? "up" : "down"}`}>
              {isPositive ? "Upward" : "Downward"}
            </p>
          </div>
        </div>
      </div>


      <BuyStockSidebar
        isOpen={showSidebar}
        onClose={() => setShowSidebar(false)}
        stockName={stockInfo.name}
        stockSymbol={stockInfo.symbol}
        stockPrice={stockInfo.lastPrice}
        portfolios={["Main Portfolio", "Growth Fund", "Tech Picks"]}
        onConfirm={(data) => {
          console.log("Added to portfolio:", data);
        }}
      />
    </div>
  );
}
