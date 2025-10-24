'use client';

import { useState } from 'react';
import '../styles/filterDate.css';

type Props = {
  onFilterChange: (range: { start: string; end: string } | null, label: string) => void;
};

export default function FilterDate({ onFilterChange }: Props) {
  const options = ['Today', 'Week', 'Month', 'Year', 'Custom'];
  const [selected, setSelected] = useState('Month');
  const [open, setOpen] = useState(false);

  const [showCustom, setShowCustom] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [customLabel, setCustomLabel] = useState(''); 

  const getDateRange = (opt: string) => {
    const today = new Date();
    let start: Date;
    let end: Date = today;

    switch (opt) {
      case 'Today':
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
        return null;
    }

    const format = (d: Date) => d.toISOString().split('T')[0];
    return { start: format(start), end: format(end) };
  };

  const handleSelect = (opt: string) => {
    setSelected(opt);
    setOpen(false);

    if (opt === 'Custom') {
      setShowCustom(true);
      onFilterChange(null, opt);
      return;
    }

    const range = getDateRange(opt);
    setCustomLabel(''); 
    onFilterChange(range, opt);
  };

  const clearFilter = () => {
    setSelected('');
    setCustomLabel('');
    setCustomStart('');
    setCustomEnd('');
    onFilterChange(null, '');
  };

  const applyCustomRange = () => {
    if (customStart && customEnd) {
      const label = `${customStart} → ${customEnd}`;
      setCustomLabel(label);
      setSelected('Custom');
      onFilterChange({ start: customStart, end: customEnd }, 'Custom');
      setShowCustom(false);
    }
  };

  return (
    <div className="filter-date-div">
      <button className="filterBtn" onClick={() => setOpen(!open)}>
        <span>Select Date</span>
        <span className="chevron">▾</span>
      </button>

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

      {selected && (
        <div className="filter-chip-date">
          {selected === 'Custom' && customLabel ? customLabel : selected}
          <button className="chip-close-date" onClick={clearFilter}>
            ✕
          </button>
        </div>
      )}

      {showCustom && (
        <div className="customModalOverlay" onClick={() => setShowCustom(false)}>
          <div className="customModal" onClick={(e) => e.stopPropagation()}>
            <h4>Select custom range</h4>
            <div className="dateInputs">
              <label>
                Start:
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                />
              </label>
              <label>
                End:
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                />
              </label>
            </div>

            <div className="buttons">
              <button className="cancelBtn" onClick={() => setShowCustom(false)}>
                Cancel
              </button>
              <button className="applyBtn" onClick={applyCustomRange}>
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
