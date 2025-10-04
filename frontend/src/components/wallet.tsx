'use client';

import { useEffect, useState } from 'react';
import '../styles/wallet.css';

type WalletProps = {
  open: boolean;
  onClose: () => void;
};

export default function Wallet({ open, onClose }: WalletProps) {
  const [balance, setBalance] = useState<number | null>(null);
  const [banks, setBanks] = useState<{id: number; name:string; address: string; established_date: string}[]>([]);
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

  // Obtener balance y bancos desde el backend
  useEffect(() => {
  if (!open) return;

  (async () => {
    try {
      const token = localStorage.getItem('token');
      const currentUser = localStorage.getItem('auth');
      const userId = currentUser ? JSON.parse(currentUser).id : null;
      const balanceRes = await fetch('http://localhost:8000/users/' + userId.toString(), {

        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      });


      const banksRes = await fetch('http://localhost:8000/api/banks/banks/', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      });

      const balanceData = await balanceRes.json();
      const banksData = await banksRes.json();

      const floatBalance = parseFloat(balanceData.client_profile.balance_available);
      setBalance(floatBalance);
      setBanks(banksData);

    } catch (err) {
      console.error(err);
    }
  })();
}, [open]);


  const handleDeposit = () => {
    if (!selectedBank || !amount || !referenceCode) {
      return alert('Please complete all fields');
    }

    setPendingDeposit({
      bank: selectedBank,
      amount: parseFloat(amount),
      reference_code: referenceCode,
      user: JSON.parse(localStorage.getItem('auth') || '{}').id
    });

    setShowConfirm(true);
  };

  const confirmDeposit = async () => {
    if (!pendingDeposit) return;

    try {
      const res = await fetch('http://localhost:8000/api/banks/fundstransfers/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
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
      <div className="wallet-overlay" onClick={onClose} />

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

      <div className={`wallet-sidebar open`}>
        <button className="wallet-close" onClick={onClose}>✕</button>

        <header className="wallet-header">
          <h2 className="wallet-title">Your Wallet</h2>
          <div className="wallet-balance">
            Current balance: {balance !== null ? `Q${balance.toFixed(2)}` : 'Loading...'}
          </div>
        </header>

        <div className="wallet-section">
          <label className="wallet-label">Select bank:</label>
          <select
            className="wallet-select"
            value={selectedBank}
            onChange={(e) => {
              setSelectedBank(e.target.value ? parseInt(e.target.value) : undefined)
              setSBankName(e.target.options[e.target.selectedIndex].text)
            } 
              }
          >
            <option value="">-- Choose one --</option>
            {banks.map((bank, idx) => (
              <option key={bank.id} value={bank.id}>{bank.name}</option>
            ))}
          </select>
        </div>

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
