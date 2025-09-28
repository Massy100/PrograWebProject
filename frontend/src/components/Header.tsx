'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from '@/components/SessionProvider';
import '../styles/header.css';

const CATEGORIES = ['', 'Tecnología', 'Finanzas', 'Salud'];

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
  onOpenLogin?: () => void; // abre modal de login cuando no hay sesión
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

  // nombre/símbolo
  const [name, setName] = useState('');
  // popover total
  const [showTotal, setShowTotal] = useState(false);

  // filtros
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    activeOnly: false,
    category: '',
    priceMin: '',
    priceMax: '',
  });
  const popRef = useRef<HTMLDivElement | null>(null);

  // cerrar popover al hacer click fuera o ESC
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
      {(!isAdmin) && (
        <div
          className="header-userRegister"
          title={isLoggedIn ? user?.email : 'Inicia sesión'}
          onClick={() => {
            if (!isLoggedIn) onOpenLogin?.();
          }}
        >
          <span className="header-userIcon">
            <svg stroke="currentColor" fill="currentColor" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M14 1H2a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V2a1 1 0 00-1-1zM2 0a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V2a2 2 0 00-2-2H2z" clipRule="evenodd"></path>
              <path fillRule="evenodd" d="M2 15v-1c0-1 1-4 6-4s6 3 6 4v1H2zm6-6a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"></path>
            </svg>
          </span>
        </div>
      )}

      {/* centro: buscador + filtros */}
      <div className="header-centerStack">
        <div className="header-searchRow">
          <form className="header-searchBox" onSubmit={handleSubmit}>
            <span className="header-searchIcon">
              <svg stroke="currentColor" fill="currentColor" viewBox="0 0 1024 1024" height="1em" width="1em">
                <path d="M909.6 854.5L649.9 594.8C690.2 542.7 712 479 712 412c0-80.2-31.3-155.4-87.9-212.1-56.6-56.7-132-87.9-212.1-87.9s-155.5 31.3-212.1 87.9C143.2 256.5 112 331.8 112 412c0 80.1 31.3 155.5 87.9 212.1C256.5 680.8 331.8 712 412 712c67 0 130.6-21.8 182.7-62l259.7 259.6a8.2 8.2 0 0 0 11.6 0l43.6-43.5a8.2 8.2 0 0 0 0-11.6zM570.4 570.4C528 612.7 471.8 636 412 636s-116-23.3-158.4-65.6C211.3 528 188 471.8 188 412s23.3-116.1 65.6-158.4C296 211.3 352.2 188 412 188s116.1 23.2 158.4 65.6S636 352.2 636 412s-23.3 116.1-65.6 158.4z"></path>
              </svg>
            </span>

            <input
              className="header-searchInput"
              placeholder="Buscar por nombre o símbolo"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <button type="submit" className="header-searchBtn">Buscar</button>
          </form>

          <button
            type="button"
            className="header-filtersBtn"
            onClick={() => setFiltersOpen((v) => !v)}
            aria-expanded={filtersOpen}
            aria-controls="filters-popover"
            title="Filtros"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M3 5h18M6 12h12M10 19h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            {hasActiveFilters && <span className="header-filtersBadge" />}
          </button>
        </div>

        {hasActiveFilters && (
          <div className="header-activeChips">
            {filters.activeOnly && (
              <button type="button" className="chip" onClick={() => setFilters((f) => ({ ...f, activeOnly: false }))}>
                Solo activas <span className="chip-x">×</span>
              </button>
            )}
            {filters.category && (
              <button type="button" className="chip" onClick={() => setFilters((f) => ({ ...f, category: '' }))}>
                Categoría: {filters.category} <span className="chip-x">×</span>
              </button>
            )}
            {(filters.priceMin || filters.priceMax) && (
              <button type="button" className="chip" onClick={() => setFilters((f) => ({ ...f, priceMin: '', priceMax: '' }))}>
                Precio: {filters.priceMin || '0'}–{filters.priceMax || '∞'} <span className="chip-x">×</span>
              </button>
            )}
          </div>
        )}
      </div>

      {filtersOpen && (
        <div className="header-filtersPopover" id="filters-popover" ref={popRef}>
          {/* filtros */}
          <div className="f-row switch">
            <label className="f-label">Solo activas</label>
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
            <label className="f-label">Categoría</label>
            <select
              className="f-input"
              value={filters.category}
              onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
            >
              {CATEGORIES.map((c) => (
                <option key={c || 'all'} value={c}>
                  {c ? c : 'Todas'}
                </option>
              ))}
            </select>
          </div>
          <div className="f-grid2">
            <div className="f-row">
              <label className="f-label">Precio mín.</label>
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
              <label className="f-label">Precio máx.</label>
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
            <button type="button" className="btn-ghost" onClick={clearAll}>Limpiar</button>
            <button type="button" className="btn-primary" onClick={() => handleSubmit()}>Aplicar filtros</button>
          </div>
        </div>
      )}

      <div className="header-rightSection">
        <div className={`header-marketStatus ${marketOpen ? 'header-marketStatus--open' : 'header-marketStatus--closed'}`}>
          <span className="header-marketDot" />
          <span className="header-marketText">Mercado {marketOpen ? 'Abierto' : 'Cerrado'}</span>
        </div>

        {/* Total SOLO si el rol es user */}
        {isUser && (
          <div className="header-totalContainer">
            <button type="button" className="header-totalButton" onClick={() => setShowTotal((v) => !v)}>
              Total
            </button>
            {showTotal && (
              <div className="header-totalPopover">
                <strong>Total: </strong> Q.{totalAmount}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
