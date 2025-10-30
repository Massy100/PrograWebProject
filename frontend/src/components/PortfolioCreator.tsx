'use client';

import { useAuth0 } from '@auth0/auth0-react';
import { useState } from 'react';
import '../styles/PortfolioCreator.css';

type PortfolioCreatorProps = {
  open: boolean;
  onClose: () => void;
};

export default function PortfolioCreator({ open, onClose }: PortfolioCreatorProps) {
  const { getAccessTokenSilently } = useAuth0();
  const [portfolioName, setPortfolioName] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingPortfolio, setPendingPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleCreate = async () => {
    if (!portfolioName.trim()) {
      alert('Please enter a portfolio name.');
      return;
    }

    try {
      setLoading(true);

      const token = await getAccessTokenSilently();
      const currentUser = JSON.parse(localStorage.getItem('auth') || '{}');

      if (!currentUser.id) {
        alert('User not found in localStorage. Please log in again.');
        return;
      }

      const userRes = await fetch(`http://localhost:8000/api/users/${currentUser.id}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      });

      if (!userRes.ok) {
        const txt = await userRes.text();
        console.error('❌ Error fetching user:', txt);
        throw new Error('Failed to get user profile');
      }

      const userData = await userRes.json();
      const clientProfileId = userData.client_profile?.id;

      if (!clientProfileId) {
        alert('⚠️ No client profile found for this user.');
        return;
      }

      const payload = {
        name: portfolioName.trim(),
        average_price: 0,
        total_inversion: 0,
        current_value: 0,
        is_active: true,
        client: clientProfileId, 
      };

      console.log('📦 Portfolio payload:', payload);

      setPendingPortfolio(payload);
      setShowConfirm(true);
    } catch (err) {
      console.error('❌ Error preparing portfolio:', err);
      alert('Error loading user info. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const confirmCreation = async () => {
    if (!pendingPortfolio) return;

    try {
      const token = await getAccessTokenSilently();

      const res = await fetch('http://localhost:8000/api/portfolio/portfolios/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(pendingPortfolio),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error('❌ Backend error:', errText);
        throw new Error(`Error ${res.status}`);
      }

      const result = await res.json();
      alert(`✅ Portfolio "${result.name}" created successfully!`);

      setPortfolioName('');
      setPendingPortfolio(null);
      setShowConfirm(false);
      onClose();
      window.location.reload();

    } catch (err) {
      console.error('❌ Error creating portfolio:', err);
      alert('There was a problem creating the portfolio.');
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

          <button
            className="portfolio-btn full create"
            onClick={handleCreate}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Create Portfolio'}
          </button>
        </div>
      </div>
    </>
  );
}
