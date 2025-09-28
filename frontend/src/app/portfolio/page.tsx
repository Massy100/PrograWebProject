// src/app/portfolio/page.tsx
'use client';

import Header from '@/components/Header';
import PortfolioList from '@/components/PortfolioList';

export default function Portfolio() {
  return (
    <div>
      <Header isLoggedIn={true} marketOpen={true} onSearch={() => {}} />
      <h1>Todos los portafolios</h1>
      <PortfolioList />
    </div>
  );
}
