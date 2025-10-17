"use client";

import React, { useState } from "react";
import "../styles/BuyStockSidebar.css";

interface BuyStockSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  stockName: string;
  stockSymbol: string;
  stockPrice: number;
  portfolios: string[];
  onConfirm: (data: { portfolio: string; quantity: number; total: number }) => void;
}

export const BuyStockSidebar: React.FC<BuyStockSidebarProps> = ({
  isOpen,
  onClose,
  stockName,
  stockSymbol,
  stockPrice,
  portfolios,
  onConfirm,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedPortfolio, setSelectedPortfolio] = useState("");

  const total = stockPrice * quantity;

  const handleConfirm = () => {
    if (!selectedPortfolio) {
      alert("Please select a portfolio.");
      return;
    }

    const purchaseData = {
      portfolio: selectedPortfolio,
      stockName,
      stockSymbol,
      stockPrice,
      quantity,
      total,
      date: new Date().toLocaleString(),
    };


    const existingData = JSON.parse(localStorage.getItem("shoppingCart") || "[]");


    existingData.push(purchaseData);

    localStorage.setItem("shoppingCart", JSON.stringify(existingData));

    onConfirm({ portfolio: selectedPortfolio, quantity, total });

    console.log("lo que se guardo en el localstorage")
    console.log(JSON.parse(localStorage.getItem("shoppingCart") || "[]"));

    onClose();
  };

  return (
    <>
      {isOpen && <div className="wallet-overlay" onClick={onClose}></div>}

      <aside className={`cartSidebar ${isOpen ? "show" : ""}`}>
        <button className="cartCloseBtn" onClick={onClose}>
          ✕
        </button>

        <h2 className="cartHeader">Buy {stockSymbol}</h2>

        <div className="cartDetail">
          <div className="cartDetailHeader">
            <div>
              <p className="cartDetailName">{stockName}</p>
              <p className="cartDetailCompany">{stockSymbol}</p>
            </div>
            <div className="cartDetailPrice">Q{stockPrice.toFixed(2)}</div>
          </div>

          <div className="cartDetailQuantity">
            <label>Portfolio</label>
            <select
              className="buy-sidebar-select"
              value={selectedPortfolio}
              onChange={(e) => setSelectedPortfolio(e.target.value)}
            >
              <option value="">-- Choose one --</option>
              {portfolios.map((p, idx) => (
                <option key={idx} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="cartDetailQuantity">
            <label>Quantity</label>
            <input
              type="number"
              value={quantity}
              min={1}
              onChange={(e) => setQuantity(Number(e.target.value))}
              onWheel={(e) => e.currentTarget.blur()}
            />
          </div>

          <div className="cartDetailInfo">
            <p>
              <strong>Total:</strong>{" "}
              <span style={{ color: "#021631", fontWeight: "600" }}>
                Q{total.toFixed(2)}
              </span>
            </p>
          </div>

          <div className="cartDetailActions">
            <button className="cartFinishBtn" onClick={handleConfirm}>
              Add to Shopping Car
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
