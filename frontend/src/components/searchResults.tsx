'use client';

import { useEffect, useRef, useState } from 'react';
import Header from '../components/Header';
import {
  getActiveStocks,
  getStockByName,
  getStocksByCategory,
  getStocksByPriceRange,
  type Stock,
} from '@/services/stocks';
import '@/styles/searchResults.css';

// adapta el JSON del backend (Stock) al formato simple
function toRow(s: Stock) {
  return {
    symbol: s.symbol,
    name: s.name,
    price: s.last_price ? Number(s.last_price) : 0,
  };
}

type HeaderPublicProps = {
  isLoggedIn: boolean;
  marketOpen: boolean;
  totalAmount?: number;
};

export default function SearchResults({
  headerProps,
  title = 'Resultados de la búsqueda',
}: {
  headerProps: HeaderPublicProps;
  title?: string;
}) {
  const [rows, setRows] = useState<
    { symbol: string; name: string; price: number }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [open, setOpen] = useState(false);

  const panelRef = useRef<HTMLDivElement | null>(null);

  // cerrar con click fuera 
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open || !panelRef.current) return;
      if (!panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
    };
  }, [open]);

  // handler que consumirá el Header
  async function onSearch(params: {
    name: string;
    activeOnly: boolean;
    category: string;
    priceMin?: string;
    priceMax?: string;
  }) {
    const { name, activeOnly, category, priceMin, priceMax } = params;
    const q = (name ?? '').trim();

    setHasSearched(true);
    setOpen(true);
    setLoading(true);
    setError(null);

    try {
      if (q) {
        const one = await getStockByName(q);
        const list = one ? [one] : [];
        setRows(list.map(toRow));
      } else if (category) {
        const data = await getStocksByCategory(category);
        setRows(data.map(toRow));
      } else if (priceMin || priceMax) {
        const min = priceMin ? Number(priceMin) : undefined;
        const max = priceMax ? Number(priceMax) : undefined;
        const data = await getStocksByPriceRange(min, max);
        setRows(data.map(toRow));
      } else if (activeOnly) {
        const data = await getActiveStocks();
        setRows(data.map(toRow));
      } else {
        setRows([]);
      }
    } catch (e) {
      setError('No se pudo aplicar el filtro.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header
        isLoggedIn={headerProps.isLoggedIn}
        marketOpen={headerProps.marketOpen}
        totalAmount={headerProps.totalAmount ?? 0}
        onSearch={onSearch}
      />

      {open && hasSearched && (
        <div className="search-overlay">
          <div className="search-box" ref={panelRef}>
            <div className="search-box-header">
              <h3>{title}</h3>
              <button onClick={() => setOpen(false)}><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M405 136.798L375.202 107 256 226.202 136.798 107 107 136.798 226.202 256 107 375.202 136.798 405 256 285.798 375.202 405 405 375.202 285.798 256z"></path></svg></button>
            </div>

            {loading && <p>Cargando…</p>}
            {error && <p style={{ color: 'crimson' }}>{error}</p>}
            {!loading && !error && rows.length === 0 && (
              <p>No se encontraron resultados.</p>
            )}

            {!loading && !error && rows.length > 0 && (
              <ul className="search-list">
                {rows.map((r) => (
                  <li key={r.symbol}>
                    <button className="search-item">
                      <strong>{r.symbol}</strong> — {r.name} · Q.{r.price}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
}
