"use client";

import React, { useEffect, useState } from "react";
import StockCard from "@/components/stockcard";
import "../../styles/portfolio.css";

type StockData = {
  id: number;
  symbol: string;
  name: string;
  quantity: number;
  purchase_price: number;
  current_value?: number;
  change?: number;
};

export default function Portfolio() {
  const [stocks, setStocks] = useState<StockData[]>([]);


  const fetchStocks = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/stocks/"); 
      const data = await res.json();
      setStocks(data);
    } catch (err) {
      console.error("Error fetching stocks:", err);
    }
  };

  

  useEffect(() => {
    fetchStocks();
  }, []);

  return (
    <div className="page">
      <header className="portfolioHeader">
        <h1>My Portfolio</h1>
      </header>

   

      {stocks.length === 0 ? (
        <p className="noStocksText">You have no stocks in your portfolio.</p>
      ) : (
        <div className="stocksContainer">
          {stocks.map((stock) => (
            <StockCard
              key={stock.id}
              symbol={stock.symbol}
              name={stock.name}
              quantity={stock.quantity}
              purchasePrice={stock.purchase_price}
              currentValue={stock.current_value}
              change={stock.change}
              variant="large"
            />
          ))}
        </div>
      )}


      
    </div>
  );
}
