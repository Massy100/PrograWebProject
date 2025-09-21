'use client';
import React from 'react';
import '../styles/topBars.css';

type Item = { name: string; amount: number };

type Props = {
  title?: string;
  data: Item[];     // [{name:'MSFT', amount: 12000}, ...]
  limit?: number;   // default 5
};

export default function TopBars({ title = 'Top Assets', data, limit = 5 }: Props) {
  const sorted = [...data].sort((a, b) => b.amount - a.amount).slice(0, limit);
  const max = Math.max(...sorted.map(d => d.amount), 1);

  return (
    <section className="topCard">
      <header className="topHead">
        <h3 className="topTitle">{title}</h3>
      </header>

      <ul className="topList">
        {sorted.map((d, i) => {
          const w = (d.amount / max) * 100;
          return (
            <li key={i} className="topRow">
              <div className="topLabel">{d.name}</div>
              <div className="topBar">
                <div className="topFill" style={{ width: `${w}%` }} />
              </div>
              <div className="topValue">Q.{d.amount.toLocaleString()}</div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
