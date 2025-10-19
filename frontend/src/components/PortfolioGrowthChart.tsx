"use client";

import React, { useState } from "react";
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
  growthData: PortfolioGrowth[];
}

export default function PortfolioGrowthChart({ portfolios, growthData }: Props) {
  const router = useRouter();
  const [isChartOpen, setIsChartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [search, setSearch] = useState("");

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

  return (
    <div className="growth-chart-container">
      <div className="chart-controls">
        <button
          className={`toggle-chart-btn ${isChartOpen ? "open" : ""}`}
          onClick={() => setIsChartOpen(!isChartOpen)}
        >
          {isChartOpen ? "✕" : <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h1v16H0V0zm1 15h15v1H1v-1z"></path><path fill-rule="evenodd" d="M14.39 4.312L10.041 9.75 7 6.707l-3.646 3.647-.708-.708L7 5.293 9.959 8.25l3.65-4.563.781.624z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M10 3.5a.5.5 0 01.5-.5h4a.5.5 0 01.5.5v4a.5.5 0 01-1 0V4h-3.5a.5.5 0 01-.5-.5z" clip-rule="evenodd"></path></svg>}
        </button>

        <button
          className="search-toggle-btn"
          onClick={() => setIsSearchOpen(!isSearchOpen)}
        >
          <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M10,18c1.846,0,3.543-0.635,4.897-1.688l4.396,4.396l1.414-1.414l-4.396-4.396C17.365,13.543,18,11.846,18,10 c0-4.411-3.589-8-8-8s-8,3.589-8,8S5.589,18,10,18z M10,4c3.309,0,6,2.691,6,6s-2.691,6-6,6s-6-2.691-6-6S6.691,4,10,4z"></path><path d="M11.412,8.586C11.791,8.966,12,9.468,12,10h2c0-1.065-0.416-2.069-1.174-2.828c-1.514-1.512-4.139-1.512-5.652,0 l1.412,1.416C9.346,7.83,10.656,7.832,11.412,8.586z"></path></svg>    
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

          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={growthData}>
                <XAxis dataKey="month" stroke="#646C79" />
                <YAxis stroke="#646C79" />
                <Tooltip />
                <Legend />
                {Object.keys(growthData[0])
                  .filter((k) => k !== "month")
                  .map((key, i) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      strokeWidth={2}
                      stroke={
                        [
                            "#2779F5", 
                            "#02C23E", 
                            "#EFAE3C", 
                            "#8BB8A3", 
                            "#C55B73", 
                            "#4D4E8E", 
                            "#FF4033", 
                            "#646C79", 
                            "#021631", 
                            "#DFF1FB", 
                            "#FEF2DC", 
                            "#E3FCF0", 
                            "#51AE6E", 
                            "#F77F00", 
                            "#7209B7", 
                            "#4361EE", 
                            "#3A0CA3", 
                            "#F72585", 
                            "#06D6A0", 
                            "#FFD166", 
                        ][i % 20]
                    }
                    />
                  ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

