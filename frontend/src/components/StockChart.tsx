import React, { useRef, useEffect, useState } from "react";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
  Plugin
} from "chart.js";
import { Line } from "react-chartjs-2";
import '../styles/StockChart.css';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

type StockPoint = { date: string; value: number };

type StockChartProProps = {
  name: string;
  data: StockPoint[];
  theme?: "light" | "dark";
};

export const StockChart: React.FC<StockChartProProps> = ({
  name,
  data,
  theme = "dark"
}) => {
  const chartRef = useRef<ChartJS<"line">>(null);
  const [range, setRange] = useState("1M");

  const openValue = data[0]?.value || 0;

  // 🎨 Colores base
  const textColor = theme === "dark" ? "#EDEDF2" : "#021631";
  const gridColor = theme === "dark" ? "rgba(255,255,255,0.1)" : "#EDEDF2";
  const baseLineColor = theme === "dark" ? "#EDEDF2" : "#EDEDF2";
  const upColor = "#02C23E";
  const downColor = "#FF4033";
  const neutralColor = "#EDEDF2";

  // 🌫️ Gradiente de fondo
  const getFillGradient = (ctx: CanvasRenderingContext2D, chartArea: any) => {
    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    gradient.addColorStop(0, "rgba(2, 194, 62, 0.12)");
    gradient.addColorStop(0.5, "rgba(255,255,255,0)");
    gradient.addColorStop(1, "rgba(255, 64, 51, 0.12)");
    return gradient;
  };

  const chartData: ChartData<"line"> = {
    labels: data.map((p) => p.date),
    datasets: [
      {
        label: `${name} price`,
        data: data.map((p) => p.value),
        borderColor: "transparent",
        borderWidth: 3,
        fill: true,
        backgroundColor: (context) => {
          const { ctx, chartArea } = context.chart;
          if (!chartArea) return "transparent";
          return getFillGradient(ctx, chartArea);
        },
        tension: 0.35,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBorderWidth: 3,
        pointHoverBackgroundColor: "#FFFFFF",
        pointHoverBorderColor: "#2779F5"
      },
      {
        label: "Open value",
        data: data.map(() => openValue),
        borderColor: baseLineColor,
        borderDash: [5, 5],
        borderWidth: 1,
        pointRadius: 0
      }
    ]
  };

  // 💫 Plugin: color basado en el destino del tramo
  const glowPlugin: Plugin<"line"> = {
    id: "glowPlugin",
    afterDatasetsDraw: (chart) => {
      const meta = chart.getDatasetMeta(0);
      const points = meta.data;
      const ctx = chart.ctx;

      ctx.save();
      ctx.lineWidth = 3;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];
        const v2 = chart.data.datasets[0].data[i + 1] as number;

        let color: string;
        if (v2 > openValue) color = upColor;
        else if (v2 < openValue) color = downColor;
        else color = neutralColor;

        ctx.shadowBlur = 10;
        ctx.shadowColor = color;
        ctx.strokeStyle = color;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }

      ctx.restore();
    }
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "nearest", intersect: false },
    animation: { duration: 600, easing: "easeInOutQuad" },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: theme === "dark" ? "#021631" : "#FFFFFF",
        titleColor: theme === "dark" ? "#FFFFFF" : "#021631",
        bodyColor: theme === "dark" ? "#FFFFFF" : "#021631",
        borderColor: "#2779F5",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context) => `$${context.formattedValue}`,
          title: (context) => `${context[0].label}`
        }
      }
    },
    scales: {
      x: {
        ticks: { color: gridColor, font: { size: 11 } },
        grid: { color: gridColor }
      },
      y: {
        ticks: { color: gridColor, font: { size: 11 } },
        grid: { color: gridColor }
      }
    },
    elements: {
      line: { borderJoinStyle: "round", borderCapStyle: "round" }
    }
  };

  useEffect(() => {
    chartRef.current?.update();
  }, [data, theme]);

  const ranges = ["1D", "1W", "1M", "3M", "1Y", "ALL"];

  return (
    <div className={`stock-chart-container ${theme}`}>
      <div className="stock-chart-header">
        <div className="stock-chart-title">{name} Stock</div>
        <div className="stock-chart-ranges">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`stock-range-btn ${r === range ? "active" : ""}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="stock-chart-graph">
        <Line ref={chartRef} data={chartData} options={options} plugins={[glowPlugin]} />
      </div>
    </div>
  );
};
