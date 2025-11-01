'use client';

import { useState, useMemo } from 'react';
import '../styles/FilterTransactionType.css';

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
    button?: string; // button label
  };
};

export default function FilterTransactionType({
  onTypeChange,
  initial = null,
  includeAll = true,
  labels,
}: Props) {
  const L = {
    purchase: 'Purchases',
    sale: 'Sales',
    money_movement: 'Movements',
    button: 'Transaction Type',
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
    <div className="filter-date-div" >
      {/* Button */}
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
        <ul className="filterMenuTransaction" role="listbox">
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
        <div className="filter-chip-date" /* reuse chip styles */>
          {currentLabel}
          <button
            className="chip-close-date"
            aria-label="Remove filter"
            onClick={clearFilter}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
