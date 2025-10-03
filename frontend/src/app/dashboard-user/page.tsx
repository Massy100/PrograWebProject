'use client';
import { useRouter } from 'next/navigation';
import StocksRecommendationsTable, { StockItem } from '@/components/stocksTable';
import PopularStocksCard, { PopularStock } from '@/components/popularCardStocks';
import './dashboardUser.css';
import TransactionsTable from '@/components/tableTrasactions';

export default function DashboardUser() {
  const router = useRouter();


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

  return (
    <main className="landingPageUser">
      <section className="div-initial">
        <div className="info">
          <h1 className="home-title">Welcome User!</h1>
          <p className="home-text">
            Here’s the current market landscape and a few opportunities for this week.
            Review, compare, and discover new stocks to expand your portfolio.
          </p>
          <a href="/stocks" className="see-more-btn">See More</a>
        </div>

        <div className="stocks-card">
          <PopularStocksCard items={popularItems} />
        </div>
      </section>

      <div className="div-more-info-dashboard-user">
        <div className="div-last-purchase-sale">
          <h3>See your last 5 purchases and sales.</h3>
          <TransactionsTable rows={last5Tx} />
        </div>

        <StocksRecommendationsTable rows={demoRows} />
      </div>
    </main>
  );
}
