'use client';
import React, { useState, useMemo } from 'react';
import '../styles/chartSwitcher.css';

import HeatmapActivity from '@/components/HeatmapActivity';
import PerformanceChart from '@/components/PerformanceChart';
import CumulativeChart from '@/components/CumulativeChart';

type TxType = 'buy' | 'sell';

type TxRow = {
  created_at: string;
  transaction_type: TxType;
  total_amount: number;
  stock_symbol?: string;
};

type Summary = {
  earned_total: number;
  invested_total: number;
  buy_count: number;
  sell_count: number;
  transactions_count: number;
  transactions: TxRow[];
};

type Props = {
  summary: Summary;
  rangeType?: 'Today' | 'Week' | 'Month' | 'Year' | 'Custom';
  rangeDates?: { start: string; end: string } | null;
};

export default function ChartSwitcher({
  summary,
  rangeType = 'Month',
  rangeDates = null,
}: Props) {
  type Tab = 'heatmap' | 'performance' | 'cumulative';
  const [tab, setTab] = useState<Tab>('performance'); 

 
  const heatmapData = useMemo(() => summary.transactions, [summary.transactions]);

  return (
    <section className="chartPanel">
      <nav className="chartMenu">
        {(['performance', 'cumulative'] as Tab[]).map((key) => (
          <button
            key={key}
            className={`chartBtnOption ${tab === key ? 'chartBtnActive' : ''}`}
            onClick={() => setTab(key)}
          >
            {key === 'performance' && 'Performance'}
            {key === 'cumulative' && 'Cumulative'}
          </button>
        ))}
      </nav>


      <div className="chartArea">
        {/* el heatmap (no me gusto como quedo)*/}
        {/* {tab === 'heatmap' && (
          <HeatmapActivity data={heatmapData} rangeType={rangeType} />
        )} */}

        {tab === 'performance' && (
          <PerformanceChart
            summary={summary}
            rangeType={rangeType}
            rangeDates={rangeDates}
          />
        )}

        {tab === 'cumulative' && (
          <CumulativeChart
            summary={summary}
            rangeType={rangeType}
            rangeDates={rangeDates}
          />
        )}
      </div>
    </section>
  );
}
