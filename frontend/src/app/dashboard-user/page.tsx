'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth0 } from '@auth0/auth0-react';
import StocksRecommendationsTable, { StockItem } from '@/components/stocksTable';
import PopularStocksCard, { PopularStock } from '@/components/popularCardStocks';
import TransactionsTable from '@/components/tableTrasactions';
import './dashboardUser.css';

export default function DashboardUser() {
  const router = useRouter();
  const { getAccessTokenSilently } = useAuth0();

  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [popularStocks, setPopularStocks] = useState<PopularStock[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [clientId, setClientId] = useState<number | null>(null);
  const [userName, setUserName] = useState<string>(''); 
  const [loading, setLoading] = useState(true);

  const fetchClientId = async () => {
    try {
      const token = await getAccessTokenSilently();
      const currentUser = JSON.parse(localStorage.getItem('auth') || '{}');
      if (!currentUser?.id) {
        console.warn('⚠️ User not found in localStorage');
        return null;
      }

      const res = await fetch(`http://localhost:8000/api/users/${currentUser.id}/`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error(`Failed to fetch user ${currentUser.id}`);

      const userData = await res.json();
      const id = userData.client_profile?.id;
      if (id) setClientId(id);

      const fullName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
      setUserName(fullName || userData.username || 'User');

      return id;
    } catch (error) {
      console.error('Error fetching client id:', error);
      return null;
    }
  };

  const fetchActiveStocks = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:8000/api/stocks/active/');
      if (!res.ok) throw new Error('Failed to fetch active stocks');
      const data = await res.json();

      const parsed: StockItem[] = data.map((s: any) => {
        const variation = s.variation ?? 0;
        let recommendation = 'HOLD';
        if (variation > 5) recommendation = 'STRONG BUY';
        else if (variation > 2) recommendation = 'BUY';
        else if (variation < -5) recommendation = 'STRONG SELL';
        else if (variation < -2) recommendation = 'SELL';

        return {
          symbol: s.symbol,
          name: s.name || s.symbol,
          currentPrice: s.last_price ?? 0,
          changePct: variation,
          last30d: [],
          targetPrice: s.last_price ?? 0,
          recommendation,
        };
      });

      setStocks(parsed);
      setPopularStocks(parsed.slice(0, 7).map((s) => ({
        symbol: s.symbol,
        name: s.name,
        price: s.currentPrice,
        changePct: s.changePct,
      })));
    } catch (error) {
      console.error('Error fetching active stocks:', error);
      setStocks(getDemoStocks());
      setPopularStocks(getDemoStocks().slice(0, 7).map((s) => ({
        symbol: s.symbol,
        name: s.name,
        price: s.currentPrice,
        changePct: s.changePct,
      })));
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTransactions = async (client_id: number) => {
    try {
      const token = await getAccessTokenSilently();
      const res = await fetch(
        `http://localhost:8000/api/transactions/user/latest/?client_id=${client_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error('Failed to fetch user transactions');
      const data = await res.json();

      const formattedTx = data.map((tx: any) => {
        const firstDetail = tx.details?.[0] || {};
        return {
          transaction_type: tx.transaction_type || 'buy',
          stock: firstDetail.stock?.symbol || firstDetail.stock || 'N/A',
          code: tx.code || `TX-${tx.id}`,
          total_amount: tx.total_amount,
          created_at: new Date(tx.created_at),
          is_active: true,
          quantity: firstDetail.quantity || 0,
          unit_price: firstDetail.unit_price || 0,
        };
      });

      setTransactions(formattedTx.slice(0, 5));
    } catch (error) {
      console.error('Error fetching user transactions:', error);
      setTransactions(last5Tx);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchActiveStocks();
      const id = await fetchClientId();
      if (id) await fetchUserTransactions(id);
    };

    init();
    const interval = setInterval(fetchActiveStocks, 30000);
    return () => clearInterval(interval);
  }, []);

  const getDemoStocks = (): StockItem[] => [
    { symbol: 'NIO', name: 'Nio Inc.-ADR', currentPrice: 6.04, changePct: -0.48, last30d: [9,8,7,6.5,6.7,6.6], targetPrice: 61.75, recommendation: 'STRONG BUY' },
    { symbol: 'AAPL', name: 'Apple Inc', currentPrice: 262.82, changePct: 1.25, last30d: [250,255,260,258,262], targetPrice: 280.00, recommendation: 'BUY' },
    { symbol: 'MSFT', name: 'Microsoft', currentPrice: 523.61, changePct: 0.59, last30d: [510,515,520,518,523], targetPrice: 540.00, recommendation: 'BUY' },
    { symbol: 'TSLA', name: 'Tesla Inc', currentPrice: 245.50, changePct: -2.15, last30d: [260,255,250,248,245], targetPrice: 270.00, recommendation: 'HOLD' },
  ];

  const last5Tx = [
    { transaction_type: 'buy', stock: 'AAPL', code: 'TX-1001', total_amount: 1500, created_at: new Date(), is_active: true, quantity: 10, unit_price: 150 },
    { transaction_type: 'sell', stock: 'TSLA', code: 'TX-1002', total_amount: 900, created_at: new Date(Date.now() - 86400000), is_active: false, quantity: 3, unit_price: 300 },
    { transaction_type: 'buy', stock: 'MSFT', code: 'TX-1003', total_amount: 1200, created_at: new Date(Date.now() - 2 * 86400000), is_active: true, quantity: 6, unit_price: 200 },
    { transaction_type: 'sell', stock: 'NVDA', code: 'TX-1004', total_amount: 750, created_at: new Date(Date.now() - 3 * 86400000), is_active: true, quantity: 1, unit_price: 750 },
    { transaction_type: 'buy', stock: 'AMZN', code: 'TX-1005', total_amount: 480, created_at: new Date(Date.now() - 4 * 86400000), is_active: true, quantity: 3, unit_price: 160 },
  ];

  return (
    <main className="landingPageUser">
      <section className="div-initial">
        <div className="info">
          <h1 className="home-title">
            {loading ? 'Loading...' : `Welcome back, ${userName}!`}
          </h1>
          <p className="home-text">
            {loading
              ? 'Loading market data...'
              : 'Here are your latest market updates and portfolio insights.'}
          </p>
          <a href="/stocks" className="see-more-btn">Explore Stocks</a>
        </div>

        <div className="stocks-card">
          <PopularStocksCard
            items={popularStocks.length > 0 ? popularStocks : getDemoStocks().slice(0, 7).map((s) => ({
              symbol: s.symbol,
              name: s.name,
              price: s.currentPrice,
              changePct: s.changePct,
            }))}
            loading={loading}
          />
        </div>
      </section>

      <div className="div-more-info-dashboard-user">
        <div className="div-last-purchase-sale">
          <h3>Your Last 5 Transactions</h3>
          <TransactionsTable rows={transactions.length > 0 ? transactions : last5Tx} />
        </div>

        <StocksRecommendationsTable
          rows={stocks.length > 0 ? stocks : getDemoStocks()}
          loading={loading}
        />
      </div>
    </main>
  );
}
