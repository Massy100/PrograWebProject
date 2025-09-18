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
  const [showAddModal, setShowAddModal] = useState(false);


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

      <button className="addButton" onClick={() => setShowAddModal(true)}>
        + Add Stock
      </button>

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
            />
          ))}
        </div>
      )}


      {showAddModal && (
        <div className="modalOverlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modalTitle">Add New Stock</h2>
            <form className="form" onSubmit={(e) => e.preventDefault()}>
              <input type="text" placeholder="Symbol" className="input" required />
              <input type="text" placeholder="Name" className="input" required />
              <input type="number" placeholder="Quantity" className="input" required />
              <input type="number" placeholder="Purchase Price" className="input" required />
              <button type="submit" className="submitButton">Add</button>
            </form>
            <button className="closeButton" onClick={() => setShowAddModal(false)}>X</button>
          </div>
        </div>
      )}
    </div>
  );
}
