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

  // REEMPLAZADO: Datos en tiempo real desde la API
  const [realStocks, setRealStocks] = useState<StockItem[]>([]);
  const [popularStocks, setPopularStocks] = useState<PopularStock[]>([]);
  const [loading, setLoading] = useState(true);

  // NUEVO: Función para obtener datos reales del scheduler
  const fetchRealStockData = async () => {
    try {
      setLoading(true);
      // CAMBIO: Usar stocks aprobados en lugar de todos los de Alpha Vantage
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/alpha-vantage/stocks/approved/');
      
      if (!response.ok) {
        throw new Error('Failed to fetch stock data');
      }
      
      const data = await response.json();
      
      // Convertir datos de la API al formato de tu frontend
      const formattedStocks: StockItem[] = data.data.map((stockData: any) => {
        // Convertir variation de string a número
        const variation = parseFloat(stockData.variation) || 0;
        
        // Calcular recomendación basada en la variación
        let recommendation = 'HOLD';
        if (variation > 5) recommendation = 'STRONG BUY';
        else if (variation > 2) recommendation = 'BUY';
        else if (variation < -5) recommendation = 'STRONG SELL';
        else if (variation < -2) recommendation = 'SELL';

        return {
          symbol: stockData.symbol,
          name: stockData.name || stockData.symbol,
          currentPrice: parseFloat(stockData.last_price) || 0,
          changePct: variation,
          last30d: [],
          targetPrice: 0,
          recommendation: recommendation
        };
      });

      setRealStocks(formattedStocks);
      
      // Crear popular stocks (primeros 7)
      const popularItems: PopularStock[] = formattedStocks.slice(0, 7).map(stock => ({
        symbol: stock.symbol,
        name: stock.name,
        price: stock.currentPrice,
        changePct: stock.changePct,
      }));
      
      setPopularStocks(popularItems);
      
    } catch (error) {
      console.error('Error fetching real stock data:', error);
      // FALLBACK: Usar datos de demo si la API falla
      setRealStocks(getDemoStocks());
      setPopularStocks(getDemoStocks().slice(0, 7).map(stock => ({
        symbol: stock.symbol,
        name: stock.name,
        price: stock.currentPrice,
        changePct: stock.changePct,
      })));
    } finally {
      setLoading(false);
    }
  };

  // Datos de demo como fallback
  const getDemoStocks = (): StockItem[] => [
    { symbol: 'NIO',  name: 'Nio Inc.-ADR', currentPrice: 6.04,  changePct: -0.48, last30d: [9,8,7,6.5,6.7,6.6], targetPrice: 61.75,  recommendation: 'STRONG BUY' },
    { symbol: 'BP', name: 'BP PLC', currentPrice: 423.61, changePct: 0.31, last30d: [4,5.2,4.7,4.5,4.6], targetPrice: 5.45, recommendation: 'BUY' },
    { symbol: 'PEN',  name: 'Penumbra Inc', currentPrice: 275.87, changePct: 1.63, last30d: [2,3,4,4.5,3.8], targetPrice: 299.00, recommendation: 'HOLD' },
    { symbol: 'MPWR', name: 'Monolithic Power Systems', currentPrice: 838.89, changePct: -1.73, last30d: [9,8,7.5,7.8,7.3], targetPrice: 533.75, recommendation: 'SELL' },
  ];

  // NUEVO: Cargar datos reales al montar el componente
  useEffect(() => {
    fetchRealStockData();
    
    // OPCIONAL: Actualizar cada 30 segundos para datos más frescos
    const interval = setInterval(fetchRealStockData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const [walletOpen, setWalletOpen] = useState(false);
  const { user, getAccessTokenSilently } = useAuth0();
  const [verifiedUser, setVerifiedUser] = useState(false);
  const [completedUser, setCompletedUser] = useState(false);
  const [role, setRole] = useState<"admin" | "client">("client");
  const [load, setLoad] = useState(true);

  const callApi = async () => {
    try {
      const token = await getAccessTokenSilently();
      console.log("Token obtenido:", token);
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "/users/sync/", {
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
      console.log("Usuario sincronizado:", dbUser);
      localStorage.setItem("auth", JSON.stringify({
        id: dbUser.id, 
        verified: dbUser.verified, 
        role: dbUser.user_type, 
        completed: dbUser.is_completed,
        name: dbUser.full_name,
        client_id: dbUser.client_profile?.id || null
      }));

      document.cookie = `auth=${encodeURIComponent(JSON.stringify({
      role: dbUser.user_type,
      verified: dbUser.verified,
      completed: dbUser.is_completed
    }))}; path=/; max-age=86400; samesite=lax`;

      
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
          onSuccess={() => setCompletedUser(true)}
        />
      )}
      
      <main className="landingPage">
        <section className="div-initial">
          <div className="info">
            <h1 className="home-title">Welcome!</h1>
            <p className="home-text">
              {loading ? 'Loading real-time market data...' : 'Real-time market pulse and recommended stocks.'}
            </p>

            {/* Mostrar estado de carga */}
            {loading && (
              <div className="loading-indicator">
                <span>Loading live stock data...</span>
              </div>
            )}

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
            <PopularStocksCard 
              items={popularStocks.length > 0 ? popularStocks : getDemoStocks().slice(0, 7).map(stock => ({
                symbol: stock.symbol,
                name: stock.name,
                price: stock.currentPrice,
                changePct: stock.changePct,
              }))} 
              loading={loading}
            />
          </div>
        </section>

        <StocksRecommendationsTable 
          rows={realStocks.length > 0 ? realStocks : getDemoStocks()} 
          loading={loading}
        />
      </main>
    </>
  );
}