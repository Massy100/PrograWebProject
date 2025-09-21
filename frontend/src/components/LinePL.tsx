'use client';
import React from 'react';
import '../styles/linePl.css';

type Tx = { date: string; type: 'buy' | 'sell'; amount: number };

type Props = {
  title?: string;
  data: Tx[]; // {date:'2025-01-10', type:'sell'|'buy', amount: 1200}
};

function buildCumulative(data: Tx[]) {
  // ordenar por fecha y acumular (+venta, -compra)
  const sorted = [...data].sort((a, b) => +new Date(a.date) - +new Date(b.date));
  let acc = 0;
  const points = sorted.map(t => {
    acc += t.type === 'sell' ? +t.amount : -t.amount;
    return { x: new Date(t.date), y: acc };
  });
  // compactar por mes (opcional): tomamos último punto del mes
  const byMonth = new Map<string, { x: Date; y: number }>();
  for (const p of points) {
    const key = `${p.x.getFullYear()}-${String(p.x.getMonth() + 1).padStart(2, '0')}`;
    byMonth.set(key, p);
  }
  const arr = Array.from(byMonth.values()).sort((a, b) => +a.x - +b.x);
  return arr;
}

export default function LinePL({ title = 'Cumulative P&L', data }: Props) {
  const series = buildCumulative(data);
  const width = 640;
  const height = 260;
  const pad = 36;

  const minX = series.length ? +series[0].x : 0;
  const maxX = series.length ? +series[series.length - 1].x : 1;
  const minY = Math.min(0, ...series.map(p => p.y));
  const maxY = Math.max(0, ...series.map(p => p.y));

  const xTo = (d: Date) =>
    pad + ((+d - minX) / (maxX - minX || 1)) * (width - pad * 2);
  const yTo = (v: number) =>
    height - pad - ((v - minY) / (maxY - minY || 1)) * (height - pad * 2);

  const path = series
    .map((p, i) => `${i ? 'L' : 'M'} ${xTo(p.x).toFixed(1)} ${yTo(p.y).toFixed(1)}`)
    .join(' ');

  // ticks Y (5)
  const ticks = 5;
  const yTicks = Array.from({ length: ticks }, (_, i) =>
    Math.round(minY + (i * (maxY - minY)) / (ticks - 1))
  );

  return (
    <section className="lineCard">
      <header className="lineHead">
        <h3 className="lineTitle">{title}</h3>
      </header>

      <div className="lineWrap">
        <svg className="lineSvg" viewBox={`0 0 ${width} ${height}`} role="img">
          {/* grid horizontal */}
          {yTicks.map((v, i) => {
            const y = yTo(v);
            return (
              <g key={i}>
                <line x1={pad} x2={width - pad} y1={y} y2={y} className="gridLine" />
                <text x={8} y={y + 4} className="yText">
                  {v.toLocaleString()}
                </text>
              </g>
            );
          })}

          {/* línea */}
          <path d={path} className="plLine" />
          {/* puntos */}
          {series.map((p, i) => (
            <circle key={i} cx={xTo(p.x)} cy={yTo(p.y)} r={3.5} className="plDot" />
          ))}
          {/* eje X labels (mes) */}
          {series.map((p, i) => (
            <text key={`l${i}`} x={xTo(p.x)} y={height - 8} className="xText">
              {p.x.toLocaleString(undefined, { month: 'short' })}
            </text>
          ))}
        </svg>
      </div>
    </section>
  );
}
