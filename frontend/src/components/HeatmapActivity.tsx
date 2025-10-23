'use client';
import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  CartesianGrid,
  ComposedChart,
  Rectangle,
  Text,
} from 'recharts';
import '../styles/heatmapActivity.css';

type Transaction = {
  created_at: string;
  transaction_type: 'buy' | 'sell';
  total_amount: number;
};

type Props = {
  data: Transaction[];
  rangeType: 'Today' | 'Week' | 'Month' | 'Year' | 'Custom';
};

export default function HeatmapActivity({ data, rangeType }: Props) {
  const [hoveredCell, setHoveredCell] = useState<{
    x: string;
    y: string;
    buy: number;
    sell: number;
    total: number;
  } | null>(null);

  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // === Etiquetas base según el rango ===
  const baseLabels = useMemo(() => {
    switch (rangeType) {
      case 'Today':
        return Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
      case 'Week':
        return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      case 'Month':
        return Array.from({ length: 31 }, (_, i) => (i + 1).toString());
      case 'Year':
        return [
          'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
        ];
      default:
        return [];
    }
  }, [rangeType]);

  // === Agrupar datos ===
  const groupedData = useMemo(() => {
    const grid: Record<string, Record<string, { buy: number; sell: number; total: number }>> = {};

    let yBlocks: string[] = [];
    switch (rangeType) {
      case 'Today':
        yBlocks = ['Activity'];
        break;
      case 'Week':
      case 'Month':
        yBlocks = ['00–06h', '06–12h', '12–18h', '18–24h'];
        break;
      case 'Year':
        yBlocks = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        break;
      default:
        yBlocks = ['All'];
    }

    yBlocks.forEach((y) => {
      grid[y] = {};
      baseLabels.forEach((x) => {
        grid[y][x] = { buy: 0, sell: 0, total: 0 };
      });
    });

    data.forEach((t) => {
      const date = new Date(t.created_at);
      let xKey = '';
      let yKey = '';

      switch (rangeType) {
        case 'Today':
          xKey = `${date.getHours().toString().padStart(2, '0')}:00`;
          yKey = 'Activity';
          break;
        case 'Week':
          xKey = date.toLocaleDateString('en-US', { weekday: 'short' });
          const hourW = date.getHours();
          if (hourW < 6) yKey = '00–06h';
          else if (hourW < 12) yKey = '06–12h';
          else if (hourW < 18) yKey = '12–18h';
          else yKey = '18–24h';
          break;
        case 'Month':
          xKey = date.getDate().toString();
          const hourM = date.getHours();
          if (hourM < 6) yKey = '00–06h';
          else if (hourM < 12) yKey = '06–12h';
          else if (hourM < 18) yKey = '12–18h';
          else yKey = '18–24h';
          break;
        case 'Year':
          xKey = date.toLocaleString('en-US', { month: 'short' });
          yKey = date.toLocaleDateString('en-US', { weekday: 'short' });
          break;
        default:
          xKey = date.toISOString().split('T')[0];
          yKey = 'All';
      }

      if (grid[yKey] && grid[yKey][xKey]) {
        grid[yKey][xKey][t.transaction_type]++;
        grid[yKey][xKey].total++;
      }
    });

    const rows: { x: string; y: string; buy: number; sell: number; total: number }[] = [];
    Object.entries(grid).forEach(([y, xVals]) => {
      Object.entries(xVals).forEach(([x, val]) => rows.push({ x, y, ...val }));
    });
    return rows;
  }, [data, baseLabels, rangeType]);

  // === Escala de color ===
  const maxTotal = Math.max(...groupedData.map((d) => d.total), 1);
  const getColor = (buy: number, sell: number, total: number) => {
    if (total === 0) return '#F2F2F2';
    const intensity = total / maxTotal;
    return buy >= sell
      ? `rgba(81,174,110,${0.25 + intensity * 0.75})`
      : `rgba(197,91,115,${0.25 + intensity * 0.75})`;
  };

  // === Ejes ===
  const xLabels = baseLabels;
  const yLabels = [...new Set(groupedData.map((d) => d.y))];
  const cellWidth = 22;
  const cellHeight = 22;

  return (
    <div className="heatmap-container" style={{ position: 'relative' }}>
      <div className="heatmap-header">
        <h3 className="heatmap-title">Activity Overview</h3>
        <div className="heatmap-legend">
          <span className="legend-label">Compras</span>
          <span className="legend-box green"></span>
          <span className="legend-label">Ventas</span>
          <span className="legend-box red"></span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={yLabels.length * cellHeight + 80}>
        <ComposedChart margin={{ top: 20, right: 20, bottom: 30, left: 70 }}>
          <CartesianGrid stroke="transparent" vertical={false} horizontal={false} />

          {/* Eje Y */}
          {yLabels.map((label, i) => (
            <Text
              key={`y-${label}`}
              x={55}
              y={i * cellHeight + 60}
              textAnchor="end"
              verticalAnchor="middle"
              fill="#646C79"
              fontSize={11}
            >
              {label}
            </Text>
          ))}

          {/* Eje X */}
          {xLabels.map((label, i) => (
            <Text
              key={`x-${label}`}
              x={i * cellWidth + 75}
              y={yLabels.length * cellHeight + 65}
              textAnchor="middle"
              fill="#646C79"
              fontSize={10}
            >
              {label}
            </Text>
          ))}

          {/* Celdas */}
          {groupedData.map((cell, i) => {
            const xIndex = xLabels.indexOf(cell.x);
            const yIndex = yLabels.indexOf(cell.y);
            return (
              <Rectangle
                key={i}
                x={xIndex * cellWidth + 60}
                y={yIndex * cellHeight + 45}
                width={cellWidth}
                height={cellHeight}
                fill={getColor(cell.buy, cell.sell, cell.total)}
                stroke="#FFFFFF"
                radius={5}
                onMouseEnter={(e) => {
                  const rect = (e.target as SVGRectElement).getBoundingClientRect();
                  const containerRect = (
                    document.querySelector('.heatmap-container') as HTMLElement
                  ).getBoundingClientRect();
                  setHoveredCell(cell);
                  setTooltipPos({
                    x: rect.x - containerRect.x + rect.width / 2,
                    y: rect.y - containerRect.y - 10,
                  });
                }}
                onMouseLeave={() => {
                  setHoveredCell(null);
                  setTooltipPos(null);
                }}
              />
            );
          })}
        </ComposedChart>
      </ResponsiveContainer>

      {/* Tooltip sobre el gráfico */}
      {hoveredCell && tooltipPos && (
        <div
          className={`heatmap-tooltip visible`}
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
          }}
        >
          <strong>{hoveredCell.x}</strong>
          <p>{hoveredCell.y}</p>
          <p style={{ color: '#51AE6E' }}>Compras: {hoveredCell.buy}</p>
          <p style={{ color: '#C55B73' }}>Ventas: {hoveredCell.sell}</p>
          <p>Total: {hoveredCell.total}</p>
        </div>
      )}
    </div>
  );
}
