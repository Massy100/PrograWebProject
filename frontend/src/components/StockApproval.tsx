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

export default function StockApproval() {
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("stocksToTheSystem");
    if (stored) setStocks(JSON.parse(stored));
  }, []);

  const toggleSelect = (symbol: string) => {
    setSelected((prev) =>
      prev.includes(symbol)
        ? prev.filter((s) => s !== symbol)
        : [...prev, symbol]
    );
  };

  const confirmApproval = () => {
    // estas son las acciones que el admin ya confirmo que quiere ingresar al sistema
    const approvedStocks = stocks.filter((s) =>
      selected.includes(s.symbol)
    );

    // aqui se tendria que agregar el back para mandar esas stocks al back para que el sistema ya tenga acceso a esas
    console.log("Approved stocks to send:", approvedStocks);

    // elimina del localstorage las acciones que fueron a probadas
    const remaining = stocks.filter((s) => !selected.includes(s.symbol));
    localStorage.setItem("stocksToTheSystem", JSON.stringify(remaining));
    setStocks(remaining);
    setSelected([]);
    setShowModal(false);
  };

  return (
    <section className="approval-container">
      <h2 className="approval-title">Stock Approval</h2>
      <p className="approval-subtitle">
        Review and confirm the stocks to be added to the system
      </p>

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

        {stocks.length === 0 ? (
          <div className="approval-empty">No pending stocks to review.</div>
        ) : (
          stocks.map((s) => {
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
                    className="input-add"
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

      {stocks.length > 0 && (
        <div className="approval-footer">
          <button
            className="confirm-btn"
            onClick={() => setShowModal(true)}
            disabled={selected.length === 0}
          >
            Confirm Approval
          </button>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Approval</h3>
            <p>
              Are you sure you want to approve{" "}
              <strong>{selected.length}</strong> stock(s)?
            </p>
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button className="approve-btn" onClick={confirmApproval}>
                Yes, Approve
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
        fill={up ? "rgba(26,201,99,0.12)" : "rgba(248,25,30,0.12)"}
      />
    </svg>
  );
}
