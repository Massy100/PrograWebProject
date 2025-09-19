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
  variant?: "small" | "large";    
};

export default function StockCard({
  symbol,
  name,
  quantity,
  purchasePrice,
  currentValue,
  change,
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
      </div>

      <div className="stockBody">
        {variant === "large" ? (
          <>
            <p>Quantity: {quantity}</p>
            <p>Purchase Price: Q{purchasePrice.toFixed(2)}</p>
            {currentValue !== undefined && (
              <div className="stockRow">
                <span>Current Value: Q{currentValue.toFixed(2)}</span>
                <span className={`${changeClass} changeText`}>
                  {change! > 0 && "↑ "}  
                  {change! < 0 && "↓ "}   
                  {Math.abs(change!).toFixed(2)}%
                </span>
              </div>
            )}
          </>
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
