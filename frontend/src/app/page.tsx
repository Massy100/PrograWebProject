'use client';

import { useEffect } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth0 } from '@auth0/auth0-react';
import SearchResults from '@/components/searchResults';
import OptionsUser from '@/components/navUsers';    
import SidebarOptions from '@/components/navAdmin';   
import CompleteUserRegister from '@/components/CompleteUserRegister';
import Wallet from '@/components/wallet';
import StocksRecommendationsTable, { StockItem } from '@/components/stocksTable';
import PopularStocksCard, { PopularStock } from '@/components/popularCardStocks';
import '@/app/page.css';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, loginWithRedirect, logout } = useAuth0();
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

  const [walletOpen, setWalletOpen] = useState(false);
  const { user, getAccessTokenSilently,  } = useAuth0();
  const [verifiedUser, setVerifiedUser] = useState(false);
  const [completedUser, setCompletedUser] = useState(false);
  const [role, setRole] = useState<"admin" | "client">("client");
  const [load, setLoad] = useState(true);

  const callApi = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch("http://localhost:8000/api/users/sync/", {
        method: "POST",
        body: JSON.stringify(user),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const data = await response.json();
      if (!data) {
        throw new Error("No se obtuvo respuesta del backend.");
      }
      const dbUser = data.user;
      localStorage.setItem("auth", JSON.stringify({id: dbUser.id, verified: dbUser.verified, role: dbUser.user_type, completed: dbUser.is_completed}));
      
      setVerifiedUser(dbUser.verified);
      setCompletedUser(dbUser.is_completed);
      setRole(dbUser.user_type);
      setLoad(false);


    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (user) {
        callApi();
    }
  }, [user, isAuthenticated]);


  return (
    <>
      <SearchResults
        headerProps={{ marketOpen: true, totalAmount: 100 }}
        title="Resultados de la búsqueda"
      />

      {role === 'client' && verifiedUser && (
        <OptionsUser onOpenWallet={() => setWalletOpen(true)} />
      )}

      {role === 'admin' && <SidebarOptions />}

      <Wallet open={walletOpen} onClose={() => setWalletOpen(false)} />
      {completeRegisterOpen && (
        <CompleteUserRegister 
        onClose={() => setCompleteRegisterOpen(false)} 
        onSuccess={() => setCompletedUser(true)}/>
      )}
      
    <main className="landingPage">
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

          <div className='log-buttons'>
          {isAuthenticated && !completedUser && !load &&(
              <button
                type="button"
                className="see-more-btn"
                onClick={() => setCompleteRegisterOpen(true)}
              >
                Complete registration
              </button>
                
          )}

          {isAuthenticated && completedUser && !verifiedUser && !load && (
            <p>Your access request was successfully sent to the administration team.
               We will send you a confirmation email as soon as it gets reviewed.</p>
                
          )}

          {isAuthenticated && !verifiedUser && !load && (
            <button
                type="button"
                className="see-more-btn"
                onClick={() => {logout(); localStorage.clear()}}
              >
                Logout
              </button>
          )}
            </div>
        </div>

        <div className="stocks-card">
          <PopularStocksCard items={popularItems} />
        </div>
      </section>

      <StocksRecommendationsTable rows={demoRows} />
    </main>
    </>
  );
}
