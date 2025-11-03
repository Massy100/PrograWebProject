"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import "./StockPage.css";
import dynamic from "next/dynamic";
import { BuyStockSidebar } from "@/components/BuyStockSidebar";

const StockChart = dynamic(() => import("@/components/StockChart") as any, {
  ssr: false,
  loading: () => <div className="chart-loading">Loading chart...</div>,
});

type CartItem = {
  portfolio: string;
  stockName: string;
  stockSymbol: string;
  stockPrice: number;
  quantity: number;
  total: number;
  date: string;
};

interface StockInfo {
  symbol: string;
  name: string;
  category?: string;
  last_price: number;
  variation: number;
  updated_at: string;
  created_at: string;
  is_active: boolean;
}

interface StockHistoryPoint {
  date: string;
  value: number;
}

export default function StockOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const symbol = params.id as string;

  const [stock, setStock] = useState<StockInfo | null>(null);
  const [history, setHistory] = useState<StockHistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);

  const [role, setRole] = useState<string | null>(null);
  const [verified, setVerified] = useState<boolean>(false);
  const [completed, setCompleted] = useState<boolean>(false);

  const isClientVerified = role === "client" && verified && completed;

  useEffect(() => {
    const raw = document.cookie.split("; ").find((c) => c.startsWith("auth="));
    if (raw) {
      try {
        const parsed = JSON.parse(decodeURIComponent(raw.split("=")[1]));
        setRole(parsed.role || null);
        setVerified(parsed.verified || false);
        setCompleted(parsed.completed || false);
      } catch (err) {
        console.error("Error parsing auth cookie:", err);
      }
    }
  }, []);

  const fetchStockData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stocks/${symbol}/`);
      if (!res.ok) throw new Error("Stock not found");
      const data = await res.json();

      setStock({
        symbol: data.symbol,
        name: data.name,
        category: data.category?.name || "Uncategorized",
        last_price: data.last_price || 0,
        variation: data.variation || 0,
        updated_at: data.updated_at || "-",
        created_at: data.created_at || "-",
        is_active: data.is_active,
      });
    } catch (error) {
      console.error("Error fetching stock info:", error);
      setStock(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchStockHistory = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stocks/${symbol}/history/`);
      if (!res.ok) throw new Error("Failed to fetch price history");
      const data = await res.json();

      const formatted = data.map((p: any) => ({
        date: new Date(p.recorded_at).toLocaleDateString(),
        value: p.price,
      }));
      setHistory(formatted);
    } catch (error) {
      console.error("Error fetching stock history:", error);
      setHistory([]);
    }
  };

  useEffect(() => {
    if (!symbol) return;
    fetchStockData();
    fetchStockHistory();
  }, [symbol]);

  const handleAddToCart = (newItem: CartItem) => {
    const storedCart = localStorage.getItem("shoppingCart");
    const cart: CartItem[] = storedCart ? JSON.parse(storedCart) : [];

    const existingIndex = cart.findIndex(
      (item) =>
        item.stockSymbol === newItem.stockSymbol &&
        item.portfolio === newItem.portfolio
    );

    if (existingIndex !== -1) {
      cart[existingIndex] = {
        ...cart[existingIndex],
        quantity: newItem.quantity,
        total: newItem.stockPrice * newItem.quantity,
        date: newItem.date,
      };
    } else {
      cart.push(newItem);
    }

    localStorage.setItem("shoppingCart", JSON.stringify(cart));
  };

  if (loading) {
    return (
      <div className="stock-page">
        <p className="loading-text">Loading stock data...</p>
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="stock-page">
        <p className="error-text">Stock not found.</p>
      </div>
    );
  }

  const isPositive = stock.variation >= 0;

  const handleUnauthorized = () => {
    alert("❌ You must be a verified client to buy stocks.");
    router.push("/");
  };

  return (
    <div className="stock-page">
      <a className="backBtn" href="/stocks">
        ← Back
      </a>

      <section className="stock-hero">
        <div>
          <h1 className="hero-title">
            {stock.name} <br /> ({stock.symbol})
          </h1>
          <p className="hero-subtitle">{stock.category}</p>
        </div>

        {isClientVerified ? (
          <button className="buy-stock-btn" onClick={() => setShowSidebar(true)}>
            Add Stock
          </button>
        ) : (
          <button
            className="buy-stock-btn disabled"
            onClick={handleUnauthorized}
          >
            Restricted Action
          </button>
        )}
      </section>

      <section className="stock-metrics">
        <div className="metric"><span>SYMBOL</span><p>{stock.symbol}</p></div>
        <div className="metric"><span>LAST PRICE</span><p>$.{stock.last_price}</p></div>
        <div className="metric">
          <span>VARIATION</span>
          <p className={isPositive ? "positive" : "negative"}>
            {isPositive ? "+" : ""}
            {stock.variation}%
          </p>
        </div>
        <div className="metric">
          <span>STATUS</span>
          <p className={stock.is_active ? "active" : "inactive"}>
            {stock.is_active ? "Active" : "Inactive"}
          </p>
        </div>
      </section>

      <div className="stock-chart-section">
        <StockChart name={stock.symbol} data={history} theme="dark" />
      </div>

      <div className="stock-info-section">
        <div className="stock-info-card">
          <h3>Stock Information</h3>
          <div className="stock-info-row"><span>Symbol</span><p>{stock.symbol}</p></div>
          <div className="stock-info-row"><span>Name</span><p>{stock.name}</p></div>
          <div className="stock-info-row"><span>Category</span><p>{stock.category}</p></div>
          <div className="stock-info-row"><span>Created At</span><p>{stock.created_at}</p></div>
          <div className="stock-info-row"><span>Last Updated</span><p>{stock.updated_at}</p></div>
          <div className="stock-info-row">
            <span>Status</span>
            <div className={`status-badge ${stock.is_active ? "active" : "inactive"}`}>
              {stock.is_active ? "Active" : "Inactive"}
            </div>
          </div>
        </div>

        <div className="stock-info-card">
          <h3>Market Data</h3>
          <div className="stock-info-row"><span>Last Price</span><p className="stock-price">Q{stock.last_price.toFixed(2)}</p></div>
          <div className="stock-info-row">
            <span>Variation</span>
            <p className={`stock-variation ${isPositive ? "positive" : "negative"}`}>
              {isPositive ? "+" : ""}
              {stock.variation}%
            </p>
          </div>
          <div className="stock-info-row">
            <span>Market Trend</span>
            <p className={`trend ${isPositive ? "up" : "down"}`}>
              {isPositive ? "Upward" : "Downward"}
            </p>
          </div>
        </div>
      </div>


      {isClientVerified && (
        <BuyStockSidebar
          isOpen={showSidebar}
          onClose={() => setShowSidebar(false)}
          stockName={stock.name}
          stockSymbol={stock.symbol}
          stockPrice={stock.last_price}
          portfolios={["Main Portfolio", "Growth Fund", "Tech Picks"]}
          onConfirm={(data) => {
            const newCartItem: CartItem = {
              portfolio: data.portfolio,
              stockName: stock.name,
              stockSymbol: stock.symbol,
              stockPrice: stock.last_price,
              quantity: data.quantity,
              total: stock.last_price * data.quantity,
              date: new Date().toLocaleString(),
            };
            handleAddToCart(newCartItem);
            setShowSidebar(false);
          }}
        />
      )}
    </div>
  );
}
