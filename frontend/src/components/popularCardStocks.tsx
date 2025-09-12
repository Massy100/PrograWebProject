'use client';

import React from 'react';
import '../styles/popularCardStocks.css';

export type PopularStock = {
  symbol: string;
  name: string;
  price: number;
  changePct?: number;
  investorsPct?: number; 
};

type Props = {
  items: PopularStock[];
};

export default function PopularStocksCard({ items}: Props) {
  return (
    <aside className="popular-stocks-card" aria-label="Acciones más populares">
      <h3 className="popular-stocks-card-title">Acciones más populares</h3>

      {/* encabezado */}
      <div className="popular-stocks-card-header">
        <span className="hdr-left">Stock</span>
        <span className="hdr-mid">Precio</span>
      </div>

      <ul className="popular-stocks-card-list">
        {items.map((it) => (
          <li key={it.symbol} className="popular-stocks-card-item">
            {/* izquierda: símbolo + nombre */}
            <div className="popular-stocks-card-item-left">
              <span className="popular-stocks-card-item-symbol">{it.symbol}</span>
              <span className="popular-stocks-card-item-name">{it.name}</span>
            </div>

            {/* medio: precio + variación */}
            <div className="popular-stocks-card-item-right">
              <span className="popular-stocks-card-item-price">Q.{it.price}</span>
              {typeof it.changePct === 'number' && (
                <span
                  className={
                    'popular-stocks-card-item-change ' +
                    (it.changePct >= 0
                      ? 'popular-stocks-text-positive'
                      : 'popular-stocks-text-negative')
                  }
                >
                  {it.changePct >= 0 ? '+' : ''}
                  {it.changePct.toFixed(2)}%
                </span>
              )}
            </div>

          </li>
        ))}
      </ul>

    </aside>
  );
}
