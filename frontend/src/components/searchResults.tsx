"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import CartSidebar from "../components/CartSidebar";
import {
  getActiveStocks,
  getStockByName,
  getStocksByCategory,
  getStocksByPriceRange,
  type Stock,
} from "@/services/stocks";
import "@/styles/searchResults.css";
import { useMarketStatus } from "@/hook/useMarketStatus";

function toRow(s: Stock) {
  return {
    symbol: s.symbol,
    name: s.name,
    price: s.last_price ? Number(s.last_price) : 0,
  };
}

type HeaderPublicProps = {
  isLoggedIn: boolean;
  marketOpen: boolean;
  totalAmount?: number;
};

export default function SearchResults({
  headerProps,
  title = "Search Results",
  inlineResults = false,
}: {
  headerProps: HeaderPublicProps;
  title?: string;
  inlineResults?: boolean;
}) {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [verified, setVerified] = useState<boolean>(false);
  const [completed, setCompleted] = useState<boolean>(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // 👇 nuevo: manejar carrito
  const [showCart, setShowCart] = useState(false);
  const [cartTotal, setCartTotal] = useState<number>(0);

  // 🔹 Leer cookie de autenticación
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
    setLoadingAuth(false);
  }, []);

  const isAdmin = role === "admin";
  const isClient = role === "client";
  const isClientVerified = isClient && verified && completed;
  const isLoggedIn = !!role;

  const marketOpen = useMarketStatus();

  const [rows, setRows] = useState<{ symbol: string; name: string; price: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // 👇 Escuchar clic fuera del panel de búsqueda
  useEffect(() => {
    if (!inlineResults) {
      function onDocClick(e: MouseEvent) {
        if (!open || !panelRef.current) return;
        if (!panelRef.current.contains(e.target as Node)) setOpen(false);
      }
      document.addEventListener("mousedown", onDocClick);
      return () => document.removeEventListener("mousedown", onDocClick);
    }
  }, [open, inlineResults]);

  // 🔍 Buscar acciones
  async function onSearch(params: {
    name: string;
    activeOnly: boolean;
    category: string;
    priceMin?: string;
    priceMax?: string;
  }) {
    const { name, activeOnly, category, priceMin, priceMax } = params;
    const q = (name ?? "").trim();

    setHasSearched(true);
    setOpen(true);
    setLoading(true);
    setError(null);

    try {
      if (q) {
        const one = await getStockByName(q);
        const list = one ? [one] : [];
        setRows(list.map(toRow));
      } else if (category) {
        const data = await getStocksByCategory(category);
        setRows(data.map(toRow));
      } else if (priceMin || priceMax) {
        const min = priceMin ? Number(priceMin) : undefined;
        const max = priceMax ? Number(priceMax) : undefined;
        const data = await getStocksByPriceRange(min, max);
        setRows(data.map(toRow));
      } else if (activeOnly) {
        const data = await getActiveStocks();
        setRows(data.map(toRow));
      } else {
        setRows([]);
      }
    } catch (e) {
      console.error(e);
      setError("Could not apply the filter.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    function updateCartTotal() {
      try {
        const stored = localStorage.getItem("shoppingCart");
        if (stored) {
          const cart = JSON.parse(stored);
          const total = cart.reduce((acc: number, item: any) => acc + (item.total || 0), 0);
          setCartTotal(total);
        } else {
          setCartTotal(0);
        }
      } catch {
        setCartTotal(0);
      }
    }
    updateCartTotal();
    window.addEventListener("storage", updateCartTotal);
    return () => window.removeEventListener("storage", updateCartTotal);
  }, []);

  if (loadingAuth) return <div className="loading">Loading...</div>;

  // 🔹 Mostrar header solo si está logueado (cliente o admin)
  const showHeader = isLoggedIn;

  return (
    <>
      {showHeader && (
        <Header
          isLoggedIn={isLoggedIn}
          marketOpen={marketOpen}
          totalAmount={cartTotal}
          onSearch={onSearch}
          role={role}
          onCartClick={() => setShowCart(true)} // 👈 nuevo: abre el carrito
        />
      )}

      {/* Carrito lateral */}
      {isClient && (
        <CartSidebar show={showCart} onClose={() => setShowCart(false)} />
      )}

      {hasSearched &&
        (inlineResults ? (
          <div className="search-inlineResults">
            <h3>{title}</h3>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: "crimson" }}>{error}</p>}
            {!loading && !error && rows.length === 0 && <p>No results found.</p>}
            {!loading && !error && rows.length > 0 && (
              <ul className="search-list">
                {rows.map((r) => (
                  <li key={r.symbol}>
                    <button
                      className="search-item"
                      onClick={() => router.push(`/stocks/${r.symbol}`)}
                    >
                      <strong>{r.symbol}</strong> — {r.name} · Q.{r.price}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          open && (
            <div className="search-overlay">
              <div className="search-box" ref={panelRef}>
                <div className="search-box-header">
                  <h3>{title}</h3>
                  <button onClick={() => setOpen(false)}>
                    <svg
                      stroke="currentColor"
                      fill="currentColor"
                      strokeWidth="0"
                      viewBox="0 0 512 512"
                      height="1em"
                      width="1em"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M405 136.798L375.202 107 256 226.202 136.798 107 107 136.798 226.202 256 107 375.202 136.798 405 256 285.798 375.202 405 405 375.202 285.798 256z"></path>
                    </svg>
                  </button>
                </div>

                {loading && <p>Loading…</p>}
                {error && <p style={{ color: "crimson" }}>{error}</p>}
                {!loading && !error && rows.length === 0 && <p>No results found.</p>}
                {!loading && !error && rows.length > 0 && (
                  <ul className="search-list">
                    {rows.map((r) => (
                      <li key={r.symbol}>
                        <button
                          className="search-item"
                          onClick={() => router.push(`/stocks/${r.symbol}`)}
                        >
                          <strong>{r.symbol}</strong> — {r.name} · Q.{r.price}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )
        ))}
    </>
  );
}
