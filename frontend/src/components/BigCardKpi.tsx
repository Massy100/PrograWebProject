'use client';
import React from 'react';
import '../styles/BigCardKpi.css';

type Format = 'money' | 'number';

type KpiCardProps = {
  title: string;
  value: number | string;
  format?: Format;   // 'money' | 'number'
  dark?: boolean;
};

// Normaliza a número y formatea con separadores (sin decimales)
const formatPlainNumber = (v: number | string) => {
  const n = Number(typeof v === 'number' ? v : String(v).replace(/[^\d.-]/g, ''));
  return Number.isFinite(n)
    ? n.toLocaleString(undefined, { maximumFractionDigits: 0 })
    : String(v);
};

// Devuelve "Q.<número>" si es money, o solo "<número>" si es number
const formatValue = (v: number | string, format: Format = 'number') => {
  const base = formatPlainNumber(v);
  return format === 'money' ? `Q.${base}` : base;
};

export default function BigCardKpi({
  title,
  value,
  format = 'number',
  dark = false,
}: KpiCardProps) {
  const mainValue = formatValue(value, format);

  return (
    <article className={`infoCard ${dark ? 'infoCardDark' : ''}`}>
      <div className="cardKpi one">
        <h4>Titulo</h4>
        <h2>Q.4852</h2>
        <p className='up'>48% ganancia</p>
      </div>
      <div className="cardKpi especial">
        <h4>Titulo</h4>
        <h2>Q.5487878</h2>
        <p className='down'>48% ganancia</p>
      </div>
      <div className="cardKpi semiEspecial">
        <h4>Titulo</h4>
        <h2>85</h2>
        <p className='down'>48% ganancia</p>
      </div>
      <div className="cardKpi last">
        <h4>Titulo</h4>
        <h2>5</h2>
        <p className='up'>48% ganancia</p>
      </div>
    </article>
  );
}
