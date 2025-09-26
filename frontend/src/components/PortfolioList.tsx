'use client';

import { useState } from 'react';
import FolderCard from './portfolioAccesePS';
import '../styles/PortfolioList.css';
import { useRouter } from 'next/navigation';

export default function PortfolioList() {

  const router = useRouter();

  const portfolios = [
  { id: 1, folderName: 'Portafolio 1', totalInversion: 5000, currentValue: 5800 },
  { id: 2, folderName: 'Portafolio 2', totalInversion: 3000, currentValue: 2500 },
  { id: 3, folderName: 'Portafolio 3', totalInversion: 10000, currentValue: 200 },
  { id: 4, folderName: 'Portafolio 4', totalInversion: 1500, currentValue: 1500 },
  { id: 5, folderName: 'Portafolio 5', totalInversion: 4000, currentValue: 4200 },
  { id: 6, folderName: 'Portafolio 6', totalInversion: 8000, currentValue: 7500 },
  { id: 7, folderName: 'Portafolio 7', totalInversion: 2000, currentValue: 2100 },
  { id: 8, folderName: 'Portafolio 8', totalInversion: 6000, currentValue: 7000 },
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

  // Función que se ejecuta al hacer click en un portafolio
  const openPortfolio = (id: number) => {
    router.push(`/portfolio/${id}`);
  };


  return (
    <div className="div-portfolio-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {currentItems.map((p, index) => (
        <FolderCard
        key={startIndex + index}
        folderName={p.folderName}
        totalInversion={p.totalInversion}
        currentValue={p.currentValue}
        onClick={() => openPortfolio(index + 1)} // ejemplo: id simulado
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
