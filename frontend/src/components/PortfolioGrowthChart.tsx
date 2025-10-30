"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "../styles/PortfolioGrowthChart.css";
import PortfolioCreator from "@/components/PortfolioCreator";

interface PortfolioGrowth {
  month: string;
  [key: string]: number | string;
}

interface PortfolioSummary {
  id: number;
  name: string;
}

interface Props {
  portfolios: PortfolioSummary[];
  growthData: any[];
}

export default function PortfolioGrowthChart({ portfolios, growthData }: Props) {
  const router = useRouter();
  const [isChartOpen, setIsChartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showCreatePortfolio, setShowCreatePortfolio] = useState(false);
  const [search, setSearch] = useState("");
  const [processedData, setProcessedData] = useState<PortfolioGrowth[]>([]);

  const filteredPortfolios = portfolios.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handlePortfolioClick = (id: number) => {
    const selected = portfolios.find((p) => p.id === id);
    if (selected) {
      sessionStorage.setItem("selectedPortfolio", JSON.stringify(selected));
      router.push(`/portfolio/${id}`);
    }
  };

  useEffect(() => {
    if (!growthData || growthData.length === 0) {
      setProcessedData([]);
      return;
    }

    const grouped: Record<string, any> = {};

    growthData.forEach((item) => {
      const month = new Date(item.month).toLocaleString("en-US", { month: "short" });
      if (!grouped[month]) grouped[month] = { month };
      grouped[month][item.portfolio__name] = Number(item.total_value || 0);
    });

    const transformed = Object.values(grouped);
    setProcessedData(transformed);
  }, [growthData]);

  return (
    <div className="growth-chart-container">
      <div className="chart-controls">
    <button
      className={`toggle-chart-btn ${isChartOpen ? "open" : ""}`}
      onClick={() => setIsChartOpen(!isChartOpen)}
    >
      {isChartOpen ? (
        "✕"
      ) : (
        <svg
          stroke="currentColor"
          fill="currentColor"
          strokeWidth="0"
          viewBox="0 0 24 24"
          height="1em"
          width="1em"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M3 3v18h18v-2H5V3H3zm16 4-4.5 6-3-4-4.5 6h14l-2-3z"></path>
        </svg>
      )}
    </button>

    <button
      className="search-toggle-btn"
      onClick={() => setIsSearchOpen(!isSearchOpen)}
    >
      <svg
        stroke="currentColor"
        fill="currentColor"
        strokeWidth="0"
        viewBox="0 0 24 24"
        height="1em"
        width="1em"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M10 2a8 8 0 0 0 0 16 7.93 7.93 0 0 0 4.9-1.7l5.4 5.4 1.4-1.4-5.4-5.4A7.93 7.93 0 0 0 18 10a8 8 0 0 0-8-8zm0 2a6 6 0 1 1 0 12A6 6 0 0 1 10 4z"></path>
      </svg>
    </button>

    <button
      className="create-portfolio-btn"
      onClick={() => setShowCreatePortfolio(true)}
      title="Create new portfolio"
    >
      <svg
        stroke="currentColor"
        fill="currentColor"
        strokeWidth="0"
        viewBox="0 0 24 24"
        height="1em"
        width="1em"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z"></path>
      </svg>
    </button>
  </div>


      {isSearchOpen && (
        <div className="search-panel">
          <input
            type="text"
            className="search-input"
            placeholder="Search portfolio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {search && (
            <ul className="search-results">
              {filteredPortfolios.length > 0 ? (
                filteredPortfolios.map((p) => (
                  <li key={p.id} onClick={() => handlePortfolioClick(p.id)}>
                    {p.name}
                  </li>
                ))
              ) : (
                <li className="no-results">No results found</li>
              )}
            </ul>
          )}
        </div>
      )}
      
      {isChartOpen && (
        <div className="growth-chart-panel">
          <h2 className="chart-title">Portfolio Growth Overview</h2>

          {processedData.length === 0 ? (
            <p className="no-data">No growth data available.</p>
          ) : (
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={processedData}>
                  <XAxis dataKey="month" stroke="#646C79" />
                  <YAxis stroke="#646C79" />
                  <Tooltip />
                  <Legend />
                  {Object.keys(processedData[0])
                    .filter((k) => k !== "month")
                    .map((key, i) => (
                      <Line
                        key={key}
                        type="monotone"
                        dataKey={key}
                        strokeWidth={2}
                        stroke={[
                          "#2779F5", "#02C23E", "#EFAE3C", "#8BB8A3",
                          "#C55B73", "#4D4E8E", "#FF4033", "#646C79",
                          "#7209B7", "#06D6A0", "#FFD166"
                        ][i % 11]}
                      />
                    ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      <PortfolioCreator
        open={showCreatePortfolio}
        onClose={() => setShowCreatePortfolio(false)}
      />
    </div>
  );
}
