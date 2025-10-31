"use client";
import React, { useEffect, useState, useRef } from "react";
import "../styles/StockApproval.css";

type StockItem = {
  id?: number;
  symbol: string;
  name: string;
  currentPrice: number;
  changePct: number;
  last30d: number[];
  targetPrice: number;
  recommendation: string;
  is_active?: boolean;
};

export default function StockManager() {
  const BASE_URL = "http://localhost:8000/api/alpha-vantage/stocks";
  const REFRESH_INTERVAL = 60000;

  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [systemStocks, setSystemStocks] = useState<StockItem[]>([]);
  const [inactiveStocks, setInactiveStocks] = useState<StockItem[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [tab, setTab] = useState<"pending" | "system" | "inactive">("pending");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };
  const fetchApprovedStocks = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${BASE_URL}/approved/`);
      if (!response.ok) throw new Error("Error al obtener stocks activas");
      const data = await response.json();

      const approved: StockItem[] = (data.data || []).map((d: any) => ({
        id: d.id,
        symbol: d.symbol,
        name: d.name,
        currentPrice: d.currentPrice ?? d.last_price ?? 0,
        changePct: d.changePct ?? d.variation ?? 0,
        last30d: [],
        targetPrice: 0,
        recommendation: d.recommendation || "HOLD",
        is_active: d.is_active ?? true,
      }));

      const localRes = await fetch(`${BASE_URL}/inactive/`);
      const localData = localRes.ok ? await localRes.json() : { data: [] };

      const localStocks: StockItem[] = (localData.data || []).map((s: any) => ({
        id: s.id,
        symbol: s.symbol,
        name: s.name,
        currentPrice: s.last_price ?? 0,
        changePct: s.variation ?? 0,
        last30d: [],
        targetPrice: 0,
        recommendation: s.recommendation || "HOLD",
        is_active: s.is_active ?? false,
      }));

      const merged = [
        ...approved,
        ...localStocks.filter(
          (s) => !approved.some((a) => a.symbol === s.symbol)
        ),
      ];

      setSystemStocks(merged);
    } catch (err) {
      console.error("Error cargando stocks:", err);
      setSystemStocks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchInactiveStocks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/inactive/`);
      if (!response.ok) throw new Error("Error al obtener stocks inactivas");
      const data = await response.json();

      const inactive: StockItem[] = (data.data || []).map((s: any) => ({
        id: s.id,
        symbol: s.symbol,
        name: s.name,
        currentPrice: s.last_price || 0,
        changePct: s.variation || 0,
        last30d: [],
        targetPrice: 0,
        recommendation: s.recommendation || "HOLD",
        is_active: s.is_active,
      }));

      setInactiveStocks(inactive);
    } catch {
      setInactiveStocks([]);
    } finally {
      setLoading(false);
    }
  };

  const approveStocks = async (stocksToApprove: StockItem[]) => {
    const response = await fetch(`${BASE_URL}/approve/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stocks: stocksToApprove.map((s) => ({
          symbol: s.symbol,
          name: s.name,
        })),
      }),
    });
    return await response.json();
  };

  const toggleStockStatus = async (ids: number[], activate: boolean) => {
    try {
      const results = await Promise.all(
        ids.map(async (id) => {
          const res = await fetch(`${BASE_URL}/${id}/toggle/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });
          return res.ok ? await res.json() : null;
        })
      );

      const updated = results.filter((r) => r !== null);

      if (activate) {
        const reactivated = inactiveStocks.filter((s) =>
          selected.includes(s.symbol)
        );
        setInactiveStocks((prev) =>
          prev.filter((s) => !selected.includes(s.symbol))
        );
        setSystemStocks((prev) => [
          ...prev,
          ...reactivated.map((s) => ({ ...s, is_active: true })),
        ]);
        showToast(`✅ ${updated.length} stock(s) reactivadas`);
      } else {
        const removed = systemStocks.filter((s) =>
          selected.includes(s.symbol)
        );
        setSystemStocks((prev) =>
          prev.filter((s) => !selected.includes(s.symbol))
        );
        setInactiveStocks((prev) => [
          ...prev,
          ...removed.map((s) => ({ ...s, is_active: false })),
        ]);
        showToast(`⚠️ ${updated.length} stock(s) desactivadas`);
      }
    } catch {
      showToast("Error cambiando estado de stocks");
    }
  };

  useEffect(() => {
    if (tab === "pending") {
      const stored = localStorage.getItem("stocksToTheSystem");
      setStocks(stored ? JSON.parse(stored) : []);
      setLoading(false);
    } else if (tab === "system") {
      fetchApprovedStocks();
    } else if (tab === "inactive") {
      fetchInactiveStocks();
    }
  }, [tab]);

  useEffect(() => {
    if (tab !== "system") return;

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${BASE_URL}/refresh/`, { method: "POST" });
        if (res.ok) {
          console.log("✅ Stocks updated in DB");
          fetchApprovedStocks();
        }
      } catch (err) {
        console.error("Error refreshing stocks:", err);
      }
    }, REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [tab]);

  const toggleSelect = (symbol: string) => {
    setSelected((prev) =>
      prev.includes(symbol)
        ? prev.filter((s) => s !== symbol)
        : [...prev, symbol]
    );
  };

  const handleConfirm = async () => {
    if (tab === "pending") {
      const toApprove = stocks.filter((s) => selected.includes(s.symbol));
      await approveStocks(toApprove);
      const remaining = stocks.filter((s) => !selected.includes(s.symbol));
      localStorage.setItem("stocksToTheSystem", JSON.stringify(remaining));
      setStocks(remaining);
      fetchApprovedStocks();
      showToast("✅ Stocks aprobadas correctamente");
    } else if (tab === "system") {
      const ids = systemStocks
        .filter((s) => selected.includes(s.symbol))
        .map((s) => s.id!) as number[];
      await toggleStockStatus(ids, false);
    } else if (tab === "inactive") {
      const ids = inactiveStocks
        .filter((s) => selected.includes(s.symbol))
        .map((s) => s.id!) as number[];
      await toggleStockStatus(ids, true);
    }
    setSelected([]);
    setShowModal(false);
  };

  const currentStocks =
    tab === "pending"
      ? stocks
      : tab === "system"
      ? systemStocks
      : inactiveStocks;

  return (
    <section className="approval-container">
      <div className="tabs-container">
        <button
          className={`tab-btn ${tab === "pending" ? "active" : ""}`}
          onClick={() => setTab("pending")}
        >
          Pending Stocks <span className="tab-count">({stocks.length})</span>
        </button>
        <button
          className={`tab-btn ${tab === "system" ? "active" : ""}`}
          onClick={() => setTab("system")}
        >
          All Stocks <span className="tab-count">({systemStocks.length})</span>
        </button>
        <button
          className={`tab-btn ${tab === "inactive" ? "active" : ""}`}
          onClick={() => setTab("inactive")}
        >
          Inactive <span className="tab-count">({inactiveStocks.length})</span>
        </button>
      </div>
      <div className="approval-table">
        <div className="approval-header">
          <div></div>
          <div>Symbol</div>
          <div>Name</div>
          <div>Current Price</div>
          <div>Target Price</div>
          <div>Change %</div>
          <div>Status</div>
        </div>

        {loading ? (
          <div className="approval-empty">
            <div className="loading-spinner"></div>
            <p>Loading data...</p>
          </div>
        ) : currentStocks.length === 0 ? (
          <div className="approval-empty">
            {tab === "pending"
              ? "No pending stocks to review."
              : tab === "system"
              ? "No stocks found in system."
              : "No inactive stocks."}
          </div>
        ) : (
          currentStocks.map((s) => (
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
              <div className="price">Q.{s.currentPrice?.toFixed(2) || 0}</div>
              <div className="price">Q.{s.targetPrice?.toFixed(2) || 0}</div>
              <div>
                <span
                  className={`change-badge ${
                    s.changePct >= 0 ? "positive" : "negative"
                  }`}
                >
                  {s.changePct >= 0 ? "+" : ""}
                  {s.changePct}%
                </span>
              </div>
              <div>
                <span
                  className={`status-dot ${
                    s.is_active ? "active-dot" : "inactive-dot"
                  }`}
                  title={s.is_active ? "Active" : "Inactive"}
                ></span>
              </div>
            </div>
          ))
        )}
      </div>

      {currentStocks.length > 0 && (
        <div className="approval-footer">
          <button
            className={`confirm-btn ${tab === "system" ? "remove-btn" : ""}`}
            onClick={() => setShowModal(true)}
            disabled={selected.length === 0}
          >
            {tab === "pending"
              ? "Confirm Approval"
              : tab === "system"
              ? "Remove Selected"
              : "Re-Approve Selected"}
          </button>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>
              {tab === "pending"
                ? "Confirm Approval"
                : tab === "system"
                ? "Remove Stocks"
                : "Re-Activate Stocks"}
            </h3>
            <p>
              Are you sure you want to{" "}
              {tab === "pending"
                ? "approve"
                : tab === "system"
                ? "remove"
                : "reactivate"}{" "}
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
                Yes,{" "}
                {tab === "pending"
                  ? "Approve"
                  : tab === "system"
                  ? "Remove"
                  : "Reactivate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast-notification">{toast}</div>}
    </section>
  );
}
