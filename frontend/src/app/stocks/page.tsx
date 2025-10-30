'use client';
import { useRouter } from 'next/navigation';
import StocksRecommendationsTable, { StockItem } from '@/components/stocksTable';
import PopularStocksCard, { PopularStock } from '@/components/popularCardStocks';
import "./generalStocks.css";
import StockTrends from '@/components/StockTrends';
import DobleStockTable from '@/components/dobleStockTabke';
import StockTrendCard from '@/components/StockTrendCard';
import StockGraphCarousel from '@/components/StockGraphCarousel';
import { useEffect, useState } from 'react';

export default function StocksPage() {
  const router = useRouter();

  // Estados para datos reales
  const [realStocks, setRealStocks] = useState<StockItem[]>([]);
  const [popularStocks, setPopularStocks] = useState<PopularStock[]>([]);
  const [loading, setLoading] = useState(true);

  // Función para obtener stocks aprobados de la BD
  const fetchApprovedStocks = async () => {
    try {
      setLoading(true);
      // CAMBIO: Usar endpoint de stocks aprobados
      const response = await fetch('http://localhost:8000/api/stocks/approved/');
      
      if (!response.ok) {
        throw new Error('Failed to fetch approved stocks');
      }
      
      const data = await response.json();
      
      // Convertir datos de la API al formato del frontend
      const formattedStocks: StockItem[] = data.data.map((stockData: any) => {
        const variation = stockData.changePct || 0;
        
        let recommendation = 'HOLD';
        if (variation > 5) recommendation = 'STRONG BUY';
        else if (variation > 2) recommendation = 'BUY';
        else if (variation < -5) recommendation = 'STRONG SELL';
        else if (variation < -2) recommendation = 'SELL';

        return {
          symbol: stockData.symbol,
          name: stockData.name || stockData.symbol,
          currentPrice: stockData.currentPrice || 0,
          changePct: variation,
          last30d: [],
          targetPrice: 0,
          recommendation: recommendation
        };
      });

      setRealStocks(formattedStocks);
      
      // Crear popular stocks (primeros 14 para las dos tablas dobles)
      const popularItems: PopularStock[] = formattedStocks.slice(0, 14).map(stock => ({
        symbol: stock.symbol,
        name: stock.name,
        price: stock.currentPrice,
        changePct: stock.changePct,
      }));
      
      setPopularStocks(popularItems);
      
    } catch (error) {
      console.error('Error fetching approved stocks:', error);
      // Fallback a datos de demo
      setRealStocks(getDemoStocks());
      setPopularStocks(getDemoStocks().slice(0, 14).map(stock => ({
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
    { symbol: 'BP.L', name: 'BP',           currentPrice: 423.61,changePct: 0.31,  last30d: [4,5.2,4.7,4.5,4.6],  targetPrice: 5.45,   recommendation: 'BUY' },
    { symbol: 'PEN',  name: 'Penumbra Inc', currentPrice: 275.87,changePct: 1.63,  last30d: [2,3,4,4.5,3.8],      targetPrice: 299.00, recommendation: 'HOLD' },
    { symbol: 'MPWR', name: 'Monolithic Power Systems', currentPrice: 838.89,changePct: -1.73, last30d: [9,8,7.5,7.8,7.3], targetPrice: 533.75, recommendation: 'SELL' },
    { symbol: 'AAPL',  name: 'Apple Inc', currentPrice: 262.82,  changePct: 1.25, last30d: [250,255,260,258,262], targetPrice: 280.00,  recommendation: 'BUY' },
    { symbol: 'MSFT', name: 'Microsoft', currentPrice: 523.61, changePct: 0.59, last30d: [510,515,520,518,523], targetPrice: 540.00, recommendation: 'BUY' },
    { symbol: 'TSLA',  name: 'Tesla Inc', currentPrice: 245.50, changePct: -2.15, last30d: [260,255,250,248,245], targetPrice: 270.00, recommendation: 'HOLD' },
    { symbol: 'GOOGL', name: 'Alphabet Inc', currentPrice: 175.25, changePct: 0.89, last30d: [170,172,174,173,175], targetPrice: 185.00, recommendation: 'BUY' },
    { symbol: 'AMZN',  name: 'Amazon Inc', currentPrice: 178.90,  changePct: 1.45, last30d: [175,176,177,178,179], targetPrice: 190.00,  recommendation: 'STRONG BUY' },
    { symbol: 'META', name: 'Meta Platforms', currentPrice: 485.30, changePct: -0.75, last30d: [490,488,486,487,485], targetPrice: 510.00, recommendation: 'HOLD' },
    { symbol: 'NVDA',  name: 'NVIDIA Corp', currentPrice: 112.45, changePct: 3.25, last30d: [105,108,110,111,112], targetPrice: 120.00, recommendation: 'STRONG BUY' },
    { symbol: 'JPM', name: 'JPMorgan Chase', currentPrice: 195.60, changePct: 0.45, last30d: [192,193,194,195,196], targetPrice: 205.00, recommendation: 'BUY' },
    { symbol: 'JNJ',  name: 'Johnson & Johnson', currentPrice: 155.75, changePct: -0.35, last30d: [156,155,156,155,156], targetPrice: 165.00, recommendation: 'HOLD' },
    { symbol: 'V', name: 'Visa Inc', currentPrice: 275.80, changePct: 1.20, last30d: [270,272,274,273,275], targetPrice: 290.00, recommendation: 'BUY' },
    { symbol: 'WMT',  name: 'Walmart Inc', currentPrice: 67.25, changePct: 0.75, last30d: [66,66.5,67,66.8,67.2], targetPrice: 72.00, recommendation: 'BUY' },
    { symbol: 'DIS', name: 'Disney Co', currentPrice: 95.40, changePct: -1.25, last30d: [98,97,96,96,95], targetPrice: 105.00, recommendation: 'HOLD' },
  ];

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchApprovedStocks();
    
    // Opcional: Actualizar datos cada 30 segundos
    const interval = setInterval(fetchApprovedStocks, 30000);
    return () => clearInterval(interval);
  }, []);

  // Dividir los popular stocks en dos grupos para las tablas dobles
  const firstTableStocks = popularStocks.slice(0, 7);
  const secondTableStocks = popularStocks.slice(7, 14);

  return (
    <main className="landingPageUser">
        <p className="subtitle">Investment Opportunities</p>
        <h1 className='title-stocks'>Explore Global Markets</h1>

        <div className="div-carrusel">
            <StockTrends loading={loading} />
        </div>

        <div className="div-more-info-dashboard-user">
            <StocksRecommendationsTable 
              rows={realStocks.length > 0 ? realStocks : getDemoStocks()} 
              loading={loading}
            />

            <StockGraphCarousel stocks={realStocks.length > 0 ? realStocks.slice(0, 5) : getDemoStocks().slice(0, 5)} />

        </div>

        <div className='info-title'>
          <h2>Trending Stocks</h2>
          <p className="carousel-subtitle">
            {loading ? 'Loading approved stocks data...' : 'Live overview of approved market assets'}
          </p>
        </div>

        <section className="div-initial">
          <div className="stocks-card">
            <DobleStockTable 
              items={firstTableStocks.length > 0 ? firstTableStocks : getDemoStocks().slice(0, 7).map(stock => ({
                symbol: stock.symbol,
                name: stock.name,
                price: stock.currentPrice,
                changePct: stock.changePct,
              }))} 
              loading={loading}
            />
          </div>

          <div className="stocks-card">
            <DobleStockTable 
              items={secondTableStocks.length > 0 ? secondTableStocks : getDemoStocks().slice(7, 14).map(stock => ({
                symbol: stock.symbol,
                name: stock.name,
                price: stock.currentPrice,
                changePct: stock.changePct,
              }))} 
              loading={loading}
            />
          </div>
        </section>
    </main>
  );
}