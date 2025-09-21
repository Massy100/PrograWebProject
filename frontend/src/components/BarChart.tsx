'use client';
import React from 'react';
import '../styles/barChart.css';

type Point = { label: string; value: number };

type Props = {
  title?: string;
  data: Point[];                  // [{ label: 'Jan', value: 5200 }, ...]
  highlightIndex?: number;        // índice para resaltar una barra (opc.)
  maxValue?: number;              // si no lo pasas, se calcula del data
};

const formatK = (n: number) =>
  n >= 1000 ? `${Math.round(n / 1000)}K` : `${n}`;

export default function BarChart({
  title = 'Total Revenue',
  data,
  highlightIndex,
  maxValue,
}: Props) {
  const max = Math.max(maxValue ?? 0, ...data.map(d => d.value), 1);
  const ticks = 5; // 0%, 25%, 50%, 75%, 100%
  const ySteps = Array.from({ length: ticks }, (_, i) =>
    Math.round((i * max) / (ticks - 1))
  );

  return (
    <section className="chartCard" aria-label={title}>
      <header className="chartHead">
        <h3 className="chartTitle">{title}</h3>
      </header>

      <div className="chartBody">
        {/* Eje Y (izquierda) */}
        <ul className="yAxis">
          {ySteps
            .slice() // copia para no mutar
            .reverse()
            .map((v, i) => (
              <li key={i} className="yTick">
                {formatK(v)}
              </li>
            ))}
        </ul>

        {/* Barras */}
        <div className="barsWrap">
          {data.map((d, i) => {
            const h = (d.value / max) * 100;
            const isActive = i === highlightIndex;
            return (
              <div key={i} className="barItem">
                <div className="bar">
                  <div
                    className={`barFill ${isActive ? 'barActive' : ''}`}
                    style={{ height: `${h}%` }}
                    aria-label={`${d.label} ${d.value}`}
                    title={`${d.label}: ${d.value}`}
                  />
                </div>
                <div className={`barLabel ${isActive ? 'barLabelActive' : ''}`}>
                  {d.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
