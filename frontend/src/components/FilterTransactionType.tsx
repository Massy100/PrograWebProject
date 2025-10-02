'use client';

import { useState, useMemo } from 'react';
import '../styles/filterDate.css'; // Reutiliza los mismos estilos (botón, menú y chip)

type TxType = 'purchase' | 'sale' | 'money_movement' | null;

type Props = {

  onTypeChange: (value: TxType, label: string) => void;

  initial?: TxType;

  includeAll?: boolean;

  labels?: {
    all?: string;
    purchase?: string;
    sale?: string;
    money_movement?: string;
    button?: string; // label del botón
  };
};

export default function FilterTransactionType({
  onTypeChange,
  initial = null,
  includeAll = true,
  labels,
}: Props) {
  const L = {
    all: 'Todos',
    purchase: 'Compras',
    sale: 'Ventas',
    money_movement: 'Movimientos',
    button: 'Tipo de transacción',
    ...labels,
  };

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<TxType>(initial);

  const options = useMemo(
    () =>
      (includeAll
        ? ([null, 'purchase', 'sale', 'money_movement'] as TxType[])
        : (['purchase', 'sale', 'money_movement'] as TxType[])
      ).map((v) => ({
        value: v,
        label:
          v === null
            ? L.all
            : v === 'purchase'
            ? L.purchase
            : v === 'sale'
            ? L.sale
            : L.money_movement,
      })),
    [includeAll, L.all, L.purchase, L.sale, L.money_movement]
  );

  const currentLabel =
    selected === null
      ? ''
      : selected === 'purchase'
      ? L.purchase
      : selected === 'sale'
      ? L.sale
      : L.money_movement;

  const handleSelect = (value: TxType) => {
    setSelected(value);
    setOpen(false);
    const label =
      value === null
        ? ''
        : value === 'purchase'
        ? L.purchase
        : value === 'sale'
        ? L.sale
        : L.money_movement;

    onTypeChange(value, label);
  };

  const clearFilter = () => {
    setSelected(null);
    onTypeChange(null, '');
  };

  return (
    <div className="filter-date-div" style={{ position: 'relative' }}>
      {/* Botón */}
      <button
        className="filterBtn"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span>{L.button}</span>
        <span className="chevron">▾</span>
      </button>

      {/* Dropdown */}
      {open && (
        <ul className="filterMenu" role="listbox">
          {options.map((opt) => (
            <li
              key={`${opt.value ?? 'all'}`}
              role="option"
              aria-selected={opt.value === selected}
              className={opt.value === selected ? 'active' : ''}
              onClick={() => handleSelect(opt.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleSelect(opt.value);
              }}
              tabIndex={0}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}

      {/* Chip */}
      {currentLabel && (
        <div className="filter-chip-date" /* reutiliza chip styles */>
          {currentLabel}
          <button
            className="chip-close-date"
            aria-label="Quitar filtro"
            onClick={clearFilter}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
