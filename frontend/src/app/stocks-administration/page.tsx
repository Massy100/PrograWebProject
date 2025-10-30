'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import "./stocksAdministration.css";
import AddStocksTable, { StockItem } from '@/components/AddStocksTable';

interface ApiStock {
  id: number;
  symbol: string;
  name: string;
  last_price: number | string;
  variation: number | string;
  updated_at: string;
  created_at: string;
  category: any;
}

interface ApiStockResponse {
  data: ApiStock[];
  last_updated: string;
  source: string;
}

export default function StocksAdministration() {
  const router = useRouter();
  const [stocksData, setStocksData] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generateLastDays = (currentPrice: number, variationPct: number): number[] => {
    const days = 30;
    const data: number[] = [];
    const dailyVolatility = Math.abs(variationPct) / 2 + 0.8;
    let price = currentPrice;

    for (let i = days - 1; i >= 0; i--) {
      const randomFactor = 1 + (Math.random() - 0.5) * (dailyVolatility / 100);
      price = Math.max(price * randomFactor, 0.5);
      data.unshift(parseFloat(price.toFixed(2)));
    }
    return data;
  };

  const fetchRealStocksData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:8000/api/alpha-vantage/stocks/real-data/');
      if (!response.ok) throw new Error(`Error: ${response.status} - ${response.statusText}`);

      const apiResponse: ApiStockResponse = await response.json();
      if (!apiResponse.data || apiResponse.data.length === 0)
        throw new Error('No se recibieron datos de acciones.');

      const transformedData: StockItem[] = apiResponse.data.map(stock => {
        const variation =
          typeof stock.variation === 'string'
            ? parseFloat(stock.variation)
            : stock.variation || 0;

        const price =
          typeof stock.last_price === 'string'
            ? parseFloat(stock.last_price)
            : stock.last_price || 0;

        let recommendation = 'HOLD';
        if (variation > 5) recommendation = 'STRONG BUY';
        else if (variation > 2) recommendation = 'BUY';
        else if (variation < -5) recommendation = 'STRONG SELL';
        else if (variation < -2) recommendation = 'SELL';

        const last30d = generateLastDays(price, variation);
        const average = last30d.reduce((a, b) => a + b, 0) / last30d.length;
        const targetPrice = parseFloat((average * 1.05).toFixed(2));

        return {
          symbol: stock.symbol,
          name: stock.name || stock.symbol,
          currentPrice: price,
          changePct: variation,
          last30d,
          targetPrice,
          recommendation,
        };
      });

      setStocksData(transformedData);
    } catch (err) {
      console.error('Error fetching stocks data:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setStocksData(getMockData());
    } finally {
      setLoading(false);
    }
  };

  const getMockData = (): StockItem[] => [
    {
      symbol: 'AAPL',
      name: 'Apple Inc',
      currentPrice: 262.82,
      changePct: 1.25,
      last30d: generateLastDays(262.82, 1.25),
      targetPrice: 280.0,
      recommendation: 'BUY',
    },
    {
      symbol: 'MSFT',
      name: 'Microsoft Corp',
      currentPrice: 523.61,
      changePct: 0.59,
      last30d: generateLastDays(523.61, 0.59),
      targetPrice: 540.0,
      recommendation: 'BUY',
    },
    {
      symbol: 'TSLA',
      name: 'Tesla Inc',
      currentPrice: 245.5,
      changePct: -2.15,
      last30d: generateLastDays(245.5, -2.15),
      targetPrice: 270.0,
      recommendation: 'HOLD',
    },
  ];

  useEffect(() => {
    fetchRealStocksData();
  }, []);

  const handleRefresh = () => fetchRealStocksData();

  return (
    <div className="stocks-administration">
      <div className="stocks-header">
        <div className="stocks-header-text">
          <h3 className="stocks-table-title">Available Stock Market</h3>
          <p className="stocks-table-subtitle">
            Real-time stocks available to add to the system
            {!error && ` • Last updated: ${new Date().toLocaleTimeString()}`}
          </p>
        </div>

        <button
          className={`refresh-button ${loading ? 'refreshing' : ''}`}
          onClick={handleRefresh}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner"></span> Refreshing...
            </>
          ) : (
            <>Refresh Data</>
          )}
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="modern-spinner"></div>
          <p className="loading-text">Fetching real-time market data...</p>
        </div>
      ) : (
        <>
          {error && (
            <div className="error-message">
            </div>
          )}
          <AddStocksTable rows={stocksData} />
        </>
      )}
    </div>
  );
}
