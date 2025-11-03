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

  const generateLastDays = (currentPrice: number, variationPct: number): number[] => {
    const days = 30;
    const data: number[] = [];
    const volatility = Math.abs(variationPct) / 2 + 0.5;
    let price = currentPrice;

    for (let i = days - 1; i >= 0; i--) {
      const randomChange = 1 + (Math.random() - 0.5) * (volatility / 100);
      price = Math.max(price * randomChange, 0.1);
      data.unshift(parseFloat(price.toFixed(2)));
    }
    return data;
  };

  const fetchClientId = async () => {
    try {
      const token = await getAccessTokenSilently();
      const currentUser = JSON.parse(localStorage.getItem('auth') || '{}');
      if (!currentUser?.id) return null;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${currentUser.id}/`, {
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stocks/active/`);
      if (!res.ok) throw new Error('');
      const data = await res.json();

      const parsed: StockItem[] = data.map((s: any) => {
        const variation = parseFloat(s.variation ?? 0);
        const price = parseFloat(s.last_price ?? 0);
        const last30d = generateLastDays(price, variation);

        let recommendation = 'HOLD';
        if (variation > 5) recommendation = 'STRONG BUY';
        else if (variation > 2) recommendation = 'BUY';
        else if (variation < -5) recommendation = 'STRONG SELL';
        else if (variation < -2) recommendation = 'SELL';

        return {
          symbol: s.symbol,
          name: s.name || s.symbol,
          currentPrice: price,
          changePct: variation,
          last30d,
          targetPrice: parseFloat((price * 1.05).toFixed(2)),
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
        `${process.env.NEXT_PUBLIC_API_URL}/transactions/user/latest/?client_id=${client_id}`,
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
      setTransactions([]);
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
    { symbol: 'AAPL', name: 'Apple Inc', currentPrice: 170.23, changePct: 0.83, last30d: generateLastDays(170.23, 0.83), targetPrice: 180.0, recommendation: 'BUY' },
    { symbol: 'MSFT', name: 'Microsoft Corp', currentPrice: 520.45, changePct: 1.25, last30d: generateLastDays(520.45, 1.25), targetPrice: 545.0, recommendation: 'STRONG BUY' },
    { symbol: 'TSLA', name: 'Tesla Inc', currentPrice: 250.75, changePct: -2.05, last30d: generateLastDays(250.75, -2.05), targetPrice: 265.0, recommendation: 'HOLD' },
    { symbol: 'GOOGL', name: 'Alphabet Inc', currentPrice: 180.12, changePct: 0.45, last30d: generateLastDays(180.12, 0.45), targetPrice: 190.0, recommendation: 'BUY' },
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
          {transactions.length > 0 ? (
            <TransactionsTable rows={transactions} />
          ) : (
            <p style={{ color: '#6A6C75', fontSize: '16px', marginTop: '1rem' }}>
              You have no recent transactions yet.
            </p>
          )}
        </div>

        <StocksRecommendationsTable
          rows={stocks.length > 0 ? stocks : getDemoStocks()}
          loading={loading}
        />
      </div>
    </main>
  );
}
