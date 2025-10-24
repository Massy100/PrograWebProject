"use client";

import React from "react";
import "../styles/popularCardStocks.css";

export type PopularStock = {
  symbol: string;
  name: string;
  price: number;
  changePct?: number;
  investorsPct?: number;
};

type Props = {
  items: PopularStock[];
  loading?: boolean;
};

export default function DobleStockTable({ items, loading = false }: Props) {
  const visibleItems = items.slice(0, 4);

  if (loading) {
    return (
      <aside className="popular-stocks-card" aria-label="Most popular stocks">
        <div className="popular-stocks-card-header">
          <span className="hdr-left">Stock</span>
          <span className="hdr-mid">Price</span>
        </div>
        <div className="loading-spinner">Loading stocks...</div>
      </aside>
    );
  }

  return (
    <aside className="popular-stocks-card" aria-label="Most popular stocks">
      <div className="popular-stocks-card-header">
        <span className="hdr-left">Stock</span>
        <span className="hdr-mid">Price</span>
      </div>

      <ul className="popular-stocks-card-list">
        {visibleItems.map((it) => (
          <a
            key={it.symbol}
            href={`/stocks/${it.symbol}`}
            className="popular-stocks-card-link"
          >
            <li className="popular-stocks-card-item">
              <div className="popular-stocks-card-item-left">
                <span className="popular-stocks-card-item-symbol">
                  {it.symbol}
                </span>
                <span className="popular-stocks-card-item-name">
                  {it.name}
                </span>
              </div>

              <div className="popular-stocks-card-item-right">
                <span className="popular-stocks-card-item-price">
                  Q.{it.price}
                </span>
                {typeof it.changePct === "number" && (
                  <span
                    className={
                      "popular-stocks-card-item-change " +
                      (it.changePct >= 0
                        ? "popular-stocks-text-positive"
                        : "popular-stocks-text-negative")
                    }
                  >
                    {it.changePct >= 0 ? "+" : ""}
                    {it.changePct.toFixed(2)}%
                  </span>
                )}
              </div>
            </li>
          </a>
        ))}
      </ul>
    </aside>
  );
}