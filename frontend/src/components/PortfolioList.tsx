'use client';

import { useState } from 'react';
import FolderCard from './portfolioAccesePS';
import '../styles/PortfolioList.css';

export default function PortfolioList() {
  const portfolios = [
    { folderName: 'Portafolio 1', href: '#', totalInversion: 5000, currentValue: 5800 },
    { folderName: 'Portafolio 2', href: '#', totalInversion: 3000, currentValue: 2500 },
    { folderName: 'Portafolio 3', href: '#', totalInversion: 10000, currentValue: 200 },
    { folderName: 'Portafolio 4', href: '#', totalInversion: 1500, currentValue: 1500 },
    { folderName: 'Portafolio 5', href: '#', totalInversion: 4000, currentValue: 4200 },
    { folderName: 'Portafolio 6', href: '#', totalInversion: 8000, currentValue: 7500 },
    { folderName: 'Portafolio 7', href: '#', totalInversion: 2000, currentValue: 2100 },
    { folderName: 'Portafolio 8', href: '#', totalInversion: 6000, currentValue: 7000 },
  ];

  const [page, setPage] = useState(0); // empieza en la página 0
  const itemsPerPage = 4;

  const startIndex = page * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = portfolios.slice(startIndex, endIndex);

  const handleNext = () => {
    if (endIndex < portfolios.length) {
      setPage(page + 1);
    }
  };

  const handlePrev = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  return (
    <div className="div-portfolio-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {currentItems.map((p, index) => (
        <FolderCard
          key={startIndex + index}
          folderName={p.folderName}
          href={p.href}
          totalInversion={p.totalInversion}
          currentValue={p.currentValue}
        />
      ))}

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
  );
}
