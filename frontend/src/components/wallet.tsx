'use client';

import { useEffect, useState } from 'react';
import '../styles/wallet.css';

export default function WalletPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [banks, setBanks] = useState<string[]>([]);
  const [newBank, setNewBank] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [amount, setAmount] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingDeposit, setPendingDeposit] = useState<{ bank: string; amount: number } | null>(null);

  // Obtener saldo desde el backend
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await fetch('/api/wallet/balance', { // BACKEND: endpoint para obtener saldo
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`, // BACKEND: token de autenticación
          },
        });
        const data = await res.json();
        setBalance(data.balance); // BACKEND: guardar saldo recibido
      } catch (error) {
        console.error(error);
      }
    };
    if (isOpen) fetchBalance();
  }, [isOpen]);

  const handleSaveBank = () => {
    if (!newBank.trim()) return;
    setBanks((prev) => [...prev, newBank.trim()]);
    setNewBank('');
  };

  // Preparar datos para depósito (no envía aún)
  const handleDeposit = () => {
    if (!selectedBank || !amount) return alert('Completa todos los campos');

    setPendingDeposit({
      bank: selectedBank,  // BACKEND: nombre del banco a enviar
      amount: parseFloat(amount), // BACKEND: monto a enviar
    });
    setShowConfirm(true); // UI: mostrar modal de confirmación
  };

  // Confirmar y enviar depósito al backend
  const confirmDeposit = async () => {
    if (!pendingDeposit) return;

    try {
      const res = await fetch('/api/wallet/deposit', { // BACKEND: endpoint para enviar depósito
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`, // BACKEND: token de autenticación
        },
        body: JSON.stringify(pendingDeposit), // BACKEND: datos del depósito
      });

      if (!res.ok) throw new Error('Error al depositar');

      const result = await res.json();
      alert(`Depósito exitoso: Q${result.newBalance}`);
      setBalance(result.newBalance); // BACKEND: actualizar saldo con respuesta
      setAmount('');
      setSelectedBank('');
      setShowConfirm(false);
      setPendingDeposit(null);
    } catch (error) {
      console.error(error);
      alert('Hubo un problema al depositar');
    }
  };

  return (
    <>
      <button className="wallet-toggle" onClick={() => setIsOpen(true)}>
        Open Wallet
      </button>

      {isOpen && <div className="wallet-overlay" onClick={() => setIsOpen(false)} />}

      {showConfirm && pendingDeposit && (
        <div className="wallet-modal">
          <div className="wallet-modal-content">
            <h3>Confirm deposit?</h3>
            <p><strong>BanK:</strong> {pendingDeposit.bank}</p>
            <p><strong>Amount:</strong> Q{pendingDeposit.amount.toFixed(2)}</p>
            <div className="wallet-modal-actions">
              <button className="wallet-button" onClick={() => setShowConfirm(false)}>Cancel</button>
              <button className="wallet-button deposit" onClick={confirmDeposit}>Confirm deposit</button>
            </div>
          </div>
        </div>
      )}

      <div className={`wallet-sidebar ${isOpen ? 'open' : ''}`}>
        <button className="wallet-close" onClick={() => setIsOpen(false)}>✕</button>

        <header className="wallet-header">
          <h2 className="wallet-title">Your Wallet</h2>
          <div className="wallet-balance">
            Current balance: {balance !== null ? `Q${balance.toFixed(2)}` : 'Cargando...'}
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
            {banks.map((bank, index) => (
              <option key={index} value={bank}>
                {bank}
              </option>
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
