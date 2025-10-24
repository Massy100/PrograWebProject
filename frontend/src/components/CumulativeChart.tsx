'use client';
import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import '../styles/cumulativeChart.css';

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

export default function CumulativeChart({ summary, rangeType, rangeDates }: Props) {
  const data = useMemo(() => {
    if (!summary.transactions.length) return [];

    let localTxs = summary.transactions.map((t) => ({
      ...t,
      localDate: toLocalGuatemala(t.created_at),
    }));

    if (rangeType === 'Custom' && rangeDates) {
      const start = parseLocalDate(rangeDates.start);
      const end = parseLocalDate(rangeDates.end);
      localTxs = localTxs.filter(
        (t) => t.localDate >= start && t.localDate <= end
      );
    }

    const grouped: Record<string, { invested: number; earned: number; dateObj: Date }> = {};

    localTxs.forEach((t) => {
      const date = t.localDate;
      let key = '';

      switch (rangeType) {
        case 'Today':
          key = `${date.getHours().toString().padStart(2, '0')}:00`;
          break;
        case 'Week':
          key = date.toLocaleDateString('en-US', {
            weekday: 'short',
            timeZone: 'America/Guatemala',
          });
          break;
        case 'Month':
          key = date.getDate().toString();
          break;
        case 'Year':
          key = date.toLocaleString('en-US', {
            month: 'short',
            timeZone: 'America/Guatemala',
          });
          break;
        case 'Custom':
          key = date.toISOString().split('T')[0];
          break;
        default:
          key = date.toISOString().split('T')[0];
      }

      if (!grouped[key]) grouped[key] = { invested: 0, earned: 0, dateObj: date };
      if (t.transaction_type === 'buy')
        grouped[key].invested += Number(t.total_amount);
      else grouped[key].earned += Number(t.total_amount);
    });

    let rows = Object.entries(grouped)
      .map(([key, val]) => ({
        key,
        dateObj: val.dateObj,
        invested: val.invested,
        earned: val.earned,
      }))
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

    if ((rangeType === 'Custom' && rangeDates) || rangeType === 'Month') {
      const start =
        rangeType === 'Month'
          ? new Date(
              rows[0]?.dateObj.getFullYear() || new Date().getFullYear(),
              rows[0]?.dateObj.getMonth() || new Date().getMonth(),
              1
            )
          : parseLocalDate(rangeDates!.start);
      const end =
        rangeType === 'Month'
          ? new Date(
              rows[0]?.dateObj.getFullYear() || new Date().getFullYear(),
              (rows[0]?.dateObj.getMonth() || new Date().getMonth()) + 1,
              0
            )
          : parseLocalDate(rangeDates!.end);

      const diffDays = Math.floor(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      );
      const filled: typeof rows = [];

      for (let i = 0; i <= diffDays; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const key = d.toISOString().split('T')[0];
        const found = rows.find((r) => r.key === key);
        filled.push(found || { key, dateObj: d, invested: 0, earned: 0 });
      }

      rows = filled.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
    }

    let investedAcc = 0;
    let earnedAcc = 0;

    return rows.map((r) => {
      investedAcc += r.invested;
      earnedAcc += r.earned;

      return {
        label:
          rangeType === 'Custom'
            ? r.dateObj.toLocaleDateString('es-GT', {
                month: 'short',
                day: 'numeric',
                timeZone: 'America/Guatemala',
              })
            : rangeType === 'Month'
            ? r.dateObj.getDate().toString()
            : r.key,
        invested: investedAcc,
        earned: earnedAcc,
      };
    });
  }, [summary.transactions, rangeType, rangeDates]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="cumulative-tooltip">
          <p className="cumulative-tooltip-date">
            {payload[0].payload.label}
          </p>
          {payload.map((p: any, i: number) => (
            <p
              key={i}
              style={{
                color: p.stroke,
                margin: 0,
                fontWeight: 600,
              }}
            >
              {p.name}: Q{p.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="cumulative-container">
      <div className="cumulative-header">
        <h3 className="cumulative-title">Cumulative Investment vs Earnings</h3>
        <p className="cumulative-range">{rangeType}</p>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#EDEDF2" />
          <XAxis
            dataKey="label"
            tick={{ fill: '#646C79', fontSize: 11 }}
            axisLine={false}
          />
          <YAxis
            tick={{ fill: '#646C79', fontSize: 11 }}
            axisLine={false}
            tickFormatter={(v) => `Q${(v / 1000).toFixed(1)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" height={36} />
          <ReferenceLine y={0} stroke="#EDEDF2" />

          <Line
            type="monotone"
            dataKey="invested"
            stroke="#2779F5"
            strokeWidth={2}
            dot={false}
            name="Invested"
          />
          <Line
            type="monotone"
            dataKey="earned"
            stroke="#02C23E"
            strokeWidth={2}
            dot={false}
            name="Earned"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
