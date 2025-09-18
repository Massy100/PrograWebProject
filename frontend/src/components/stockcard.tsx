"use client";

import React from "react";
import "../styles/portfolio.css";

type StockCardProps = {
  symbol: string;
  name: string;
  quantity: number;
  purchasePrice: number;
  currentValue?: number; 
  change?: number;      
};

export default function StockCard({
  symbol,
  name,
  quantity,
  purchasePrice,
  currentValue,
  change,
}: StockCardProps) {
  let changeClass = "neutral";
  if (change && change > 0) changeClass = "positive";
  if (change && change < 0) changeClass = "negative";

  return (
    <div className="stockCard">
      <div className="stockHeader">
        <h3>{name} <span className="stockSymbol">({symbol})</span></h3>
      </div>
      <div className="stockBody">
        <p>Quantity: {quantity}</p>
        <p>Purchase Price: ${purchasePrice.toFixed(2)}</p>
        {currentValue !== undefined && (
          <p>Current Value: ${currentValue.toFixed(2)} <span className={changeClass}>{change?.toFixed(2)}%</span></p>
        )}
      </div>
    </div>
  );
}
