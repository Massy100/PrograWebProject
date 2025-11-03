'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import './dashboardAdmin.css';
import TableUserAdministration from '@/components/TableUserAdministration';
import AddStocksTable, { StockItem } from '@/components/AddStocksTable';
import StockManager from '@/components/StockApproval';
import SidebarOptions from '@/components/navAdmin';
import { useAuth0 } from '@auth0/auth0-react';

export default function DashboardAdmin() {
  const router = useRouter();
  const { getAccessTokenSilently } = useAuth0();

  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);

  const generateFakeLast30Days = (basePrice: number): number[] => {
    const result: number[] = [];
    let price = basePrice || 100;
    for (let i = 0; i < 30; i++) {
      const variation = (Math.random() - 0.5) * 4; 
      price = Math.max(5, price + variation); 
      result.push(Number(price.toFixed(2)));
    }
    return result;
  };

  const fetchActiveStocks = async () => {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently();

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stocks/active/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Error fetching active stocks');

      const data = await res.json();

      const parsed: StockItem[] = data.map((s: any) => {
        const price = parseFloat(s.last_price ?? 0);
        const change = parseFloat(s.variation ?? 0);
        const target = price * (1 + Math.random() * 0.1); 

        return {
          symbol: s.symbol,
          name: s.name || s.symbol,
          currentPrice: Number(price.toFixed(2)),
          changePct: Number(change.toFixed(2)),
          last30d: generateFakeLast30Days(price),
          targetPrice: Number(target.toFixed(2)),
          recommendation:
            change > 3
              ? 'STRONG BUY'
              : change > 1
              ? 'BUY'
              : change < -3
              ? 'SELL'
              : 'HOLD',
        };
      });

      setStocks(parsed);
    } catch (error) {
      console.error('❌ Error loading stocks:', error);

      setStocks([
        {
          symbol: 'AAPL',
          name: 'Apple Inc.',
          currentPrice: 175.23,
          changePct: 1.25,
          last30d: generateFakeLast30Days(175),
          targetPrice: 190.0,
          recommendation: 'BUY',
        },
        {
          symbol: 'TSLA',
          name: 'Tesla Inc.',
          currentPrice: 250.5,
          changePct: -2.13,
          last30d: generateFakeLast30Days(250),
          targetPrice: 300.0,
          recommendation: 'HOLD',
        },
        {
          symbol: 'NVDA',
          name: 'NVIDIA Corp.',
          currentPrice: 895.6,
          changePct: 3.05,
          last30d: generateFakeLast30Days(895),
          targetPrice: 950.0,
          recommendation: 'STRONG BUY',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveStocks();
  }, []);

  return (
    <main className="dashboard-admin-page">
      <SidebarOptions />

      <section className="dashboard-content">
        <header className="dashboard-header">
          <h1 className="dashboard-title">Welcome, Admin</h1>
          <p className="dashboard-subtitle">
            Quick overview of users and stocks currently in the system.
          </p>
        </header>
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Users with System Access</h2>
            <button
              className="see-all-btn"
              onClick={() => router.push('/user-administration')}
            >
              See all
            </button>
          </div>

          <div className="section-content limited-view special1">
            <TableUserAdministration />
          </div>
        </div>
        
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Stocks Pending Approval</h2>
            <button
              className="see-all-btn"
              onClick={() => router.push('/stock-approval')}
            >
              Manage all
            </button>
          </div>

          <div className="section-content limited-view">
            <StockManager />
          </div>
        </div>
      </section>
    </main>
  );
}
