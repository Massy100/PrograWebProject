'use client';
import React from 'react';
import '../styles/BigCardKpi.css';

type Format = 'money' | 'number';

type BigCardKpiProps = {
  earnedTotal: number | string;
  investedTotal: number | string;
  stocksBuy: number | string;
  stocksSell: number | string;
  dark?: boolean;
};


const formatPlainNumber = (v: number | string) => {
  const n = Number(typeof v === 'number' ? v : String(v).replace(/[^\d.-]/g, ''));
  return Number.isFinite(n)
    ? n.toLocaleString(undefined, { maximumFractionDigits: 0 })
    : String(v);
};

const formatValue = (v: number | string, format: Format = 'number') => {
  const base = formatPlainNumber(v);
  return format === 'money' ? `Q.${base}` : base;
};


export default function BigCardKpi({
  earnedTotal,
  investedTotal,
  stocksBuy,
  stocksSell,
  dark = false,
}: BigCardKpiProps) {
  const earned = Number(earnedTotal);
  const invested = Number(investedTotal);

  const diff = earned - invested;
  const percent =
    invested > 0 ? Math.abs((diff / invested) * 100).toFixed(1) : '0';

  const isUp = diff > 0;
  const trendClass = isUp ? 'up' : 'down';
  const trendText = isUp ? `${percent}% gain` : `${percent}% loss`;

  return (
    <article className={`infoCard ${dark ? 'infoCardDark' : ''}`}>
      <div className="cardKpi one">
        <h4>Earned Total</h4>
        <h2>{formatValue(earnedTotal, 'money')}</h2>
        <p className={trendClass}>{trendText}</p>
      </div>

      <div className="cardKpi especial">
        <h4>Invested Total</h4>
        <h2>{formatValue(investedTotal, 'money')}</h2>
        {/* <p className={trendClass}>{trendText}</p> */}
      </div>

      <div className="cardKpi semiEspecial">
        <h4>Stocks Buy</h4>
        <h2>{formatValue(stocksBuy, 'number')}</h2>
      </div>

      <div className="cardKpi last">
        <h4>Stocks Sell</h4>
        <h2>{formatValue(stocksSell, 'number')}</h2>
      </div>
    </article>
  );
}
