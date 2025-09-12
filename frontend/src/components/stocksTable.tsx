'use client';

import React from 'react';
import '../styles/stocksTable.css';

export type StockItem = {
  symbol: string;
  name: string;
  currentPrice: number;
  changePct: number;          // ej: -0.48 significa -0.48%
  last30d: number[];          // serie para sparkline (0..1 o cualquier escala)
  targetPrice: number;
  recommendation: string;     // ej: "COMPRA", "MANTENER", etc.
};

type Props = {
  rows: StockItem[];
};

export default function StocksRecommendationsTable({ rows }: Props) {
  return (
    <section className="stocks-table">
      <div className="stocks-table-header">
        <div className="stocks-table-header-cell stocks-table-col-stock">Acciones</div>
        <div className="stocks-table-header-cell">Precio actual</div>
        <div className="stocks-table-header-cell">Últimos 30 días</div>
        <div className="stocks-table-header-cell">Precio objetivo</div>
        <div className="stocks-table-header-cell">Recomendación</div>
      </div>

      <div className="stocks-table-body">
        {rows.map((s) => {
          const trendUp = s.last30d[s.last30d.length - 1] >= s.last30d[0];
          return (
            <div key={s.symbol} className="stocks-table-row">
              <div className="stocks-table-cell stocks-table-col-stock">
                <div className="stocks-table-stock-name">
                  <strong className="stocks-table-stock-symbol">{s.symbol}</strong>
                  <span className="stocks-table-stock-fullname">{s.name}</span>
                </div>
              </div>

              <div className="stocks-table-cell">
                <div className="stocks-table-price">
                  <span className="stocks-table-price-value">
                    Q.{s.currentPrice}
                  </span>
                  <span
                    className={
                      'stocks-table-price-change ' +
                      (s.changePct >= 0
                        ? 'stocks-table-text-positive'
                        : 'stocks-table-text-negative')
                    }
                  >
                    ({s.changePct >= 0 ? '+' : ''}
                    {s.changePct.toFixed(2)}%)
                  </span>
                </div>
              </div>

              <div className="stocks-table-cell">
                <Sparkline
                  data={s.last30d}
                  positiveColor={trendUp ? '#1AC963' : '#F8191E'}
                  negativeColor={trendUp ? '#1AC963' : '#F8191E'}
                />
              </div>

              <div className="stocks-table-cell">
                <span className="stocks-table-target-price">
                  Q.{s.targetPrice}
                </span>
              </div>

              <div className="stocks-table-cell">
                <span
                  className={
                    'stocks-table-recommendation-pill ' +
                    (s.recommendation.toLowerCase().includes('compra')
                      ? 'stocks-table-pill-positive'
                      : s.recommendation.toLowerCase().includes('venta')
                      ? 'stocks-table-pill-negative'
                      : 'stocks-table-pill-neutral')
                  }
                >
                  {s.recommendation}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// graficas con svg
function Sparkline({
  data,
  positiveColor,
  negativeColor,
}: {
  data: number[];
  positiveColor: string;
  negativeColor: string;
}) {
  if (!data || data.length < 2) return null;

  const w = 120;
  const h = 36;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * (w - 2) + 1;
    const y = h - 1 - ((v - min) / range) * (h - 2);
    return `${x},${y}`;
  });

  const up = data[data.length - 1] >= data[0];

  return (
    <svg
      className="stocks-table-sparkline"
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      aria-hidden="true"
    >
      <polyline
        fill="none"
        stroke={up ? positiveColor : negativeColor}
        strokeWidth="2"
        points={points.join(' ')}
      />
      <polygon
        points={`1,${h - 1} ${points.join(' ')} ${w - 1},${h - 1}`}
        fill={up ? 'rgba(26,201,99,0.12)' : 'rgba(248,25,30,0.12)'}
      />
    </svg>
  );
}


