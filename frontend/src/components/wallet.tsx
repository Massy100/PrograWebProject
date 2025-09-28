'use client';

import { useEffect, useState } from 'react';
import '../styles/wallet.css';

type WalletProps = {
  open: boolean;
  onClose: () => void;
};

export default function Wallet({ open, onClose }: WalletProps) {
  const [balance, setBalance] = useState<number | null>(null);
  const [banks, setBanks] = useState<string[]>([]);
  const [newBank, setNewBank] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [amount, setAmount] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingDeposit, setPendingDeposit] = useState<{ bank: string; amount: number } | null>(null);

  // Fetch balance when opening
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const res = await fetch('/api/wallet/balance', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          cache: 'no-store',
        });
        const data = await res.json();
        setBalance(data.balance);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [open]);

  const handleSaveBank = () => {
    if (!newBank.trim()) return;
    setBanks((prev) => [...prev, newBank.trim()]);
    setNewBank('');
  };

  const handleDeposit = () => {
    if (!selectedBank || !amount) return alert('Please complete all fields');
    setPendingDeposit({ bank: selectedBank, amount: parseFloat(amount) });
    setShowConfirm(true);
  };

  const confirmDeposit = async () => {
    if (!pendingDeposit) return;
    try {
      const res = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(pendingDeposit),
      });
      if (!res.ok) throw new Error('Deposit failed');
      const result = await res.json();
      alert(`Deposit successful: Q${result.newBalance}`);
      setBalance(result.newBalance);
      setAmount('');
      setSelectedBank('');
      setShowConfirm(false);
      setPendingDeposit(null);
    } catch (err) {
      console.error(err);
      alert('There was a problem processing the deposit');
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="wallet-overlay" onClick={onClose} />
      {showConfirm && pendingDeposit && (
        <div className="wallet-modal">
          <div className="wallet-modal-content">
            <h3>Confirm deposit?</h3>
            <p><strong>Bank:</strong> {pendingDeposit.bank}</p>
            <p><strong>Amount:</strong> Q{pendingDeposit.amount.toFixed(2)}</p>
            <div className="wallet-modal-actions">
              <button className="wallet-button" onClick={() => setShowConfirm(false)}>Cancel</button>
              <button className="wallet-button deposit" onClick={confirmDeposit}>Confirm deposit</button>
            </div>
          </div>
        </div>
      )}

      <div className={`wallet-sidebar open`}>
        <button className="wallet-close" onClick={onClose}>✕</button>

        <header className="wallet-header">
          <h2 className="wallet-title">Your Wallet</h2>
          <div className="wallet-balance">
            Current balance: {balance !== null ? `Q${balance.toFixed(2)}` : 'Loading...'}
          </div>
        </header>

        <div className="wallet-section wallet-group">
          <label className="wallet-label">Bank name:</label>
          <input
            type="text"
            className="wallet-input full"
            value={newBank}
            onChange={(e) => setNewBank(e.target.value)}
            placeholder="Bank name"
          />
          <button className="wallet-button full" onClick={handleSaveBank}>
            Save bank
          </button>
        </div>

        <div className="wallet-section">
          <label className="wallet-label">Select bank:</label>
          <select
            className="wallet-select"
            value={selectedBank}
            onChange={(e) => setSelectedBank(e.target.value)}
          >
            <option value="">-- Choose one --</option>
            {banks.map((bank, idx) => (
              <option key={idx} value={bank}>{bank}</option>
            ))}
          </select>
        </div>

        <div className="wallet-section wallet-group">
          <label className="wallet-label">Amount to deposit:</label>
          <input
            type="number"
            className="wallet-input full"
            placeholder="Q0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button className="wallet-button full deposit" onClick={handleDeposit}>
            Deposit
          </button>
        </div>
      </div>
    </>
  );
}
