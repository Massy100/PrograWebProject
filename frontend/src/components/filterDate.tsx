'use client';

import { useState } from 'react';
import '../styles/filterDate.css';

type Props = {
  onFilterChange: (range: { start: string; end: string } | null, label: string) => void;
};

export default function FilterDate({ onFilterChange }: Props) {
  const options = ['Day', 'Week', 'Month', 'Year', 'Custom'];
  const [selected, setSelected] = useState('Month'); // default is Month
  const [open, setOpen] = useState(false);

  const getDateRange = (opt: string) => {
    const today = new Date();
    let start: Date;
    let end: Date = today;

    switch (opt) {
      case 'Day':
        start = new Date(today);
        break;
      case 'Week':
        start = new Date(today);
        start.setDate(today.getDate() - 7);
        break;
      case 'Month':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'Year':
        start = new Date(today.getFullYear(), 0, 1);
        break;
      default:
        // Custom → null (para que luego uses un datepicker)
        return null;
    }

    const format = (d: Date) => d.toISOString().split('T')[0];
    return { start: format(start), end: format(end) };
  };

  const handleSelect = (opt: string) => {
    setSelected(opt);
    setOpen(false);

    const range = getDateRange(opt);
    onFilterChange(range, opt);
  };

  const clearFilter = () => {
    setSelected('');
    onFilterChange(null, '');
  };

  return (
    <div className="filter-date-div">
      {/* Botón */}
      <button className="filterBtn" onClick={() => setOpen(!open)}>
        <span>Select Date</span>
        <span className="chevron">▾</span>
      </button>

      {/* Dropdown */}
      {open && (
        <ul className="filterMenu">
          {options.map((opt) => (
            <li
              key={opt}
              className={opt === selected ? 'active' : ''}
              onClick={() => handleSelect(opt)}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}

      {/* Chip */}
      {selected && (
        <div className="filter-chip-date">
          {selected}
          <button className="chip-close-date" onClick={clearFilter}>
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
