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
  if (!rows || rows.length === 0) {
    return (
      <div className="stock-table no-data">
        <p>No investments found for this portfolio.</p>
      </div>
    );
  }

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

      {rows.map((s) => {
        const quantity = Number(s.quantity || 0);
        const purchasePrice = Number(s.purchasePrice || 0);
        const averagePrice = Number(s.averagePrice || 0);
        const totalInvested = Number(s.totalInvested || 0);
        const change = !isNaN(Number(s.change)) ? Number(s.change) : 0;
        const lastPurchaseDate = s.lastPurchaseDate
          ? new Date(s.lastPurchaseDate).toLocaleDateString()
          : "N/A";

        return (
          <div key={s.symbol} className="stock-table-row">
            <div className="stock-info">
              <strong className="symbol">{s.symbol}</strong>
              <span className="name">{s.name}</span>
            </div>

            <div>{quantity}</div>
            <div>Q.{purchasePrice.toFixed(2)}</div>
            <div>Q.{averagePrice.toFixed(2)}</div>
            <div>Q.{totalInvested.toFixed(2)}</div>

            <div>
              <span
                className={`status-pill ${s.isActive ? "active" : "inactive"}`}
              >
                {s.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <div>{lastPurchaseDate}</div>

            <div
              className={`change ${
                change > 0 ? "positive" : change < 0 ? "negative" : ""
              }`}
            >
              {change !== 0
                ? `${change > 0 ? "+" : ""}${change.toFixed(2)}%`
                : "0.00%"}
            </div>
          </div>
        );
      })}
    </section>
  );
}
