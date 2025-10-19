"use client";

import React from "react";
import "../styles/stockcard.css";

export type StockRow = {
  symbol: string;
  name: string;
  quantity: number;
  purchasePrice: number;
  averagePrice: number;
  totalInvested: number;
  isActive: boolean;
  lastPurchaseDate: string;
  change?: number;
};

type Props = {
  rows: StockRow[];
};

export default function StockCard({ rows }: Props) {
  return (
    <section className="stock-table">
      <header className="stock-table-header">
        <div>Stock</div>
        <div>Quantity</div>
        <div>
          Purchase
          <br />
          Price
        </div>
        <div>
          Average
          <br />
          Price
        </div>
        <div>
          Total
          <br />
          Invested
        </div>
        <div>Status</div>
        <div>
          Last
          <br />
          Purchase
        </div>
        <div>Change</div>
      </header>


      {rows.map((s) => (
        <div key={s.symbol} className="stock-table-row">
          <div className="stock-info">
            <strong className="symbol">{s.symbol}</strong>
            <span className="name">{s.name}</span>
          </div>

          <div>{s.quantity}</div>
          <div>Q.{s.purchasePrice.toFixed(2)}</div>
          <div>Q.{s.averagePrice.toFixed(2)}</div>
          <div>Q.{s.totalInvested.toFixed(2)}</div>

          <div>
            <span
              className={`status-pill ${s.isActive ? "active" : "inactive"}`}
            >
              {s.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          <div>{new Date(s.lastPurchaseDate).toLocaleDateString()}</div>

          <div
            className={`change ${
              s.change && s.change > 0
                ? "positive"
                : s.change && s.change < 0
                ? "negative"
                : ""
            }`}
          >
            {s.change !== undefined
              ? `${s.change > 0 ? "+" : ""}${s.change.toFixed(2)}%`
              : "-"}
          </div>
        </div>
      ))}
    </section>
  );
}
