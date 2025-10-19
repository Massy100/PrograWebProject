'use client';

import { useState } from 'react';
import '../styles/PortfolioList.css';
import { useRouter } from 'next/navigation';

interface Portfolio {
  id: number;
  name: string;
  total_invested: number;
  current_value: number;
}

interface PortfolioListProps {
  portfolios: Portfolio[];
}

export default function PortfolioList({ portfolios }: PortfolioListProps) {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const itemsPerPage = 9;

  const startIndex = page * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = portfolios.slice(startIndex, endIndex);

  const handleNext = () => {
    if (endIndex < portfolios.length) setPage(page + 1);
  };

  const handlePrev = () => {
    if (page > 0) setPage(page - 1);
  };

  const openPortfolio = (portfolio: Portfolio) => {
    sessionStorage.setItem("selectedPortfolio", JSON.stringify(portfolio));

    router.push(`/portfolio/${portfolio.id}`);
  };

  return (
    <div className="div-portfolio-list">
      <h2 className="portfolio-list-title">All Portfolios</h2>

      <div className="portfolio-list-grid">
        {currentItems.map((p) => {
          const ratio = p.current_value / p.total_invested;
          const gain = p.current_value - p.total_invested;
          const gainPercent = (ratio * 100 - 100).toFixed(1);

          let status = '';
          let color = '';
          let bg = '';

          if (ratio >= 1.1) {
            status = 'Growing';
            color = '#51ae6e';
            bg = '#E3FCF0';
          } else if (ratio >= 0.9) {
            status = 'Stable';
            color = 'rgba(235, 214, 124, 1)';
            bg = '#FEF2DC';
          } else {
            status = 'Decreasing';
            color = '#ff4033';
            bg = '#FEECEC';
          }

          return (
            <div
              key={p.id}
              className="portfolio-card-item"
              onClick={() => openPortfolio(p)}
            >
              <div className="portfolio-card-header">
                <h3>{p.name}</h3>
                <span style={{ color }} className="portfolio-status">
                  {status}
                </span>
              </div>

              <div className="portfolio-card-body">
                <p>
                  <strong>Invested:</strong> ${p.total_invested.toLocaleString()}
                </p>
                <p>
                  <strong>Current:</strong> ${p.current_value.toLocaleString()}
                </p>
              </div>

              <div className="progress-container" style={{ backgroundColor: bg }}>
                <div
                  className={`progress-bar ${
                    ratio >= 1.1
                      ? 'growing'
                      : ratio >= 0.9
                      ? 'stable'
                      : 'decreasing'
                  }`}
                  style={{ width: `${Math.min(ratio * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="portfolio-list-buttons">
        {page > 0 && (
          <button onClick={handlePrev} className="showMoreBtn">
            ← Prev
          </button>
        )}
        {endIndex < portfolios.length && (
          <button onClick={handleNext} className="showMoreBtn">
            Next →
          </button>
        )}
      </div>
    </div>
  );
}
