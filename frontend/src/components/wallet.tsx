'use client';

import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';
import '../styles/wallet.css';

type WalletProps = {
  open: boolean;
  onClose: () => void;
};

export default function Wallet({ open, onClose }: WalletProps) {
  const { getAccessTokenSilently } = useAuth0();

  const [balance, setBalance] = useState<number | null>(null);
  const [banks, setBanks] = useState<{ id: number; name: string; address: string; established_date: string }[]>([]);
  const [selectedBank, setSelectedBank] = useState<number | undefined>();
  const [sBankName, setSBankName] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [referenceCode, setReferenceCode] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingDeposit, setPendingDeposit] = useState<{
    bank: number;
    amount: number;
    reference_code: string;
    user: number;
  } | null>(null);

  // 🔹 Cargar balance y bancos cuando se abre la wallet
  useEffect(() => {
    if (!open) return;

    (async () => {
      try {
        const token = await getAccessTokenSilently();

        // Obtener ID de usuario desde localStorage
        const currentUser = localStorage.getItem('auth');
        const userId = currentUser ? JSON.parse(currentUser).id : null;

        if (!userId) {
          console.error('User ID not found in localStorage');
          return;
        }

        // ✅ Llamada al endpoint de usuario
        const balanceRes = await fetch(`http://localhost:8000/users/${userId}/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        });

        // ✅ Llamada correcta al endpoint de bancos (usa /api/banks/banks/)
        const banksRes = await fetch('http://localhost:8000/api/banks/banks/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        });

        if (!balanceRes.ok) throw new Error(`Error fetching balance: ${balanceRes.status}`);
        if (!banksRes.ok) throw new Error(`Error fetching banks: ${banksRes.status}`);

        const balanceData = await balanceRes.json();
        const banksData = await banksRes.json();

        console.log('📊 Banks response from backend:', banksData);

        // Si tu backend usa paginación DRF, maneja ambos casos:
        if (Array.isArray(banksData)) {
          setBanks(banksData);
        } else if (banksData.results) {
          setBanks(banksData.results);
        } else {
          console.warn('Unexpected banks format:', banksData);
          setBanks([]);
        }

        const floatBalance = parseFloat(balanceData.client_profile.balance_available);
        setBalance(floatBalance);
      } catch (err) {
        console.error('❌ Error loading wallet data:', err);
      }
    })();
  }, [open, getAccessTokenSilently]);

  // 🔹 Manejador de depósito
  const handleDeposit = () => {
    if (!selectedBank || !amount || !referenceCode) {
      return alert('Please complete all fields');
    }

    const currentUser = JSON.parse(localStorage.getItem('auth') || '{}');

    setPendingDeposit({
      bank: selectedBank,
      amount: parseFloat(amount),
      reference_code: referenceCode,
      user: currentUser.id,
    });

    setShowConfirm(true);
  };

  // 🔹 Confirmar depósito
  const confirmDeposit = async () => {
    if (!pendingDeposit) return;

    try {
      const token = await getAccessTokenSilently();
      const res = await fetch('http://localhost:8000/api/banks/fundstransfers/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(pendingDeposit),
        cache: 'no-store',
      });

      if (!res.ok) throw new Error('Deposit failed');

      const result = await res.json();
      alert(`Deposit successful: Q${result.newBalance}`);

      setBalance(result.newBalance);
      setAmount('');
      setReferenceCode('');
      setSelectedBank(undefined);
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
      {/* Fondo oscuro */}
      <div className="wallet-overlay" onClick={onClose} />

      {/* Modal de confirmación */}
      {showConfirm && pendingDeposit && (
        <div className="wallet-modal">
          <div className="wallet-modal-content">
            <h3>Confirm deposit?</h3>
            <p><strong>Bank:</strong> {sBankName}</p>
            <p><strong>Amount:</strong> Q{pendingDeposit.amount.toFixed(2)}</p>
            <p><strong>Reference:</strong> {pendingDeposit.reference_code}</p>
            <div className="wallet-modal-actions">
              <button className="wallet-button" onClick={() => setShowConfirm(false)}>Cancel</button>
              <button className="wallet-button deposit" onClick={confirmDeposit}>Confirm deposit</button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar principal */}
      <div className={`wallet-sidebar open`}>
        <button className="wallet-close" onClick={onClose}>✕</button>

        <header className="wallet-header">
          <h2 className="wallet-title">Your Wallet</h2>
          <div className="wallet-balance">
            Current balance: {balance !== null ? `Q${balance}` : 'Loading...'}
          </div>
        </header>

        {/* Selector de bancos */}
        <div className="wallet-section">
          <label className="wallet-label">Select bank:</label>
          <select
            className="wallet-select"
            value={selectedBank ?? ''}
            onChange={(e) => {
              setSelectedBank(e.target.value ? parseInt(e.target.value) : undefined);
              setSBankName(e.target.options[e.target.selectedIndex].text);
            }}
          >
            <option value="">-- Choose one --</option>
            {banks.map((bank) => (
              <option key={bank.id} value={bank.id}>{bank.name}</option>
            ))}
          </select>
        </div>

        {/* Código de referencia */}
        <div className="wallet-section wallet-group">
          <label className="wallet-label">Reference code:</label>
          <input
            type="text"
            className="wallet-input full"
            placeholder="Enter deposit reference"
            value={referenceCode}
            onChange={(e) => setReferenceCode(e.target.value)}
          />
        </div>

        {/* Monto y botón de depósito */}
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
