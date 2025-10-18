"use client";

import React, { useState } from "react";
import "../styles/AddStocksTable.css";

export type StockItem = {
  symbol: string;
  name: string;
  currentPrice: number;
  changePct: number;
  last30d: number[]; // los ultimos precios de la accion o de los ultimos precios segun la hora osea a las 9 costa 450 a las 10 400 y asi
  targetPrice: number;
  recommendation: string;
};

type Props = {
  rows: StockItem[];
};

export default function AddStocksTable({ rows }: Props) {
  const pageSize = 15;
  const [page, setPage] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  const totalPages = Math.ceil(rows.length / pageSize);
  const startIndex = page * pageSize;
  const visibleRows = rows.slice(startIndex, startIndex + pageSize);

  const nextPage = () => setPage((p) => Math.min(p + 1, totalPages - 1));
  const prevPage = () => setPage((p) => Math.max(p - 1, 0));

  const handleAddStock = (stock: StockItem) => {
    const stored = localStorage.getItem("stocksToTheSystem");
    const currentStocks: StockItem[] = stored ? JSON.parse(stored) : [];

    const alreadyExists = currentStocks.some((s) => s.symbol === stock.symbol);
    if (!alreadyExists) {
      currentStocks.push(stock);
      localStorage.setItem("stocksToTheSystem", JSON.stringify(currentStocks));
      setToast(`Stock ${stock.symbol} added successfully!`);
      console.log(
        "stocksToTheSystem:",
        JSON.parse(localStorage.getItem("stocksToTheSystem") || "[]")
      );
    } else {
      setToast(`Stock ${stock.symbol} is already added.`);
    }

    setTimeout(() => setToast(null), 2500);
  };

  return (
    <section className="stocks-table">
      {toast && <div className="toast">{toast}</div>}

      <div className="stocks-table-header">
        <div className="stocks-table-header-cell stocks-table-col-stock">
          Stocks
        </div>
        <div className="stocks-table-header-cell">Current Price</div>
        <div className="stocks-table-header-cell">Last 30 Days</div>
        <div className="stocks-table-header-cell">Target Price</div>
        <div className="stocks-table-header-cell">Recommendation</div>
        <div className="stocks-table-header-cell">Add Stock</div>
      </div>
      <div className="stocks-table-body">
        {visibleRows.map((s) => {
          const trendUp = s.last30d[s.last30d.length - 1] >= s.last30d[0];
          return (
            <div key={s.symbol} className="stocks-table-row">
              <div className="stocks-table-cell stocks-table-col-stock">
                <div className="stocks-table-stock-name">
                  <strong className="stocks-table-stock-symbol">
                    {s.symbol}
                  </strong>
                  <span className="stocks-table-stock-fullname">{s.name}</span>
                </div>
              </div>

              <div className="stocks-table-cell">
                <div className="stocks-table-price">
                  <span className="stocks-table-price-value">
                    Q.{s.currentPrice}
                  </span>
                  <span
                    className={
                      "stocks-table-price-change " +
                      (s.changePct >= 0
                        ? "stocks-table-text-positive"
                        : "stocks-table-text-negative")
                    }
                  >
                    ({s.changePct >= 0 ? "+" : ""}
                    {s.changePct.toFixed(2)}%)
                  </span>
                </div>
              </div>

              <div className="stocks-table-cell">
                <Sparkline
                  data={s.last30d}
                  positiveColor={trendUp ? "#1AC963" : "#F8191E"}
                  negativeColor={trendUp ? "#1AC963" : "#F8191E"}
                />
              </div>

              <div className="stocks-table-cell">
                <span className="stocks-table-target-price">
                  Q.{s.targetPrice}
                </span>
              </div>

              <div className="stocks-table-cell">
                <span
                  className={
                    "stocks-table-recommendation-pill " +
                    (s.recommendation.toLowerCase().includes("buy")
                      ? "stocks-table-pill-positive"
                      : s.recommendation.toLowerCase().includes("sell")
                      ? "stocks-table-pill-negative"
                      : "stocks-table-pill-neutral")
                  }
                >
                  {s.recommendation}
                </span>
              </div>

              <div className="stocks-table-cell">
                <button
                  className="add-stock-btn"
                  onClick={() => handleAddStock(s)}
                >
                  + Add
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="stocks-table-pagination">
          <button
            className="pagination-btn"
            onClick={prevPage}
            disabled={page === 0}
          >
            ‹ Prev
          </button>
          <span className="pagination-info">
            Page {page + 1} of {totalPages}
          </span>
          <button
            className="pagination-btn"
            onClick={nextPage}
            disabled={page >= totalPages - 1}
          >
            Next ›
          </button>
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
