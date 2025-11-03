'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth0 } from '@auth0/auth0-react';
import './Sale.css';

const steps = ['Portfolio', 'Stock', 'Quantity', 'Confirm'];

interface Portfolio {
  id: number;
  name: string;
}

interface Stock {
  id: number;
  symbol: string;
  name: string;
  last_price: number;
}

export default function SaleProcess() {
  const { getAccessTokenSilently } = useAuth0();
  const router = useRouter();

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);

  const [selectedPortfolio, setSelectedPortfolio] = useState<number | null>(null);
  const [selectedStock, setSelectedStock] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<number>(0);

  const [clientProfileId, setClientProfileId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const token = await getAccessTokenSilently();
        const currentUser = JSON.parse(localStorage.getItem('auth') || '{}');

        if (!currentUser.id) {
          alert('⚠️ User not found in localStorage.');
          return;
        }

        const userRes = await fetch(process.env.NEXT_PUBLIC_API_URL + `/users/${currentUser.id}/`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        const userData = await userRes.json();
        setClientProfileId(userData.client_profile?.id);

        const portfoliosRes = await fetch(process.env.NEXT_PUBLIC_API_URL + '/portfolio/portfolios/', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        const portfoliosData = await portfoliosRes.json();
        setPortfolios(portfoliosData);

        const stocksRes = await fetch(process.env.NEXT_PUBLIC_API_URL + '/stocks/', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        const stocksData = await stocksRes.json();
        setStocks(stocksData);
      } catch (err) {
        console.error('❌ Error loading data:', err);
      }
    })();
  }, [getAccessTokenSilently]);

  const totalAmount = (() => {
    const stock = stocks.find((s) => s.id === selectedStock);
    return stock && quantity > 0 ? stock.last_price * quantity : 0;
  })();

  const confirmSale = async () => {
    if (!selectedPortfolio || !selectedStock || !quantity || !clientProfileId) {
      alert('⚠️ Please fill out all fields before confirming.');
      return;
    }

    try {
      setLoading(true);
      const token = await getAccessTokenSilently();

      const selectedStockData = stocks.find((s) => s.id === selectedStock);
      const unit_price = selectedStockData?.last_price ?? 0;

      const transactionPayload = {
        client_id: clientProfileId,
        total_amount: totalAmount,
        details: [
          {
            stock_id: selectedStock,
            quantity,
            unit_price,
            portfolio_id: selectedPortfolio,
          },
        ],
      };

      console.log('📦 SELL payload:', transactionPayload);

      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/transactions/sell/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(transactionPayload),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error('❌ Backend error:', errText);
        alert('Error processing sale.');
        return;
      }

      const result = await res.json();
      console.log('✅ Sale successful:', result);

      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        router.push('/dashboard-user');
      }, 2500);
    } catch (err) {
      console.error('❌ Error completing sale:', err);
      alert('There was a problem completing the sale.');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (activeStep < steps.length - 1) setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (activeStep > 0) setActiveStep((prev) => prev - 1);
  };

  const isNextDisabled =
    (activeStep === 0 && !selectedPortfolio) ||
    (activeStep === 1 && !selectedStock) ||
    (activeStep === 2 && (!quantity || quantity <= 0));

  return (
    <>
      <div className="saleLayoutSplit">
        <aside className="stepRailVertical">
          {steps.map((label, index) => {
            const isActive = index === activeStep;
            const isCompleted = index < activeStep;
            return (
              <div
                key={index}
                className={`railStepV ${isActive ? 'active' : isCompleted ? 'completed' : ''}`}
                onClick={() => setActiveStep(index)}
              >
                <div className="circleWrapperV">
                  <div className="railCircleV">{index + 1}</div>
                  {index < steps.length - 1 && <div className="railLineV" />}
                </div>
                <span className="stepLabelText">{label}</span>
              </div>
            );
          })}
        </aside>

        <div className="saleBox">
          {activeStep === 0 && (
            <div className="formSection">
              <h2>Select Portfolio</h2>
              <select
                value={selectedPortfolio ?? ''}
                onChange={(e) => setSelectedPortfolio(Number(e.target.value))}
              >
                <option value="">Select portfolio</option>
                {portfolios.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {activeStep === 1 && (
            <div className="formSection">
              <h2>Select Stock</h2>
              <select
                value={selectedStock ?? ''}
                onChange={(e) => setSelectedStock(Number(e.target.value))}
              >
                <option value="">Select stock</option>
                {stocks.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.symbol} — {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {activeStep === 2 && (
            <div className="formSection">
              <h2>Enter Quantity</h2>
              <input
                type="number"
                min={1}
                value={quantity || ''}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>
          )}

          {activeStep === 3 && (
            <div className="saleSummaryCard">
              <h2>Review & Confirm</h2>
              <div className="summaryGrid">
                <div>
                  <label>Portfolio</label>
                  <p>{portfolios.find((p) => p.id === selectedPortfolio)?.name}</p>
                </div>
                <div>
                  <label>Stock</label>
                  <p>{stocks.find((s) => s.id === selectedStock)?.symbol}</p>
                </div>
                <div>
                  <label>Quantity</label>
                  <p>{quantity}</p>
                </div>
                <div>
                  <label>Total</label>
                  <p>Q.{totalAmount.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}

          <div className="formNav">
            {activeStep > 0 && <button onClick={handleBack}>Back</button>}
            {activeStep < steps.length - 1 && (
              <button onClick={handleNext} disabled={isNextDisabled}>
                Next
              </button>
            )}
            {activeStep === steps.length - 1 && (
              <button onClick={confirmSale} disabled={loading}>
                {loading ? 'Processing...' : 'Confirm Sale'}
              </button>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="portfolioOverlay">
          <div className="portfolioModal">
            <h3>✅ Sale completed successfully</h3>
            <p>You will be redirected to your dashboard shortly...</p>
          </div>
        </div>
      )}
    </>
  );
}
