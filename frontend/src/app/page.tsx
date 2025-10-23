'use client';

import { useEffect } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth0 } from '@auth0/auth0-react';
import StocksRecommendationsTable, { StockItem } from '@/components/stocksTable';
import PopularStocksCard, { PopularStock } from '@/components/popularCardStocks';
import CompleteUserRegister from '@/components/CompleteUserRegister';
import '@/app/page.css';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, loginWithRedirect, logout } = useAuth0();
  const [userVerified, setUserVerified] = useState(false);
  const [completeRegisterOpen, setCompleteRegisterOpen] = useState(false);

  const demoRows: StockItem[] = [
    { symbol: 'NIO',  name: 'Nio Inc.-ADR', currentPrice: 6.04,  changePct: -0.48, last30d: [9,8,7,6.5,6.7,6.6], targetPrice: 61.75,  recommendation: 'STRONG BUY' },
    { symbol: 'BP.L', name: 'BP',           currentPrice: 423.61,changePct: 0.31,  last30d: [4,5.2,4.7,4.5,4.6],  targetPrice: 5.45,   recommendation: 'BUY' },
    { symbol: 'PEN',  name: 'Penumbra Inc', currentPrice: 275.87,changePct: 1.63,  last30d: [2,3,4,4.5,3.8],      targetPrice: 299.00, recommendation: 'HOLD' },
    { symbol: 'MPWR', name: 'Monolithic Power Systems', currentPrice: 838.89,changePct: -1.73, last30d: [9,8,7.5,7.8,7.3], targetPrice: 533.75, recommendation: 'SELL' },
  ];

  const popularItems: PopularStock[] = demoRows.slice(0, 7).map(r => ({
    symbol: r.symbol,
    name: r.name,
    price: r.currentPrice,
    changePct: r.changePct,
  }));

  useEffect(() => {
    const jsonAuth = localStorage.getItem("auth");
    if (isAuthenticated && jsonAuth) {
      const auth = JSON.parse(jsonAuth);
      setUserVerified(auth.verified);
      if (auth.role === 'admin') {
        router.push('/dashboard-admin')
      } else if (auth.role === 'client' && userVerified) {
        router.push('/dashboard-user');
      } 
    }
  });

  return (
    <main className="landingPage">
      {completeRegisterOpen && (
        <CompleteUserRegister onClose={() => setCompleteRegisterOpen(false)} />
      )}

      <section className="div-initial">
        <div className="info">
          <h1 className="home-title">Welcome!</h1>
          <p className="home-text">
            Here’s the market pulse and this week’s recommended stocks.
          </p>

          {/* If there is no session, show login button */}
          {!isAuthenticated && (
            <button
              type="button"
              className="see-more-btn"
              onClick={() => loginWithRedirect()}
            >
              Login
            </button>
          )}

          {isAuthenticated && !userVerified && (
            <div className='log-buttons'>
              <button
                type="button"
                className="see-more-btn"
                onClick={() => setCompleteRegisterOpen(true)}
              >
                Complete registration
              </button>
                <button
                type="button"
                className="see-more-btn"
                onClick={() => {logout(); localStorage.clear()}}
              >
                Logout
              </button>
            </div>
          )}
        </div>

        <div className="stocks-card">
          <PopularStocksCard items={popularItems} />
        </div>
      </section>

      <StocksRecommendationsTable rows={demoRows} />
    </main>
  );
}
