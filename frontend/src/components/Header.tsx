"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useRef, useState } from "react";
import "../styles/header.css";

const CATEGORIES = ["", "Technology", "Finance", "Health"];

type HeaderProps = {
  isLoggedIn: boolean;
  marketOpen: boolean;
  onSearch?: (params: {
    name: string;
    activeOnly: boolean;
    category: string;
    priceMin?: string;
    priceMax?: string;
  }) => void;
  role?: string;
  onCartClick?: () => void;
};

type Filters = {
  activeOnly: boolean;
  category: string;
  priceMin: string;
  priceMax: string;
};

export default function Header({
  isLoggedIn,
  marketOpen,
  onSearch,
  role,
  onCartClick,
}: HeaderProps) {
  const { getAccessTokenSilently } = useAuth0();

  const [name, setName] = useState("");
  const [showTotal, setShowTotal] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    activeOnly: false,
    category: "",
    priceMin: "",
    priceMax: "",
  });
  const [balance, setBalance] = useState<number | null>(null); // 💰 balance actual del usuario
  const popRef = useRef<HTMLDivElement | null>(null);

  // 🔹 Obtener el balance del usuario
  useEffect(() => {
    if (!isLoggedIn || role !== "client") return;

    (async () => {
      try {
        const token = await getAccessTokenSilently();

        const currentUser = localStorage.getItem("auth");
        const userId = currentUser ? JSON.parse(currentUser).id : null;
        if (!userId) {
          console.error("❌ No user ID found in localStorage");
          return;
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (!res.ok) throw new Error(`Error fetching balance: ${res.status}`);

        const data = await res.json();
        const floatBalance = parseFloat(data.client_profile.balance_available);
        setBalance(floatBalance);
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    })();
  }, [isLoggedIn, role, getAccessTokenSilently]);

  // 🔹 Cerrar filtros cuando se hace clic fuera o se presiona Escape
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!popRef.current) return;
      if (filtersOpen && !popRef.current.contains(e.target as Node)) {
        setFiltersOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setFiltersOpen(false);
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [filtersOpen]);

  // 🔹 Aplicar filtros
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    onSearch?.({
      name,
      activeOnly: filters.activeOnly,
      category: filters.category,
      priceMin: filters.priceMin || undefined,
      priceMax: filters.priceMax || undefined,
    });
    setFiltersOpen(false);
  };

  const clearAll = () =>
    setFilters({ activeOnly: false, category: "", priceMin: "", priceMax: "" });

  const hasActiveFilters =
    filters.activeOnly ||
    !!filters.category ||
    !!filters.priceMin ||
    !!filters.priceMax;

  return (
    <header className="header">
      {/* 👤 User icon */}
      <div className="header-userRegister" title="Account">
        <span className="header-userIcon">
          <svg
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            viewBox="0 0 16 16"
            height="1em"
            width="1em"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M14 1H2a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V2a1 1 0 00-1-1zM2 0a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V2a2 2 0 00-2-2H2z"
              clipRule="evenodd"
            ></path>
            <path
              fillRule="evenodd"
              d="M2 15v-1c0-1 1-4 6-4s6 3 6 4v1H2zm6-6a3 3 0 100-6 3 3 0 000 6z"
              clipRule="evenodd"
            ></path>
          </svg>
        </span>
      </div>

      {/* 🔍 Search section */}
      <div className="header-centerStack">
        <div className="header-searchRow">
          <form className="header-searchBox" onSubmit={handleSubmit}>
            <span className="header-searchIcon">
              <svg
                stroke="currentColor"
                fill="currentColor"
                viewBox="0 0 1024 1024"
                height="1em"
                width="1em"
              >
                <path d="M909.6 854.5L649.9 594.8C690.2 542.7 712 479 712 412c0-80.2-31.3-155.4-87.9-212.1-56.6-56.7-132-87.9-212.1-87.9s-155.5 31.3-212.1 87.9C143.2 256.5 112 331.8 112 412c0 80.1 31.3 155.5 87.9 212.1C256.5 680.8 331.8 712 412 712c67 0 130.6-21.8 182.7-62l259.7 259.6a8.2 8.2 0 0 0 11.6 0l43.6-43.5a8.2 8.2 0 0 0 0-11.6zM570.4 570.4C528 612.7 471.8 636 412 636s-116-23.3-158.4-65.6C211.3 528 188 471.8 188 412s23.3-116.1 65.6-158.4C296 211.3 352.2 188 412 188s116.1 23.2 158.4 65.6S636 352.2 636 412s-23.3 116.1-65.6 158.4z"></path>
              </svg>
            </span>

            <input
              className="header-searchInput"
              placeholder="Search by name or symbol"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </form>

          <button
            type="button"
            className="header-filtersBtn"
            onClick={() => setFiltersOpen((v) => !v)}
            aria-expanded={filtersOpen}
            aria-controls="filters-popover"
            title="Filters"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 5h18M6 12h12M10 19h4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            {hasActiveFilters && <span className="header-filtersBadge" />}
          </button>
        </div>
      </div>

      {/* 💼 Right section */}
      <div className="header-rightSection">
        <div
          className={`header-marketStatus ${
            marketOpen
              ? "header-marketStatus--open"
              : "header-marketStatus--closed"
          }`}
        >
          <span className="header-marketDot" />
          <span className="header-marketText">
            Market {marketOpen ? "Open" : "Closed"}
          </span>
        </div>

        {isLoggedIn && role === "client" && (
          <div className="header-rightGroup">
            {/* 💰 Mostrar balance en el botón “Total” */}
            <div className="header-totalContainer">
              <button
                type="button"
                className="header-totalButton"
                onClick={() => setShowTotal((v) => !v)}
              >
                Balance
              </button>
              {showTotal && (
                <div className="header-totalPopover">
                  <strong>Current Balance: </strong>{" "}
                  Q.{balance !== null ? balance.toFixed(2) : "Loading..."}
                </div>
              )}
            </div>

            {/* 🛒 Carrito */}
            <button
              type="button"
              className="header-cartButton"
              onClick={onCartClick}
              title="View cart"
            >
              <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 20 20"
                height="1.2em"
                width="1.2em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"></path>
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* 🔧 Filters popover */}
      {filtersOpen && (
        <div className="header-filtersPopover" id="filters-popover" ref={popRef}>
          <div className="f-row switch">
            <label className="f-label">Active only</label>
            <label className="switch-wrap">
              <input
                type="checkbox"
                checked={filters.activeOnly}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, activeOnly: e.target.checked }))
                }
              />
              <span className="switch-slider" />
            </label>
          </div>

          <div className="f-row">
            <label className="f-label">Category</label>
            <select
              className="f-input"
              value={filters.category}
              onChange={(e) =>
                setFilters((f) => ({ ...f, category: e.target.value }))
              }
            >
              {CATEGORIES.map((c) => (
                <option key={c || "all"} value={c}>
                  {c ? c : "All"}
                </option>
              ))}
            </select>
          </div>

          <div className="f-grid2">
            <div className="f-row">
              <label className="f-label">Min. price</label>
              <input
                className="f-input"
                type="number"
                inputMode="decimal"
                placeholder="0"
                value={filters.priceMin}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, priceMin: e.target.value }))
                }
              />
            </div>
            <div className="f-row">
              <label className="f-label">Max. price</label>
              <input
                className="f-input"
                type="number"
                inputMode="decimal"
                placeholder="∞"
                value={filters.priceMax}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, priceMax: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="f-actions">
            <button type="button" className="btn-ghost" onClick={clearAll}>
              Clear
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => handleSubmit()}
            >
              Apply filters
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
