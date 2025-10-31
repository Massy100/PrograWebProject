"use client";

import React, { useState, useEffect } from "react";
import "../styles/BuyStockSidebar.css";

interface BuyStockSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  stockName: string;
  stockSymbol: string;
  stockPrice: number;
  onConfirm: (data: { portfolio: string; quantity: number; total: number }) => void;
}

export const BuyStockSidebar: React.FC<BuyStockSidebarProps> = ({
  isOpen,
  onClose,
  stockName,
  stockSymbol,
  stockPrice,
  onConfirm,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedPortfolio, setSelectedPortfolio] = useState("");
  const [portfolios, setPortfolios] = useState<string[]>([]);
  const [loadingPortfolios, setLoadingPortfolios] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const total = stockPrice * quantity;

  const fetchPortfolios = async () => {
    try {
      setLoadingPortfolios(true);
      const res = await fetch("http://localhost:8000/api/portfolio/portfolios/");
      if (!res.ok) throw new Error("Failed to fetch portfolios");
      const data = await res.json();
      const names = data.map((p: any) => p.name);
      setPortfolios(names);
    } catch (error) {
      console.error("Error fetching portfolios:", error);
    } finally {
      setLoadingPortfolios(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchPortfolios();
  }, [isOpen]);

  const handleConfirm = () => {
    if (!selectedPortfolio) {
      alert("Please select a portfolio first.");
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

    let cart = JSON.parse(localStorage.getItem("shoppingCart") || "[]");

    const existingIndex = cart.findIndex(
      (item: any) =>
        item.stockSymbol === stockSymbol &&
        item.portfolio === selectedPortfolio
    );

    if (existingIndex !== -1) {
      cart[existingIndex].quantity += quantity;
      cart[existingIndex].total =
        cart[existingIndex].stockPrice * cart[existingIndex].quantity;
      cart[existingIndex].date = new Date().toLocaleString();
    } else {
      cart.push(purchaseData);
    }

    localStorage.setItem("shoppingCart", JSON.stringify(cart));
    window.dispatchEvent(new Event("storage"));

    onConfirm({ portfolio: selectedPortfolio, quantity, total });

    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);

    console.log("🛍️ Updated Cart:", cart);
    onClose();
  };

  return (
    <>
      {showToast && (
        <div className="toast-success">
          ✅ Added <strong>{stockSymbol}</strong> to your cart!
        </div>
      )}

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
            {loadingPortfolios ? (
              <p>Loading portfolios...</p>
            ) : (
              <select
                className="buy-sidebar-select"
                value={selectedPortfolio}
                onChange={(e) => setSelectedPortfolio(e.target.value)}
              >
                <option value="">-- Choose one --</option>
                {portfolios.length > 0 ? (
                  portfolios.map((p, idx) => (
                    <option key={idx} value={p}>
                      {p}
                    </option>
                  ))
                ) : (
                  <option disabled>No portfolios available</option>
                )}
              </select>
            )}
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
                ${total}
              </span>
            </p>
          </div>

          <div className="cartDetailActions">
            <button className="cartFinishBtn" onClick={handleConfirm}>
              Add to Cart
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
