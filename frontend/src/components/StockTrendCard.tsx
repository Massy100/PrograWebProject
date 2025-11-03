"use client";
import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler,
  Tooltip,
} from "chart.js";
import "../styles/StockTrendCard.css";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Filler, Tooltip);

interface StockData {
  name: string;
  symbol: string;
  currentPrice: number;
  changePercent: number;
  history: number[];
  status: "up" | "down";
}

interface Props {
  stocks: StockData[];
}

export default function StockTrendCard({ stocks }: Props) {
  const [index, setIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

  const stock = stocks[index];
  const isUp = stock.status === "up";
  const safeHistory = stock.history ?? [];

  const data = {
    labels: safeHistory.map((_, i) => i.toString()),
    datasets: [
      {
        data: safeHistory,
        fill: true,
        borderColor: isUp ? "#0ecb81" : "#f6465d",
        backgroundColor: isUp
          ? "rgba(14, 203, 129, 0.15)"
          : "rgba(246, 70, 93, 0.15)",
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { x: { display: false }, y: { display: false } },
  };

  return (
    <div className={`trendCard ${isUp ? "up" : "down"} ${animating ? "fade" : ""}`}>
      <div className="trendLeft">
        <div className="trendChart">
          <Line data={data} options={options} />
        </div>
      </div>

      <div className="trendRight">
        <div className="trendHeader">
          <h3>{stock.name}</h3>
          {/* <span className={`status ${isUp ? "up" : "down"}`}>
            {stock.status.toUpperCase()}
          </span> */}
        </div>
        <p className="trendSub">{stock.symbol}</p>
        <p className="trendPrice">${stock.currentPrice}</p>
        <p className={`trendPercent ${isUp ? "up" : "down"}`}>
          {stock.changePercent > 0 ? "+" : ""}
          {stock.changePercent}%
        </p>
      </div>
    </div>
  );
}
