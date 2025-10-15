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

export default function PortfolioList() {
  const router = useRouter();

  const portfolios: Portfolio[] = [
    { id: 1, name: 'Portfolio 1', total_invested: 5000, current_value: 5800 },
    { id: 2, name: 'Portfolio 2', total_invested: 3000, current_value: 2500 },
    { id: 3, name: 'Portfolio 3', total_invested: 10000, current_value: 200 },
    { id: 4, name: 'Portfolio 4', total_invested: 1500, current_value: 1500 },
    { id: 5, name: 'Portfolio 5', total_invested: 4000, current_value: 4200 },
    { id: 6, name: 'Portfolio 6', total_invested: 8000, current_value: 7500 },
    { id: 7, name: 'Portfolio 7', total_invested: 2000, current_value: 2100 },
    { id: 8, name: 'Portfolio 8', total_invested: 6000, current_value: 7000 },
  ];

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

  const openPortfolio = (id: number) => {
    router.push(`/portfolio/${id}`);
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
            color = '#8bb8a3';
            bg = '#E3FCF0';
          } else if (ratio >= 0.9) {
            status = 'Stable';
            color = 'rgba(235, 214, 124, 1)';
            bg = '#FEF2DC';
          } else {
            status = 'Decreasing';
            color = '#e07e7e';
            bg = '#FEECEC';
          }

          return (
            <div
              key={p.id}
              className="portfolio-card-item"
              onClick={() => openPortfolio(p.id)}
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
