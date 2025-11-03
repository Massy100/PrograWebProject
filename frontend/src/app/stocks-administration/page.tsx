'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import "./stocksAdministration.css";
import AddStocksTable, { StockItem } from '@/components/AddStocksTable';

// Define la interfaz para la respuesta de la API REAL
interface ApiStockResponse {
  data: {
    id: number;
    symbol: string;
    name: string;
    last_price: string;
    variation: string;
    updated_at: string;
    created_at: string;
    category: any;
  }[];
  last_updated: string;
  source: string;
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
      // SOLO AQUI SE MANDA A LLAMAR LA API REAL
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/alpha-vantage/stocks/real-data/');
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
      
      const apiResponse: ApiStockResponse = await response.json();
      
      // Transformar los datos de la API a la estructura que espera AddStocksTable
      const transformedData: StockItem[] = apiResponse.data.map(stock => {
        const variation = parseFloat(stock.variation) || 0;
        
        // Calcular recomendación basada en la variación
        let recommendation = 'HOLD';
        if (variation > 5) recommendation = 'STRONG BUY';
        else if (variation > 2) recommendation = 'BUY';
        else if (variation < -5) recommendation = 'STRONG SELL';
        else if (variation < -2) recommendation = 'SELL';

        return {
          symbol: stock.symbol,
          name: stock.name,
          currentPrice: parseFloat(stock.last_price) || 0,
          changePct: variation,
          last30d: [], // La API actual no proporciona datos históricos
          targetPrice: 0, // Podrías calcular esto si tienes datos históricos
          recommendation: recommendation
        };
      });
      
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

  // Datos mock de fallback (mejorados con datos reales)
  const getMockData = (): StockItem[] => [
    { symbol: 'AAPL', name: 'Apple Inc', currentPrice: 262.82, changePct: 1.25, last30d: [250,255,260,258,262], targetPrice: 280.00, recommendation: 'BUY' },
    { symbol: 'MSFT', name: 'Microsoft Corp', currentPrice: 523.61, changePct: 0.59, last30d: [510,515,520,518,523], targetPrice: 540.00, recommendation: 'BUY' },
    { symbol: 'NIO', name: 'Nio Inc.-ADR', currentPrice: 6.04, changePct: -0.48, last30d: [9,8,7,6.5,6.7,6.6], targetPrice: 61.75, recommendation: 'STRONG BUY' },
    { symbol: 'BP', name: 'BP PLC', currentPrice: 423.61, changePct: 0.31, last30d: [4,5.2,4.7,4.5,4.6], targetPrice: 5.45, recommendation: 'BUY' },
    { symbol: 'PEN', name: 'Penumbra Inc', currentPrice: 275.87, changePct: 1.63, last30d: [2,3,4,4.5,3.8], targetPrice: 299.00, recommendation: 'HOLD' },
    { symbol: 'MPWR', name: 'Monolithic Power Systems', currentPrice: 838.89, changePct: -1.73, last30d: [9,8,7.5,7.8,7.3], targetPrice: 533.75, recommendation: 'SELL' },
    { symbol: 'GOOGL', name: 'Alphabet Inc', currentPrice: 175.25, changePct: 0.89, last30d: [170,172,174,173,175], targetPrice: 185.00, recommendation: 'BUY' },
    { symbol: 'TSLA', name: 'Tesla Inc', currentPrice: 245.50, changePct: -2.15, last30d: [260,255,250,248,245], targetPrice: 270.00, recommendation: 'HOLD' },
    { symbol: 'AMZN', name: 'Amazon.com Inc', currentPrice: 178.90, changePct: 1.45, last30d: [175,176,177,178,179], targetPrice: 190.00, recommendation: 'STRONG BUY' },
    { symbol: 'META', name: 'Meta Platforms Inc', currentPrice: 485.30, changePct: -0.75, last30d: [490,488,486,487,485], targetPrice: 510.00, recommendation: 'HOLD' },
    { symbol: 'NVDA', name: 'NVIDIA Corp', currentPrice: 112.45, changePct: 3.25, last30d: [105,108,110,111,112], targetPrice: 120.00, recommendation: 'STRONG BUY' },
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
          {loading ? 'Refreshing...' : 'Refresh Data'}
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