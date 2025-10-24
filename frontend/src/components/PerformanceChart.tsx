'use client';
import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import '../styles/performanceChart.css';

type TxType = 'buy' | 'sell';

type TxRow = {
  created_at: string;
  transaction_type: TxType;
  total_amount: number;
};

type Summary = {
  transactions: TxRow[];
};

type Props = {
  summary: Summary;
  rangeType: 'Today' | 'Week' | 'Month' | 'Year' | 'Custom';
  rangeDates?: { start: string; end: string } | null;
};

function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0);
}

function toLocalGuatemala(dateStr: string): Date {
  const d = new Date(dateStr);
  const offsetMs = -6 * 60 * 60 * 1000; 
  return new Date(d.getTime() + offsetMs);
}

export default function PerformanceChart({ summary, rangeType, rangeDates }: Props) {
  const baseLabels = useMemo(() => {
    const labels: string[] = [];
    const today = new Date();

    switch (rangeType) {
      case 'Today':
        for (let i = 0; i < 24; i++) labels.push(`${i.toString().padStart(2, '0')}:00`);
        break;
      case 'Week':
        labels.push('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun');
        break;
      case 'Month': {
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        for (let i = 1; i <= daysInMonth; i++) labels.push(i.toString());
        break;
      }
      case 'Year':
        labels.push(
          'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        );
        break;
      case 'Custom':
        if (rangeDates) {
          const start = parseLocalDate(rangeDates.start);
          const end = parseLocalDate(rangeDates.end);
          const diffDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          for (let i = 0; i <= diffDays; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
          }
        }
        break;
      default:
        break;
    }

    return labels;
  }, [rangeType, rangeDates]);

  const data = useMemo(() => {
    const grouped: Record<string, { invested: number; earned: number }> = {};
    let totalInvested = 0;
    let totalEarned = 0;

    let filtered = summary.transactions.map((t) => ({
      ...t,
      localDate: toLocalGuatemala(t.created_at),
    }));

    if (rangeType === 'Custom' && rangeDates) {
      const start = parseLocalDate(rangeDates.start);
      const end = parseLocalDate(rangeDates.end);
      filtered = filtered.filter((t) => t.localDate >= start && t.localDate <= end);
    }

    filtered.forEach((t) => {
      const date = t.localDate;
      let key = '';

      switch (rangeType) {
        case 'Today':
          key = `${date.getHours().toString().padStart(2, '0')}:00`;
          break;
        case 'Week':
          key = date.toLocaleDateString('en-US', { weekday: 'short' });
          break;
        case 'Month':
          key = date.getDate().toString();
          break;
        case 'Year':
          key = date.toLocaleString('en-US', { month: 'short' });
          break;
        case 'Custom':
          key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          break;
        default:
          key = date.toISOString().split('T')[0];
      }

      if (!grouped[key]) grouped[key] = { invested: 0, earned: 0 };
      if (t.transaction_type === 'buy') grouped[key].invested += Number(t.total_amount);
      else grouped[key].earned += Number(t.total_amount);
    });


    return baseLabels.map((label) => {
      const vals = grouped[label] || { invested: 0, earned: 0 };
      totalInvested += vals.invested;
      totalEarned += vals.earned;
      const net = totalEarned - totalInvested;
      return {
        label,
        net,
        positive: net >= 0 ? net : 0,
        negative: net < 0 ? net : 0,
      };
    });
  }, [summary.transactions, baseLabels, rangeType, rangeDates]);


  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].payload.net;
      const color = value >= 0 ? '#02c23e' : '#ff4033';
      return (
        <div className="perf-tooltip">
          <p className="perf-tooltip-date">{payload[0].payload.label}</p>
          <p className="perf-tooltip-balance" style={{ color }}>
            Balance: {value >= 0 ? '+' : ''}
            {value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="perf-container">
      <div className="perf-header">
        <h3 className="perf-title">Performance (Ganancias / Pérdidas)</h3>
        <p className="perf-range">{rangeType}</p>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F2F2F2" />
          <XAxis dataKey="label" tick={{ fill: '#646C79', fontSize: 11 }} axisLine={false} />
          <YAxis
            tick={{ fill: '#646C79', fontSize: 11 }}
            axisLine={false}
            tickFormatter={(v) => `${v > 0 ? '+' : ''}${v / 1000}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="#EDEDF2" strokeWidth={1.5} />

          <Area
            type="monotone"
            dataKey="positive"
            stroke="#02c23e"
            fill="#E3FCF0"
            strokeWidth={2}
            fillOpacity={1}
          />
          <Area
            type="monotone"
            dataKey="negative"
            stroke="#ff4033"
            fill="#FEF2DC"
            strokeWidth={2}
            fillOpacity={1}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
