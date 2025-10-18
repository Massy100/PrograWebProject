"use client";

import React, { useEffect, useState } from "react";
import "../styles/StockApproval.css";

type StockItem = {
  symbol: string;
  name: string;
  currentPrice: number;
  changePct: number;
  last30d: number[];
  targetPrice: number;
  recommendation: string;
};

export default function StockManager() {
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [systemStocks, setSystemStocks] = useState<StockItem[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [tab, setTab] = useState<"pending" | "system">("pending");

  // esta es la simulacion de datos de las stock que en teoria ya tenemos en nuestro sistema
  const mockSystemStocks: StockItem[] = [
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      currentPrice: 175.23,
      changePct: 1.25,
      last30d: [168, 170, 172, 174, 175],
      targetPrice: 190,
      recommendation: "BUY",
    },
    {
      symbol: "TSLA",
      name: "Tesla Inc.",
      currentPrice: 250.5,
      changePct: -2.13,
      last30d: [260, 258, 255, 253, 250],
      targetPrice: 300,
      recommendation: "HOLD",
    },
    {
      symbol: "NVDA",
      name: "NVIDIA Corp.",
      currentPrice: 895.6,
      changePct: 3.05,
      last30d: [820, 850, 870, 890, 895],
      targetPrice: 950,
      recommendation: "STRONG BUY",
    },
  ];

  useEffect(() => {
    if (tab === "pending") {
      const stored = localStorage.getItem("stocksToTheSystem");
      setStocks(stored ? JSON.parse(stored) : []);
    } else {
      // aqui es donde tiene que estar la conexion con el back de donde esten guardadas las stocks que ya estan en el sistema 
      setSystemStocks(mockSystemStocks);
    }
  }, [tab]);

  const toggleSelect = (symbol: string) => {
    setSelected((prev) =>
      prev.includes(symbol)
        ? prev.filter((s) => s !== symbol)
        : [...prev, symbol]
    );
  };

  const handleConfirm = () => {
    if (tab === "pending") {
      // estas son las acciones que el admin ya confirmó que quiere ingresar al sistema
      const approved = stocks.filter((s) => selected.includes(s.symbol));

      // aqui se tendria que agregar el back para mandar esas acciones al backend
      // para que el sistema ya tenga acceso a ellas
      console.log("Approved stocks to send:", approved);

      // elimina del localstorage las acciones que fueron aprobadas
      const remaining = stocks.filter((s) => !selected.includes(s.symbol));
      localStorage.setItem("stocksToTheSystem", JSON.stringify(remaining));
      setStocks(remaining);
    } else {
      // estas son las acciones que el admin decidió eliminar del sistema
      const removedStocks = systemStocks.filter((s) =>
        selected.includes(s.symbol)
      );

      // aqui se tendria que agregar el back para eliminar estas acciones del sistema
      console.log("Removed system stocks:", removedStocks);

      // actualiza el estado eliminando las acciones seleccionadas
      const remaining = systemStocks.filter(
        (s) => !selected.includes(s.symbol)
      );
      setSystemStocks(remaining);
    }

    // limpia la selección y cierra el modal
    setSelected([]);
    setShowModal(false);
  };
  
  return (
    <section className="approval-container">
      <h2 className="approval-title">Stock Management</h2>
      <p className="approval-subtitle">
        Manage pending approvals and system stocks
      </p>

      <div className="tabs-container">
        <button
          className={`tab-btn ${tab === "pending" ? "active" : ""}`}
          onClick={() => setTab("pending")}
        >
          Pending Stocks{" "}
          <span className="tab-count">
            ({stocks.length > 0 ? stocks.length : 0})
          </span>
        </button>
        <button
          className={`tab-btn ${tab === "system" ? "active" : ""}`}
          onClick={() => setTab("system")}
        >
          In System{" "}
          <span className="tab-count">
            ({systemStocks.length > 0 ? systemStocks.length : 0})
          </span>
        </button>
      </div>

      <div className="approval-table">
        <div className="approval-header">
          <div></div>
          <div>Symbol</div>
          <div>Name</div>
          <div>Trend (30d)</div>
          <div>Current Price</div>
          <div>Target Price</div>
          <div>Change %</div>
        </div>

        {(tab === "pending" ? stocks : systemStocks).length === 0 ? (
          <div className="approval-empty">
            {tab === "pending"
              ? "No pending stocks to review."
              : "No stocks currently in the system."}
          </div>
        ) : (
          (tab === "pending" ? stocks : systemStocks).map((s) => {
            const trendUp = s.last30d[s.last30d.length - 1] >= s.last30d[0];
            return (
              <div
                key={s.symbol}
                className={`approval-row ${
                  selected.includes(s.symbol) ? "selected-row" : ""
                }`}
              >
                <div>
                  <input
                    type="checkbox"
                    checked={selected.includes(s.symbol)}
                    onChange={() => toggleSelect(s.symbol)}
                  />
                </div>
                <div className="symbol-cell">{s.symbol}</div>
                <div>{s.name}</div>
                <div>
                  <Sparkline
                    data={s.last30d}
                    positiveColor={trendUp ? "#1AC963" : "#F8191E"}
                    negativeColor={trendUp ? "#1AC963" : "#F8191E"}
                  />
                </div>
                <div className="price">Q.{s.currentPrice}</div>
                <div className="price">Q.{s.targetPrice}</div>
                <div>
                  <span
                    className={`change-badge ${
                      s.changePct >= 0 ? "positive" : "negative"
                    }`}
                  >
                    {s.changePct >= 0 ? "+" : ""}
                    {s.changePct.toFixed(2)}%
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {(tab === "pending" ? stocks : systemStocks).length > 0 && (
        <div className="approval-footer">
          <button
            className={`confirm-btn ${tab === "system" ? "remove-btn" : ""}`}
            onClick={() => setShowModal(true)}
            disabled={selected.length === 0}
          >
            {tab === "pending" ? "Confirm Approval" : "Remove Selected"}
          </button>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>
              {tab === "pending" ? "Confirm Approval" : "Remove Stocks"}
            </h3>
            <p>
              Are you sure you want to{" "}
              {tab === "pending" ? "approve" : "remove"}{" "}
              <strong>{selected.length}</strong> stock(s)?
            </p>
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button className="approve-btn" onClick={handleConfirm}>
                Yes, {tab === "pending" ? "Approve" : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}


function Sparkline({
  data,
  positiveColor,
  negativeColor,
}: {
  data: number[];
  positiveColor: string;
  negativeColor: string;
}) {
  if (!data || data.length < 2) return null;

  const w = 120;
  const h = 36;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * (w - 2) + 1;
    const y = h - 1 - ((v - min) / range) * (h - 2);
    return `${x},${y}`;
  });

  const up = data[data.length - 1] >= data[0];

  return (
    <svg
      className="stocks-table-sparkline"
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      aria-hidden="true"
    >
      <polyline
        fill="none"
        stroke={up ? positiveColor : negativeColor}
        strokeWidth="2"
        points={points.join(" ")}
      />
      <polygon
        points={`1,${h - 1} ${points.join(" ")} ${w - 1},${h - 1}`}
        fill={up ? "rgba(81,174,110,0.12)" : "rgba(197,91,115,0.12)"}
      />
    </svg>
  );
}
