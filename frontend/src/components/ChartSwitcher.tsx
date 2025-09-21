'use client';
import React, { useEffect, useState } from 'react';
import '../styles/chartSwitcher.css';
import BarChart from '@/components/BarChart';
import Donut from '@/components/donutGrafic';
import LinePL from '@/components/LinePL';
import TopBars from '@/components/TopBars';

export default function ChartSwitcher({ summary }: { summary: any }) {
  type Tab = 'bars' | 'donut' | 'line' | 'top';
  const [tab, setTab] = useState<Tab>('bars');

  const barsData = Object.entries(
    summary.transactions.reduce((acc: any, t: any) => {
      const month = new Date(t.created_at).toLocaleString('en-US', { month: 'short' });
      acc[month] = (acc[month] || 0) + Number(t.total_amount);
      return acc;
    }, {})
  ).map(([label, value]) => ({ label, value: value as number }));

  const donutCount = [
    { label: 'Invested', value: summary.invested_total },
    { label: 'Earned', value: summary.earned_total },
  ];

  const plTx = summary.transactions.map((t: any) => ({
    date: t.created_at,
    type: t.transaction_type,
    amount: t.total_amount,
  }));

  const stockGrouped = summary.transactions.reduce((acc: any, t: any) => {
    acc[t.stock_symbol] = (acc[t.stock_symbol] || 0) + Number(t.total_amount);
    return acc;
  }, {});
  const topData = Object.entries(stockGrouped)
    .map(([name, amount]) => ({ name, amount: amount as number }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  return (
    <section className="chartPanel">
      <nav className="chartMenu">
        {(['bars', 'donut', 'line', 'top'] as Tab[]).map((key) => (
          <button
            key={key}
            className={`chartBtnOption ${tab === key ? 'chartBtnActive' : ''}`}
            onClick={() => setTab(key)}
          >
            {key === 'bars' && 'Bars'}
            {key === 'donut' && 'Donut'}
            {key === 'line' && 'Line P&L'}
            {key === 'top' && 'Top 5'}
          </button>
        ))}
      </nav>

      <div className="chartArea">
        {tab === 'bars' && <BarChart title="Net by Month" data={barsData} highlightIndex={2} />}
        {tab === 'donut' && <Donut title="Invested vs Earned" data={donutCount} />}
        {tab === 'line' && <LinePL title="Cumulative P&L" data={plTx} />}
        {tab === 'top' && <TopBars title="Top 5 by Amount" data={topData} limit={5} />}
      </div>
    </section>
  );
}
