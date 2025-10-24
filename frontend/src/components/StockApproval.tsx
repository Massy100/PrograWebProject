"use client";

import React, { useEffect, useState } from "react";
import "../styles/StockApproval.css";

type StockItem = {
  symbol: string;
  name: string;
  currentPrice: number;
  changePct: number;
  last30d: number[];
  targetPrice: number;
  recommendation: string;
};

export default function StockManager() {
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [systemStocks, setSystemStocks] = useState<StockItem[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [tab, setTab] = useState<"pending" | "system">("pending");
  const [loading, setLoading] = useState(true);

  // Función para obtener datos reales de la API
  const fetchRealStockData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/alpha-vantage/stocks/real-data/');
      
      if (!response.ok) {
        throw new Error('Failed to fetch stock data');
      }
      
      const data = await response.json();
      
      // Transformar datos de la API al formato que necesita el componente
      const realStocks: StockItem[] = data.data.map((stockData: any) => {
        const variation = parseFloat(stockData.variation) || 0;
        
        let recommendation = 'HOLD';
        if (variation > 5) recommendation = 'STRONG BUY';
        else if (variation > 2) recommendation = 'BUY';
        else if (variation < -5) recommendation = 'STRONG SELL';
        else if (variation < -2) recommendation = 'SELL';

        return {
          symbol: stockData.symbol,
          name: stockData.name || stockData.symbol,
          currentPrice: parseFloat(stockData.last_price) || 0,
          changePct: variation,
          last30d: [], // La API actual no proporciona datos históricos
          targetPrice: 0, // Podrías calcular esto si tienes más datos
          recommendation: recommendation
        };
      });

      // Actualizar systemStocks con datos reales
      setSystemStocks(realStocks);
      
    } catch (error) {
      console.error('Error fetching real stock data:', error);
      // Fallback a datos mock si la API falla
      setSystemStocks(mockSystemStocks);
    } finally {
      setLoading(false);
    }
  };

  // Datos mock de fallback
  const mockSystemStocks: StockItem[] = [
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      currentPrice: 262.82,
      changePct: 1.25,
      last30d: [250, 255, 260, 258, 262],
      targetPrice: 280,
      recommendation: "BUY",
    },
    {
      symbol: "MSFT",
      name: "Microsoft Corp.",
      currentPrice: 523.61,
      changePct: 0.59,
      last30d: [510, 515, 520, 518, 523],
      targetPrice: 540,
      recommendation: "BUY",
    },
    {
      symbol: "NVDA",
      name: "NVIDIA Corp.",
      currentPrice: 112.45,
      changePct: 3.25,
      last30d: [105, 108, 110, 111, 112],
      targetPrice: 120,
      recommendation: "STRONG BUY",
    },
  ];

  useEffect(() => {
    if (tab === "pending") {
      const stored = localStorage.getItem("stocksToTheSystem");
      setStocks(stored ? JSON.parse(stored) : []);
    } else {
      // Cargar datos reales cuando se selecciona la pestaña "In System"
      fetchRealStockData();
    }
  }, [tab]);

  // Función para actualizar precios en tiempo real (cada 30 segundos)
  useEffect(() => {
    if (tab === "system") {
      const interval = setInterval(() => {
        fetchRealStockData();
      }, 30000); // Actualizar cada 30 segundos

      return () => clearInterval(interval);
    }
  }, [tab]);

  const toggleSelect = (symbol: string) => {
    setSelected((prev) =>
      prev.includes(symbol)
        ? prev.filter((s) => s !== symbol)
        : [...prev, symbol]
    );
  };

  const handleConfirm = () => {
    if (tab === "pending") {
      // Estas son las acciones que el admin ya confirmó que quiere ingresar al sistema
      const approved = stocks.filter((s) => selected.includes(s.symbol));

      // Aquí se tendría que agregar el back para mandar esas acciones al backend
      console.log("Approved stocks to send:", approved);

      // Elimina del localStorage las acciones que fueron aprobadas
      const remaining = stocks.filter((s) => !selected.includes(s.symbol));
      localStorage.setItem("stocksToTheSystem", JSON.stringify(remaining));
      setStocks(remaining);
    } else {
      // Estas son las acciones que el admin decidió eliminar del sistema
      const removedStocks = systemStocks.filter((s) =>
        selected.includes(s.symbol)
      );

      // Aquí se tendría que agregar el back para eliminar estas acciones del sistema
      console.log("Removed system stocks:", removedStocks);

      // Actualiza el estado eliminando las acciones seleccionadas
      const remaining = systemStocks.filter(
        (s) => !selected.includes(s.symbol)
      );
      setSystemStocks(remaining);
    }

    // Limpia la selección y cierra el modal
    setSelected([]);
    setShowModal(false);
  };

  const currentStocks = tab === "pending" ? stocks : systemStocks;
  
  return (
    <section className="approval-container">
      <div className="tabs-container">
        <button
          className={`tab-btn ${tab === "pending" ? "active" : ""}`}
          onClick={() => setTab("pending")}
        >
          Pending Stocks{" "}
          <span className="tab-count">
            ({stocks.length > 0 ? stocks.length : 0})
          </span>
        </button>
        <button
          className={`tab-btn ${tab === "system" ? "active" : ""}`}
          onClick={() => setTab("system")}
        >
          In System{" "}
          <span className="tab-count">
            ({systemStocks.length > 0 ? systemStocks.length : 0})
          </span>
          {tab === "system" && loading && " 🔄"}
        </button>
      </div>

      <div className="approval-table">
        <div className="approval-header">
          <div></div>
          <div>Symbol</div>
          <div>Name</div>
          <div>Trend (30d)</div>
          <div>Current Price</div>
          <div>Target Price</div>
          <div>Change %</div>
        </div>

        {loading && tab === "system" ? (
          <div className="approval-empty">
            <div className="loading-spinner"></div>
            <p>Loading real-time stock data...</p>
          </div>
        ) : currentStocks.length === 0 ? (
          <div className="approval-empty">
            {tab === "pending"
              ? "No pending stocks to review."
              : "No stocks currently in the system."}
          </div>
        ) : (
          currentStocks.map((s) => {
            const trendUp = s.last30d[s.last30d.length - 1] >= s.last30d[0];
            return (
              <div
                key={s.symbol}
                className={`approval-row ${
                  selected.includes(s.symbol) ? "selected-row" : ""
                }`}
              >
                <div>
                  <input
                    type="checkbox"
                    checked={selected.includes(s.symbol)}
                    onChange={() => toggleSelect(s.symbol)}
                  />
                </div>
                <div className="symbol-cell">{s.symbol}</div>
                <div>{s.name}</div>
                <div>
                  <Sparkline
                    data={s.last30d}
                    positiveColor={trendUp ? "#1AC963" : "#F8191E"}
                    negativeColor={trendUp ? "#1AC963" : "#F8191E"}
                  />
                </div>
                <div className="price">Q.{s.currentPrice.toFixed(2)}</div>
                <div className="price">Q.{s.targetPrice.toFixed(2)}</div>
                <div>
                  <span
                    className={`change-badge ${
                      s.changePct >= 0 ? "positive" : "negative"
                    }`}
                  >
                    {s.changePct >= 0 ? "+" : ""}
                    {s.changePct.toFixed(2)}%
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {currentStocks.length > 0 && !loading && (
        <div className="approval-footer">
          <button
            className={`confirm-btn ${tab === "system" ? "remove-btn" : ""}`}
            onClick={() => setShowModal(true)}
            disabled={selected.length === 0}
          >
            {tab === "pending" ? "Confirm Approval" : "Remove Selected"}
          </button>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>
              {tab === "pending" ? "Confirm Approval" : "Remove Stocks"}
            </h3>
            <p>
              Are you sure you want to{" "}
              {tab === "pending" ? "approve" : "remove"}{" "}
              <strong>{selected.length}</strong> stock(s)?
            </p>
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button className="approve-btn" onClick={handleConfirm}>
                Yes, {tab === "pending" ? "Approve" : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Sparkline({
  data,
  positiveColor,
  negativeColor,
}: {
  data: number[];
  positiveColor: string;
  negativeColor: string;
}) {
  if (!data || data.length < 2) return null;

  const w = 120;
  const h = 36;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * (w - 2) + 1;
    const y = h - 1 - ((v - min) / range) * (h - 2);
    return `${x},${y}`;
  });

  const up = data[data.length - 1] >= data[0];

  return (
    <svg
      className="stocks-table-sparkline"
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      aria-hidden="true"
    >
      <polyline
        fill="none"
        stroke={up ? positiveColor : negativeColor}
        strokeWidth="2"
        points={points.join(" ")}
      />
      <polygon
        points={`1,${h - 1} ${points.join(" ")} ${w - 1},${h - 1}`}
        fill={up ? "rgba(81,174,110,0.12)" : "rgba(197,91,115,0.12)"}
      />
    </svg>
  );
}