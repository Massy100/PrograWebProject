'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import './dashboardAdmin.css';
import TableUserAdministration from '@/components/TableUserAdministration';
import AddStocksTable, { StockItem } from '@/components/AddStocksTable';
import StockManager from '@/components/StockApproval';
import SidebarOptions from '@/components/navAdmin';



export default function DashboardAdmin() {
  const router = useRouter();

  const demoStocks: StockItem[] = [
    { symbol: 'AAPL', name: 'Apple Inc.', currentPrice: 175.23, changePct: 1.25, last30d: [168,170,172,174,175], targetPrice: 190, recommendation: 'BUY' },
    { symbol: 'TSLA', name: 'Tesla Inc.', currentPrice: 250.5, changePct: -2.13, last30d: [260,258,255,253,250], targetPrice: 300, recommendation: 'HOLD' },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', currentPrice: 895.6, changePct: 3.05, last30d: [820,850,870,890,895], targetPrice: 950, recommendation: 'STRONG BUY' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', currentPrice: 145.3, changePct: 0.75, last30d: [138,140,143,145,145.3], targetPrice: 155, recommendation: 'BUY' },
    { symbol: 'META', name: 'Meta Platforms', currentPrice: 320.4, changePct: 1.2, last30d: [310,312,315,318,320], targetPrice: 340, recommendation: 'HOLD' },
    { symbol: 'NFLX', name: 'Netflix Inc.', currentPrice: 420.5, changePct: -0.8, last30d: [430,425,423,422,420], targetPrice: 440, recommendation: 'SELL' },
  ];

  const [stocks, setStocks] = useState<StockItem[]>([]);

  useEffect(() => {
    setStocks(demoStocks);
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
            <h2 className="section-title">Stocks Available to Add</h2>
            <button
              className="see-all-btn"
              onClick={() => router.push('/stocks-administration')}
            >
              See all
            </button>
          </div>

          <div className="section-content special2">
            <AddStocksTable rows={stocks.slice(0, 15)} />
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
