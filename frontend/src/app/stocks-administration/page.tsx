'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import "./stocksAdministration.css";
import AddStocksTable, { StockItem } from '@/components/AddStocksTable';

// Define la interfaz para la respuesta de la API
interface ApiStockItem {
  symbol: string;
  name: string;
  currentPrice: number;
  changePct: number;
  last30d: number[];
  targetPrice: number;
  recommendation: string;
  category?: string;
}

export default function StocksAdministration() {
  const router = useRouter();
  const [stocksData, setStocksData] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener datos reales del backend
  const fetchRealStocksData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // URL de tu backend Django - ajusta según tu configuración
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      
      const response = await fetch(`${API_URL}/alpha-vantage/stocks/real-data/`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
      
      const realData: ApiStockItem[] = await response.json();
      
      // Transformar los datos a la estructura que espera AddStocksTable
      const transformedData: StockItem[] = realData.map(stock => ({
        symbol: stock.symbol,
        name: stock.name,
        currentPrice: stock.currentPrice,
        changePct: stock.changePct,
        last30d: stock.last30d,
        targetPrice: stock.targetPrice,
        recommendation: stock.recommendation
      }));
      
      setStocksData(transformedData);
      
    } catch (err) {
      console.error('Error fetching stocks data:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      
      // Fallback a datos mock si la API falla
      setStocksData(getMockData());
    } finally {
      setLoading(false);
    }
  };

  // Datos mock de fallback
  const getMockData = (): StockItem[] => [
    { symbol: 'NIO',  name: 'Nio Inc.-ADR', currentPrice: 6.04,  changePct: -0.48, last30d: [9,8,7,6.5,6.7,6.6], targetPrice: 61.75,  recommendation: 'STRONG BUY' },
    { symbol: 'BP', name: 'BP PLC', currentPrice: 423.61, changePct: 0.31, last30d: [4,5.2,4.7,4.5,4.6], targetPrice: 5.45, recommendation: 'BUY' },
    { symbol: 'PEN',  name: 'Penumbra Inc', currentPrice: 275.87, changePct: 1.63, last30d: [2,3,4,4.5,3.8], targetPrice: 299.00, recommendation: 'HOLD' },
    { symbol: 'MPWR', name: 'Monolithic Power Systems', currentPrice: 838.89, changePct: -1.73, last30d: [9,8,7.5,7.8,7.3], targetPrice: 533.75, recommendation: 'SELL' },
    { symbol: 'AAPL', name: 'Apple Inc', currentPrice: 185.43, changePct: 1.23, last30d: [180,182,178,183,185], targetPrice: 200.00, recommendation: 'BUY' },
    { symbol: 'GOOGL', name: 'Alphabet Inc', currentPrice: 2750.89, changePct: -0.45, last30d: [2700,2720,2740,2760,2750], targetPrice: 3000.00, recommendation: 'HOLD' },
    { symbol: 'TSLA', name: 'Tesla Inc', currentPrice: 245.67, changePct: 3.21, last30d: [230,235,240,242,245], targetPrice: 280.00, recommendation: 'STRONG BUY' },
    { symbol: 'MSFT', name: 'Microsoft Corp', currentPrice: 378.45, changePct: 0.89, last30d: [370,372,375,377,378], targetPrice: 400.00, recommendation: 'BUY' },
    { symbol: 'AMZN', name: 'Amazon.com Inc', currentPrice: 175.32, changePct: -1.12, last30d: [180,178,177,176,175], targetPrice: 190.00, recommendation: 'HOLD' },
    { symbol: 'META', name: 'Meta Platforms Inc', currentPrice: 468.90, changePct: 2.34, last30d: [450,455,460,465,468], targetPrice: 500.00, recommendation: 'BUY' },
    { symbol: 'NVDA', name: 'NVIDIA Corp', currentPrice: 875.23, changePct: 4.56, last30d: [800,820,840,860,875], targetPrice: 950.00, recommendation: 'STRONG BUY' },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co', currentPrice: 168.45, changePct: -0.23, last30d: [170,169,168,167,168], targetPrice: 180.00, recommendation: 'HOLD' },
    { symbol: 'JNJ', name: 'Johnson & Johnson', currentPrice: 155.67, changePct: 0.45, last30d: [154,154.5,155,155.5,155.6], targetPrice: 165.00, recommendation: 'HOLD' },
    { symbol: 'V', name: 'Visa Inc', currentPrice: 267.89, changePct: 1.12, last30d: [260,262,264,266,267], targetPrice: 285.00, recommendation: 'BUY' },
    { symbol: 'WMT', name: 'Walmart Inc', currentPrice: 165.43, changePct: -0.67, last30d: [167,166,165.5,165,165.4], targetPrice: 175.00, recommendation: 'HOLD' },
  ];

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchRealStocksData();
  }, []);

  // Función para recargar datos
  const handleRefresh = () => {
    fetchRealStocksData();
  };

  if (loading) {
    return (
      <div className="stocks-administration">
        <h3 className="stocks-table-title">Available Stock Market</h3>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading real-time stock data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stocks-administration">
      <div className="stocks-header">
        <div>
          <h3 className="stocks-table-title">Available Stock Market</h3>
          <p className="stocks-table-subtitle">
            Real-time stocks available to add to the system
            {!error && ` • Last updated: ${new Date().toLocaleTimeString()}`}
          </p>
        </div>
        <button 
          className="refresh-button"
          onClick={handleRefresh}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : '🔄 Refresh Data'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <p>⚠️ {error}</p>
          <small>Showing cached/mock data</small>
        </div>
      )}

      <AddStocksTable rows={stocksData} />
    </div>
  );
}