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
};

export default function PopularStocksCard({ items }: Props) {
  const visibleItems = items.slice(0, 4);

  return (
    <aside className="popular-stocks-card" aria-label="Most popular stocks">
      <h3 className="popular-stocks-card-title">Most Popular Stocks</h3>

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
              {/* Left: symbol + name */}
              <div className="popular-stocks-card-item-left">
                <span className="popular-stocks-card-item-symbol">
                  {it.symbol}
                </span>
                <span className="popular-stocks-card-item-name">
                  {it.name}
                </span>
              </div>

              {/* Right: price + change */}
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
