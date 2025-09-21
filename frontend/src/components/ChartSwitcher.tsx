'use client';
import React, { useState } from 'react';
import '../styles/chartSwitcher.css';
import BarChart from '@/components/BarChart';
import Donut from '@/components/donutGrafic';
import LinePL from '@/components/LinePL';
import TopBars from '@/components/TopBars';

export default function ChartSwitcher() {
  type Tab = 'bars' | 'donut' | 'line' | 'top';
  const [tab, setTab] = useState<Tab>('bars');

  // ====== DATA ESTÁTICA PARA PROBAR ======
  const barsData = [
    { label: 'Jan', value: 5200 },
    { label: 'Feb', value: 4600 },
    { label: 'Mar', value: 8200 },
    { label: 'Apr', value: 4300 },
    { label: 'May', value: 7600 },
    { label: 'Jun', value: 2400 },
  ];

  const donutCount = [
    { label: 'Buy', value: 34 },
    { label: 'Sell', value: 21 },
  ];

  const plTx = [
    { date: '2025-01-10', type: 'buy'  as const, amount: 1800 },
    { date: '2025-01-22', type: 'sell' as const, amount: 2600 },
    { date: '2025-02-05', type: 'buy'  as const, amount: 900 },
    { date: '2025-02-20', type: 'sell' as const, amount: 1600 },
    { date: '2025-03-04', type: 'sell' as const, amount: 2100 },
    { date: '2025-03-18', type: 'buy'  as const, amount: 700 },
    { date: '2025-04-08', type: 'sell' as const, amount: 1500 },
  ];

  const topData = [
    { name: 'MSFT', amount: 18200 },
    { name: 'AAPL', amount: 16500 },
    { name: 'GOOGL', amount: 12400 },
    { name: 'NVDA', amount: 9300 },
    { name: 'AMZN', amount: 7200 },
    { name: 'TSLA', amount: 6100 },
  ];
  // =======================================

  return (
    <section className="chartPanel">
      <nav className="chartMenu">
        <button
          className={`chartBtnOption ${tab === 'bars' ? 'chartBtnActive' : ''}`}
          aria-pressed={tab === 'bars'}
          onClick={() => setTab('bars')}
        >
          Bars
        </button>

        <button
          className={`chartBtnOption ${tab === 'donut' ? 'chartBtnActive' : ''}`}
          aria-pressed={tab === 'donut'}
          onClick={() => setTab('donut')}
        >
          Donut
        </button>

        <button
          className={`chartBtnOption ${tab === 'line' ? 'chartBtnActive' : ''}`}
          aria-pressed={tab === 'line'}
          onClick={() => setTab('line')}
        >
          Line P&L
        </button>

        <button
          className={`chartBtnOption ${tab === 'top' ? 'chartBtnActive' : ''}`}
          aria-pressed={tab === 'top'}
          onClick={() => setTab('top')}
        >
          Top 5
        </button>
      </nav>

      <div className="chartArea">
        {tab === 'bars' && (
          <BarChart title="Net by Month" data={barsData} highlightIndex={2} />
        )}
        {tab === 'donut' && (
          <Donut title="Transactions (count)" data={donutCount} />
        )}
        {tab === 'line' && <LinePL title="Cumulative P&L" data={plTx} />}
        {tab === 'top' && (
          <TopBars title="Top 5 by Amount" data={topData} limit={5} />
        )}
      </div>
    </section>
  );
}
