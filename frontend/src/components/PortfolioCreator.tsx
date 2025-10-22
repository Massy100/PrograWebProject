'use client';

import { useAuth0 } from '@auth0/auth0-react';
import { useState } from 'react';
import '../styles/PortfolioCreator.css';

type PortfolioCreatorProps = {
  open: boolean;
  onClose: () => void;
};

export default function PortfolioCreator({ open, onClose }: PortfolioCreatorProps) {
  const {getAccessTokenSilently} = useAuth0();
  const [portfolioName, setPortfolioName] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingPortfolio, setPendingPortfolio] = useState<any>(null);

  if (!open) return null;

  const handleCreate = () => {
    if (!portfolioName.trim()) {
      alert('Please enter a portfolio name.');
      return;
    }

    // la estructura que le mandamos al back
    const payload = {
      name: portfolioName.trim(),
      creation_date: new Date().toISOString(),
      average_price: 0,
      total_investment: 0,
      is_active: true,
      client: JSON.parse(localStorage.getItem('auth') || '{}').id, 
    };

    setPendingPortfolio(payload);
    setShowConfirm(true);
  };

  const confirmCreation = async () => {
    if (!pendingPortfolio) return;

    console.log('📦 Portfolio payload to send:', pendingPortfolio);

    try {
      // para el back
      /*
      const token = await getAccessTokenSilently();
      const res = await fetch('http://localhost:8000/api/portfolios/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token)}`,
        },
        body: JSON.stringify(pendingPortfolio),
      });

      if (!res.ok) throw new Error('Error creating portfolio');
      const result = await res.json();
      alert(`✅ Portfolio "${result.name}" created successfully!`);
      */

      // eliminar cuando este el back solo es para hacer la simulacion sin el back
      alert(`✅ Portfolio "${pendingPortfolio.name}" created successfully!`);

      setPortfolioName('');
      setPendingPortfolio(null);
      setShowConfirm(false);
      onClose();
    } catch (err) {
      console.error(err);
      alert('❌ There was a problem creating the portfolio.');
    }
  };

  return (
    <>
      <div className="portfolio-overlay" onClick={onClose}></div>

      {showConfirm && pendingPortfolio && (
        <div className="portfolio-modal">
          <div className="portfolio-modal-content">
            <h3>Confirm portfolio creation</h3>
            <p><strong>Name:</strong> {pendingPortfolio.name}</p>
            <div className="portfolio-modal-actions">
              <button className="portfolio-btn cancel" onClick={() => setShowConfirm(false)}>
                Cancel
              </button>
              <button className="portfolio-btn confirm" onClick={confirmCreation}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`portfolio-sidebar ${open ? 'show' : ''}`}>
        <button className="portfolio-close" onClick={onClose}>✕</button>

        <header className="portfolio-header">
          <h2>Create Portfolio</h2>
          <p className="portfolio-subtitle">Add a new investment portfolio</p>
        </header>

        <div className="portfolio-section">
          <label className="portfolio-label">Portfolio name</label>
          <input
            type="text"
            className="portfolio-input"
            placeholder="Enter portfolio name"
            value={portfolioName}
            onChange={(e) => setPortfolioName(e.target.value)}
          />

          <button className="portfolio-btn full create" onClick={handleCreate}>
            Create Portfolio
          </button>
        </div>
      </div>
    </>
  );
}
