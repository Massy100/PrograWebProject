'use client';
import React from 'react';
import '../styles/kpiCars.css';

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

export default function KpiCard({
  title,
  value,
  format = 'number',
  dark = false,
}: KpiCardProps) {
  const mainValue = formatValue(value, format);

  return (
    <article className={`infoCard ${dark ? 'infoCardDark' : ''}`} aria-live="polite">
      <header className="infoTitle">{title}</header>
      <div className="infoValue" aria-label={`${title} ${mainValue}`}>
        {mainValue}
      </div>
    </article>
  );
}
