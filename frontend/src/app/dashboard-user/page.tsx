'use client';
import { useRouter } from 'next/navigation';
import StocksRecommendationsTable, { StockItem } from '@/components/stocksTable';
import PopularStocksCard, { PopularStock } from '@/components/popularCardStocks';
import './dashboardUser.css';
import TransactionsTable from '@/components/tableTrasactions';
import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';

export default function DashboardUser() {
  const router = useRouter();
  const { getAccessTokenSilently } = useAuth0();

  // Estados para datos reales
  const [realStocks, setRealStocks] = useState<StockItem[]>([]);
  const [popularStocks, setPopularStocks] = useState<PopularStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);

  // Función para obtener datos reales de stocks
  const fetchRealStockData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/alpha-vantage/stocks/real-data/');
      
      if (!response.ok) {
        throw new Error('Failed to fetch stock data');
      }
      
      const data = await response.json();
      
      // Convertir datos de la API al formato del frontend
      const formattedStocks: StockItem[] = data.data.map((stockData: any) => {
        const variation = parseFloat(stockData.variation) || 0;
        
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
      
      // Crear popular stocks
      const popularItems: PopularStock[] = formattedStocks.slice(0, 7).map(stock => ({
        symbol: stock.symbol,
        name: stock.name,
        price: stock.currentPrice,
        changePct: stock.changePct,
      }));
      
      setPopularStocks(popularItems);
      
    } catch (error) {
      console.error('Error fetching real stock data:', error);
      // Fallback a datos de demo
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

  // Función para obtener transacciones reales del usuario
  const fetchUserTransactions = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch('http://localhost:8000/api/transactions/user/latest/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const transactionsData = await response.json();
        setTransactions(transactionsData.slice(0, 5)); // Últimas 5 transacciones
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      // Mantener transacciones de demo si falla
      setTransactions(last5Tx);
    }
  };

  // Datos de demo como fallback
  const getDemoStocks = (): StockItem[] => [
    { symbol: 'NIO',  name: 'Nio Inc.-ADR', currentPrice: 6.04,  changePct: -0.48, last30d: [9,8,7,6.5,6.7,6.6], targetPrice: 61.75,  recommendation: 'STRONG BUY' },
    { symbol: 'BP.L', name: 'BP',           currentPrice: 423.61,changePct: 0.31,  last30d: [4,5.2,4.7,4.5,4.6],  targetPrice: 5.45,   recommendation: 'BUY' },
    { symbol: 'PEN',  name: 'Penumbra Inc', currentPrice: 275.87,changePct: 1.63,  last30d: [2,3,4,4.5,3.8],      targetPrice: 299.00, recommendation: 'HOLD' },
    { symbol: 'MPWR', name: 'Monolithic Power Systems', currentPrice: 838.89,changePct: -1.73, last30d: [9,8,7.5,7.8,7.3], targetPrice: 533.75, recommendation: 'SELL' },
  ];

  // Transacciones de demo como fallback
  const last5Tx = [
    {
      transaction_type: 'buy' as const,
      stock: 'AAPL',
      code: 'TX-1001',
      total_amount: 1500,
      created_at: new Date(),
      is_active: true,
      quantity: 10,
      unit_price: 150,
    },
    {
      transaction_type: 'sell' as const,
      stock: 'TSLA',
      code: 'TX-1002',
      total_amount: 900,
      created_at: new Date(Date.now() - 86400000), 
      is_active: false,
      quantity: 3,
      unit_price: 300,
    },
    {
      transaction_type: 'buy' as const,
      stock: 'MSFT',
      code: 'TX-1003',
      total_amount: 1200,
      created_at: new Date(Date.now() - 2 * 86400000),
      is_active: true,
      quantity: 6,
      unit_price: 200,
    },
    {
      transaction_type: 'sell' as const,
      stock: 'NVDA',
      code: 'TX-1004',
      total_amount: 750,
      created_at: new Date(Date.now() - 3 * 86400000),
      is_active: true,
      quantity: 1,
      unit_price: 750,
    },
    {
      transaction_type: 'buy' as const,
      stock: 'AMZN',
      code: 'TX-1005',
      total_amount: 480,
      created_at: new Date(Date.now() - 4 * 86400000),
      is_active: true,
      quantity: 3,
      unit_price: 160,
    },
  ];

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchRealStockData();
    fetchUserTransactions();
    
    // Opcional: Actualizar datos cada 30 segundos
    const interval = setInterval(fetchRealStockData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="landingPageUser">
      <section className="div-initial">
        <div className="info">
          <h1 className="home-title">Welcome User!</h1>
          <p className="home-text">
            {loading ? 'Loading real-time market data...' : 'Here\'s the current market landscape and a few opportunities for this week. Review, compare, and discover new stocks to expand your portfolio.'}
          </p>
          <a href="/stocks" className="see-more-btn">See More</a>
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

      <div className="div-more-info-dashboard-user">
        <div className="div-last-purchase-sale">
          <h3>See your last 5 purchases and sales.</h3>
          <TransactionsTable rows={transactions.length > 0 ? transactions : last5Tx} />
        </div>

        <StocksRecommendationsTable 
          rows={realStocks.length > 0 ? realStocks : getDemoStocks()} 
          loading={loading}
        />
      </div>
    </main>
  );
}