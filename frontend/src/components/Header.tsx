'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from '@/components/SessionProvider';
import '../styles/header.css';
import CartSidebar from './CartSidebar';

const CATEGORIES = ['', 'Technology', 'Finance', 'Health'];

type HeaderProps = {
  marketOpen: boolean;
  totalAmount?: number;
  onSearch?: (params: {
    name: string;
    activeOnly: boolean;
    category: string;
    priceMin?: string;
    priceMax?: string;
  }) => void;
  onOpenLogin?: () => void;
};

type Filters = {
  activeOnly: boolean;
  category: string;
  priceMin: string;
  priceMax: string;
};

export default function Header({
  marketOpen,
  totalAmount = 0,
  onSearch,
  onOpenLogin,
}: HeaderProps) {
  const { user } = useSession();
  const role = user?.role; // 'admin' | 'user' | undefined
  const isUser = role === 'user';
  const isAdmin = role === 'admin';
  const isLoggedIn = Boolean(user);

  // name/symbol
  const [name, setName] = useState('');
  // total popover
  const [showTotal, setShowTotal] = useState(false);

  const [showCart, setShowCart] = useState(false);

  // filters
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    activeOnly: false,
    category: '',
    priceMin: '',
    priceMax: '',
  });
  const popRef = useRef<HTMLDivElement | null>(null);

  // close popover on outside click or ESC
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!popRef.current) return;
      if (filtersOpen && !popRef.current.contains(e.target as Node)) {
        setFiltersOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && setFiltersOpen(false);
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [filtersOpen]);

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
    setFilters({ activeOnly: false, category: '', priceMin: '', priceMax: '' });

  const hasActiveFilters =
    filters.activeOnly || !!filters.category || !!filters.priceMin || !!filters.priceMax;

  return (
    <header className="header">
      {!isAdmin && (
        <div
          className="header-userRegister"
          title={isLoggedIn ? user?.email : 'Sign in'}
          onClick={() => {
            if (!isLoggedIn) onOpenLogin?.();
          }}
          aria-label={isLoggedIn ? user?.email : 'Open login'}
        >
          <span className="header-userIcon" aria-hidden="true">
            <svg stroke="currentColor" fill="currentColor" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M14 1H2a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V2a1 1 0 00-1-1zM2 0a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V2a2 2 0 00-2-2H2z" clipRule="evenodd"></path>
              <path fillRule="evenodd" d="M2 15v-1c0-1 1-4 6-4s6 3 6 4v1H2zm6-6a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"></path>
            </svg>
          </span>
        </div>
      )}

      {/* center: search + filters */}
      <div className="header-centerStack">
        <div className="header-searchRow">
          <form className="header-searchBox" onSubmit={handleSubmit}>
            <span className="header-searchIcon" aria-hidden="true">
              <svg stroke="currentColor" fill="currentColor" viewBox="0 0 1024 1024" height="1em" width="1em">
                <path d="M909.6 854.5L649.9 594.8C690.2 542.7 712 479 712 412c0-80.2-31.3-155.4-87.9-212.1-56.6-56.7-132-87.9-212.1-87.9s-155.5 31.3-212.1 87.9C143.2 256.5 112 331.8 112 412c0 80.1 31.3 155.5 87.9 212.1C256.5 680.8 331.8 712 412 712c67 0 130.6-21.8 182.7-62l259.7 259.6a8.2 8.2 0 0 0 11.6 0l43.6-43.5a8.2 8.2 0 0 0 0-11.6zM570.4 570.4C528 612.7 471.8 636 412 636s-116-23.3-158.4-65.6C211.3 528 188 471.8 188 412s23.3-116.1 65.6-158.4C296 211.3 352.2 188 412 188s116.1 23.2 158.4 65.6S636 352.2 636 412s-23.3 116.1-65.6 158.4z"></path>
              </svg>
            </span>

            <input
              className="header-searchInput"
              placeholder="Search by name or symbol"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-label="Search by name or symbol"
            />

            {/* <button type="submit" className="header-searchBtn">Search</button> */}
          </form>

          <button
            type="button"
            className="header-filtersBtn"
            onClick={() => setFiltersOpen((v) => !v)}
            aria-expanded={filtersOpen}
            aria-controls="filters-popover"
            title="Filters"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 5h18M6 12h12M10 19h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            {hasActiveFilters && <span className="header-filtersBadge" />}
          </button>
        </div>

        {hasActiveFilters && (
          <div className="header-activeChips">
            {filters.activeOnly && (
              <button
                type="button"
                className="chip"
                onClick={() => setFilters((f) => ({ ...f, activeOnly: false }))}
              >
                Active only <span className="chip-x">×</span>
              </button>
            )}
            {filters.category && (
              <button
                type="button"
                className="chip"
                onClick={() => setFilters((f) => ({ ...f, category: '' }))}
              >
                Category: {filters.category} <span className="chip-x">×</span>
              </button>
            )}
            {(filters.priceMin || filters.priceMax) && (
              <button
                type="button"
                className="chip"
                onClick={() => setFilters((f) => ({ ...f, priceMin: '', priceMax: '' }))}
              >
                Price: {filters.priceMin || '0'}–{filters.priceMax || '∞'} <span className="chip-x">×</span>
              </button>
            )}
          </div>
        )}
      </div>

      {filtersOpen && (
        <div className="header-filtersPopover" id="filters-popover" ref={popRef}>
          {/* filters */}
          <div className="f-row switch">
            <label className="f-label">Active only</label>
            <label className="switch-wrap">
              <input
                type="checkbox"
                checked={filters.activeOnly}
                onChange={(e) => setFilters((f) => ({ ...f, activeOnly: e.target.checked }))}
              />
              <span className="switch-slider" />
            </label>
          </div>

          <div className="f-row">
            <label className="f-label">Category</label>
            <select
              className="f-input"
              value={filters.category}
              onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
            >
              {CATEGORIES.map((c) => (
                <option key={c || 'all'} value={c}>
                  {c ? c : 'All'}
                </option>
              ))}
            </select>
          </div>

          <div className="f-grid2">
            <div className="f-row">
              <label className="f-label">Min price</label>
              <input
                className="f-input"
                type="number"
                inputMode="decimal"
                placeholder="0"
                value={filters.priceMin}
                onChange={(e) => setFilters((f) => ({ ...f, priceMin: e.target.value }))}
              />
            </div>
            <div className="f-row">
              <label className="f-label">Max price</label>
              <input
                className="f-input"
                type="number"
                inputMode="decimal"
                placeholder="∞"
                value={filters.priceMax}
                onChange={(e) => setFilters((f) => ({ ...f, priceMax: e.target.value }))}
              />
            </div>
          </div>

          <div className="f-actions">
            <button type="button" className="btn-ghost" onClick={clearAll}>Clear</button>
            <button type="button" className="btn-primary" onClick={() => handleSubmit()}>Apply filters</button>
          </div>
        </div>
      )}

      <div className="header-rightSection">
        <div className={`header-marketStatus ${marketOpen ? 'header-marketStatus--open' : 'header-marketStatus--closed'}`}>
          <span className="header-marketDot" />
          Market {marketOpen ? 'Open' : 'Closed'}
        </div>

        {/* Total ONLY for user role */}
        {isUser && (
          <>
            <div className="header-totalContainer">
              <button
                type="button"
                className="header-totalButton"
                onClick={() => setShowTotal((v) => !v)}
                aria-expanded={showTotal}
                aria-controls="total-popover"
              >
                Total
              </button>
              {showTotal && (
                <div className="header-totalPopover" id="total-popover" role="dialog" aria-label="Total amount">
                  <strong>Total: </strong> Q.{totalAmount}
                </div>
              )}
            </div>

            {/* Cart ONLY for user role */}
            <div className="header-cartContainer">
              <button
                type="button"
                className="header-cartButton"
                onClick={() => setShowCart((v) => !v)}
                aria-expanded={showCart}
                aria-controls="cart-sidebar"
                title="Shopping cart"
              >
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 576 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M528.12 301.319l47.273-208C578.806 78.301 567.391 64 551.99 64H159.208l-9.166-44.81C147.758 8.021 137.93 0 126.529 0H24C10.745 0 0 10.745 0 24v16c0 13.255 10.745 24 24 24h69.883l70.248 343.435C147.325 417.1 136 435.222 136 456c0 30.928 25.072 56 56 56s56-25.072 56-56c0-15.674-6.447-29.835-16.824-40h209.647C430.447 426.165 424 440.326 424 456c0 30.928 25.072 56 56 56s56-25.072 56-56c0-22.172-12.888-41.332-31.579-50.405l5.517-24.276c3.413-15.018-8.002-29.319-23.403-29.319H218.117l-6.545-32h293.145c11.206 0 20.92-7.754 23.403-18.681z"></path></svg>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Cart sidebar (only when user & toggled) */}
      {isUser && showCart && (
        <CartSidebar show={showCart} onClose={() => setShowCart(false)} />
      )}
    </header>
  );
}
