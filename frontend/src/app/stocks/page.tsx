'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import StocksRecommendationsTable, { StockItem } from '@/components/stocksTable';
import PopularStocksCard, { PopularStock } from '@/components/popularCardStocks';
import StockTrends from '@/components/StockTrends';
import DobleStockTable from '@/components/dobleStockTabke';
import StockGraphCarousel from '@/components/StockGraphCarousel';

import "./generalStocks.css";

export default function StocksPage() {
  const router = useRouter();

  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [popularStocks, setPopularStocks] = useState<PopularStock[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActiveStocks = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/api/stocks/active/");
      if (!res.ok) throw new Error("Failed to fetch active stocks");

      const data = await res.json();

      const parsed: StockItem[] = data.map((s: any) => {
        const variation = s.variation ?? 0;
        let recommendation = "HOLD";
        if (variation > 5) recommendation = "STRONG BUY";
        else if (variation > 2) recommendation = "BUY";
        else if (variation < -5) recommendation = "STRONG SELL";
        else if (variation < -2) recommendation = "SELL";

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

      const popular: PopularStock[] = parsed.slice(0, 14).map((s) => ({
        symbol: s.symbol,
        name: s.name,
        price: s.currentPrice,
        changePct: s.changePct,
      }));

      setPopularStocks(popular);
    } catch (error) {
      console.error("Error fetching stocks:", error);
      setStocks(getDemoStocks());
      setPopularStocks(
        getDemoStocks().slice(0, 14).map((s) => ({
          symbol: s.symbol,
          name: s.name,
          price: s.currentPrice,
          changePct: s.changePct,
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveStocks();
    const interval = setInterval(fetchActiveStocks, 30000);
    return () => clearInterval(interval);
  }, []);

  const getDemoStocks = (): StockItem[] => [
    { symbol: 'NIO',  name: 'Nio Inc.-ADR', currentPrice: 6.04, changePct: -0.48, last30d: [9,8,7,6.5,6.7,6.6], targetPrice: 61.75, recommendation: 'STRONG BUY' },
    { symbol: 'AAPL', name: 'Apple Inc', currentPrice: 262.82, changePct: 1.25, last30d: [250,255,260,258,262], targetPrice: 280.00, recommendation: 'BUY' },
    { symbol: 'MSFT', name: 'Microsoft', currentPrice: 523.61, changePct: 0.59, last30d: [510,515,520,518,523], targetPrice: 540.00, recommendation: 'BUY' },
    { symbol: 'TSLA', name: 'Tesla Inc', currentPrice: 245.50, changePct: -2.15, last30d: [260,255,250,248,245], targetPrice: 270.00, recommendation: 'HOLD' },
    { symbol: 'GOOGL', name: 'Alphabet Inc', currentPrice: 175.25, changePct: 0.89, last30d: [170,172,174,173,175], targetPrice: 185.00, recommendation: 'BUY' },
    { symbol: 'AMZN', name: 'Amazon Inc', currentPrice: 178.90, changePct: 1.45, last30d: [175,176,177,178,179], targetPrice: 190.00, recommendation: 'STRONG BUY' },
    { symbol: 'NVDA', name: 'NVIDIA Corp', currentPrice: 112.45, changePct: 3.25, last30d: [105,108,110,111,112], targetPrice: 120.00, recommendation: 'STRONG BUY' },
  ];

  const firstTableStocks = popularStocks.slice(0, 7);
  const secondTableStocks = popularStocks.slice(7, 14);

  return (
    <main className="landingPageUser">
      <p className="subtitle">Investment Opportunities</p>
      <h1 className="title-stocks">Explore Global Markets</h1>

      <div className="div-carrusel">
        <StockTrends loading={loading} />
      </div>

      <div className="div-more-info-dashboard-user">
        <StocksRecommendationsTable 
          rows={stocks.length > 0 ? stocks : getDemoStocks()} 
          loading={loading}
        />

        <StockGraphCarousel 
          stocks={stocks.length > 0 ? stocks.slice(0, 5) : getDemoStocks().slice(0, 5)} 
        />
      </div>

      <div className="info-title">
        <h2>Trending Stocks</h2>
        <p className="carousel-subtitle">
          {loading ? 'Loading approved stocks data...' : 'Live overview of market assets'}
        </p>
      </div>

      <section className="div-initial">
        <div className="stocks-card">
          <DobleStockTable 
            items={firstTableStocks.length > 0 ? firstTableStocks : getDemoStocks().slice(0, 7).map(s => ({
              symbol: s.symbol,
              name: s.name,
              price: s.currentPrice,
              changePct: s.changePct,
            }))} 
            loading={loading}
          />
        </div>

        <div className="stocks-card">
          <DobleStockTable 
            items={secondTableStocks.length > 0 ? secondTableStocks : getDemoStocks().slice(7, 14).map(s => ({
              symbol: s.symbol,
              name: s.name,
              price: s.currentPrice,
              changePct: s.changePct,
            }))} 
            loading={loading}
          />
        </div>
      </section>
    </main>
  );
}
