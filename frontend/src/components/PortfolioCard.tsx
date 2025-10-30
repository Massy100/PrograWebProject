"use client";

import React from "react";
import { useRouter } from "next/navigation";
import "../styles/PortfolioCard.css";

interface Portfolio {
  id: number;
  name: string;
  created_at: string;
  avg_price: number;
  total_invested: number;
  current_value: number;
  is_active: boolean;
}

interface Props {
  data: Portfolio;
}

const PortfolioCard: React.FC<Props> = ({ data }) => {
  const router = useRouter();

  const {
    id,
    name,
    created_at,
    avg_price,
    total_invested,
    current_value,
    is_active,
  } = data;

  const gain = current_value - total_invested;
  const gainPercent =
    total_invested && total_invested !== 0
      ? ((gain / total_invested) * 100).toFixed(2)
      : "0.00";
  const gainColor = gain >= 0 ? "#51AE6E" : "#ff4033";


  const handleClick = () => {
    sessionStorage.setItem("selectedPortfolio", JSON.stringify(data));

    router.push(`/portfolio/${id}`);
  };

  return (
    <div className="portfolio-card" onClick={handleClick}>
      <div className="portfolio-header">
        <h3>{name}</h3>
        <span
          className="status"
          style={{ color: is_active ? "#51AE6E" : "#ff4033" }}
        >
          {is_active ? "Active" : "Inactive"}
        </span>
      </div>

      <p className="portfolio-date">
        Created on {new Date(created_at).toLocaleDateString("en-US")}
      </p>

      <div className="portfolio-stats">
        <div>
          <strong>Avg:</strong> ${avg_price}
        </div>
        <div>
          <strong>Invested:</strong> ${total_invested}
        </div>
        <div>
          <strong>Current:</strong> ${current_value}
        </div>
        <div style={{ color: gainColor }}>
          <strong>{gain >= 0 ? "Gain" : "Loss"}:</strong> {gainPercent}%
        </div>
      </div>

      <div className="mini-chart">
        <div className="chart-container">
          <svg viewBox="0 0 36 36" className="mini-pie">
            <circle
              className="chart-bg"
              cx="18"
              cy="18"
              r="15.9155"
              fill="none"
              stroke="#EDEDF2"
              strokeWidth="3"
            />
            <circle
              className="chart-gain"
              cx="18"
              cy="18"
              r="15.9155"
              fill="none"
              stroke={`url(#grad-${id})`}
              strokeWidth="3"
              strokeDasharray={`${Math.min(
                total_invested > 0 ? (current_value / total_invested) * 100 : 0,
                100
              )}, 100`}
              strokeLinecap="round"
              transform="rotate(-90 18 18)"
            />

            <defs>
              <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="1" y2="1">
                <stop
                  offset="0%"
                  stopColor={gain >= 0 ? "#51AE6E" : "#FF4033"}
                />
                <stop
                  offset="100%"
                  stopColor={gain >= 0 ? "#2779F5" : "#EFAE3C"}
                />
              </linearGradient>
            </defs>
          </svg>

          <div className="chart-hover">
            <p
              style={{
                fontWeight: 600,
                color: gainColor,
                marginBottom: "4px",
              }}
            >
              {gain >= 0 ? "Portfolio growing" : "Portfolio decreasing"}
            </p>

            <p style={{ marginBottom: "4px" }}>
              It's now at{" "}
              <strong>
                {total_invested > 0
                  ? ((current_value / total_invested) * 100).toFixed(1)
                  : "0.0"}
                %
              </strong>{" "}
              of your total investment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioCard;
