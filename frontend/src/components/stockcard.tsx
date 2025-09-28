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
  category?: string; 
  variant?: "small" | "large";    
};

export default function StockCard({
  symbol,
  name,
  quantity,
  purchasePrice,
  currentValue,
  change,
  category,  
  variant = "large",
}: StockCardProps) {
  let changeClass = "neutral";
  if (change && change > 0) changeClass = "positive";
  if (change && change < 0) changeClass = "negative";

  return (
    <div className={`stockCard ${variant}`}>
      <div className="stockHeader">
        <h3>
          {name} <span className="stockSymbol">({symbol})</span>
        </h3>
        {category && <span className="stockCategory">{category}</span>}
      </div>

      <div className="stockBody">
        {variant === "large" ? (
          <div className="stockInfoContainer">
            <div className="stockInfoRow">
              <p>Quantity: {quantity}</p>
              <p>Purchase Price: Q{purchasePrice.toFixed(2)}</p>
              <p>Current Value: Q{currentValue?.toFixed(2)}</p>
            </div>

            {currentValue !== undefined && (
              <span className={`${changeClass} changeText`}>
                {change! > 0 && "↑ "}
                {change! < 0 && "↓ "}
                {Math.abs(change!).toFixed(2)}%
              </span>
            )}
          </div>
        ) : (
          <>
            {currentValue !== undefined && (
              <p>
                ${currentValue.toFixed(2)}{" "}
                <span className={changeClass}>{change?.toFixed(2)}%</span>
              </p>
            )}
          </>
        )}




      </div>
    </div>
  );

}
