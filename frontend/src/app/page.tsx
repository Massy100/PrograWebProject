'use client';

import { useRouter } from 'next/navigation';
import StocksRecommendationsTable, { StockItem } from '@/components/stocksTable';
import PopularStocksCard, { PopularStock } from '@/components/popularCardStocks';
import '@/app/page.css'
import SearchResults from '@/components/searchResults';


export default function Home() {
  const router = useRouter();
  
  // info para la tabla de stocks
  // en last30d se pone el precio de la acciones en los ultimos dias y con eso hace la grafica
  const demoRows: StockItem[] = [
    { symbol: 'NIO',  name: 'Nio Inc.-ADR', currentPrice: 6.04,  changePct: -0.48, last30d: [9,8,7,6.5,6.7,6.6], targetPrice: 61.75,  recommendation: 'COMPRA FUERTE' },
    { symbol: 'BP.L', name: 'BP',           currentPrice: 423.61,changePct: 0.31,  last30d: [4,5.2,4.7,4.5,4.6],  targetPrice: 5.45,   recommendation: 'COMPRA' },
    { symbol: 'PEN',  name: 'Penumbra Inc', currentPrice: 275.87,changePct: 1.63,  last30d: [2,3,4,4.5,3.8],      targetPrice: 299.00, recommendation: 'MANTENER' },
    { symbol: 'MPWR', name: 'Monolithic Power Systems', currentPrice: 838.89,changePct: -1.73, last30d: [9,8,7.5,7.8,7.3], targetPrice: 533.75, recommendation: 'VENTA' },
  ];

  // datos para el card derecho
  const popularItems: PopularStock[] = demoRows.slice(0, 7).map(r => ({
    symbol: r.symbol,
    name: r.name,
    price: r.currentPrice,
    changePct: r.changePct,
  }));

  // handler del botón "Ver más"
  const handleSeeMore = () => {
    // router.push('/login'); tiene que desplegar el login
  };

  return (
    <main className='landingPage'>
       <SearchResults
        headerProps={{ isLoggedIn: true, marketOpen: true, totalAmount: 100 }}
        title="Resultados de la búsqueda"
      />

      <section className="div-initial">
        <div className="info">
          <h1 className="home-title">¡Bienvenido!</h1>
          <p className="home-text">
            Aquí tienes el pulso del mercado y las acciones recomendadas de esta semana.
          </p>
          <button type="button" className="see-more-btn">
            Ver más
          </button>
        </div>
        <div className="stocks-card">
          <PopularStocksCard items={popularItems}/>
        </div>
          
        
      </section>
      <StocksRecommendationsTable rows={demoRows} />

    </main>
  );
}
