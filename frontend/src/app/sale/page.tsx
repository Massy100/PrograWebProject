'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth0 } from '@auth0/auth0-react';
import './Sale.css';

const steps = ['Portfolio', 'Stock', 'Quantity', 'Confirm'];

export default function SaleProcess() {
  const router = useRouter();
  const { getAccessTokenSilently } = useAuth0();

  const [activeStep, setActiveStep] = useState(0);
  const [showPortfolios, setShowPortfolios] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [clientProfileId, setClientProfileId] = useState<number | null>(null);
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [stocks, setStocks] = useState<any[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<any>(null);
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [quantity, setQuantity] = useState<number>(0);

  useEffect(() => {
    document.body.classList.toggle('scrollEnabled', activeStep === 0);
    if (activeStep === 0) setShowPortfolios(true);
  }, [activeStep]);

  useEffect(() => {
    (async () => {
      try {
        const token = await getAccessTokenSilently();
        const currentUser = JSON.parse(localStorage.getItem('auth') || '{}');
        if (!currentUser.id) return alert('⚠️ User not found.');

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
        console.error('Error loading portfolios:', err);
      }
    })();
  }, [getAccessTokenSilently]);

  useEffect(() => {
    (async () => {
      if (!selectedPortfolio) return;
      try {
        const token = await getAccessTokenSilently();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/stocks/by-portfolio/?portfolio_id=${selectedPortfolio.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setStocks(data.stocks || []);
      } catch (err) {
        console.error('Error loading stocks:', err);
      }
    })();
  }, [selectedPortfolio, getAccessTokenSilently]);

  const totalAmount =
    selectedStock && quantity > 0 ? selectedStock.last_price * quantity : 0;

  const confirmSale = async () => {
    if (!clientProfileId || !selectedPortfolio || !selectedStock || !quantity) {
      alert('Please fill all fields.');
      return;
    }

    if (quantity > selectedStock.quantity) {
      alert(`⚠️ You only have ${selectedStock.quantity} shares available.`);
      return;
    }

    try {
      setLoading(true);
      const token = await getAccessTokenSilently();

      const payload = {
        client_id: clientProfileId,
        total_amount: totalAmount,
        details: [
          {
            stock_id: selectedStock.stock_id,
            quantity,
            unit_price: selectedStock.last_price,
            portfolio_id: selectedPortfolio.id,
          },
        ],
      };

      console.log('📦 SELL payload:', payload);

      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/transactions/sell/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error('Backend error:', errText);
        alert('Error processing sale.');
        return;
      }

      setShowModal(true);
      setTimeout(() => router.push('/dashboard-user'), 2500);
    } catch (err) {
      console.error('Error confirming sale:', err);
      alert('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => setActiveStep((s) => Math.min(s + 1, steps.length - 1));
  const handleBack = () => setActiveStep((s) => Math.max(s - 1, 0));

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
            const color = isCompleted ? '#fff' : isActive ? '#021631' : '#646c79';
            return (
              <div
                key={index}
                className={`railStepV ${isActive ? 'active' : isCompleted ? 'completed' : ''}`}
                onClick={() => setActiveStep(index)}
              >
                <div className="circleWrapperV">
                  <div className="railCircleV">
                    {label === 'Portfolio' && (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16" width="18" height="18" style={{ color }}>
                        <path d="M9.828 4H2.19a1 1 0 00-.996 1.09l.637 7a1 1 0 00.995.91H9v1H2.826a2 2 0 01-1.991-1.819l-.637-7a1.99 1.99 0 01.342-1.31L.5 3a2 2 0 012-2h3.672a2 2 0 011.414.586l.828.828A2 2 0 009.828 3h3.982a2 2 0 011.992 2.181L15.546 8H14.54l.265-2.91A1 1 0 0013.81 4H9.828z" />
                        {isCompleted && (
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M15.854 10.146a.5.5 0 010 .708l-3 3a.5.5 0 01-.708 0l-1.5-1.5a.5.5 0 01.708-.708l1.146 1.147 2.646-2.647a.5.5 0 01.708 0z"
                          />
                        )}
                      </svg>
                    )}
                    {label === 'Stock' && (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" fill="currentColor" width="18" height="18" style={{ color }}>
                        <path d="M904 747H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zM165.7 621.8l39.7 39.5c3.1 3.1 8.2 3.1 11.3 0l234.7-233.9 97.6 97.3a32.11 32.11 0 0 0 45.2 0l264.2-263.2c3.1-3.1 3.1-8.2 0-11.3l-39.7-39.6a8.03 8.03 0 0 0-11.3 0l-235.7 235-97.7-97.3a32.11 32.11 0 0 0-45.2 0L165.7 610.5a7.94 7.94 0 0 0 0 11.3z"></path>
                      </svg>
                    )}
                    {label === 'Quantity' && (
                      <svg stroke="currentColor" fill="currentColor" viewBox="0 0 448 512" width="18" height="18" style={{ color }} xmlns="http://www.w3.org/2000/svg"><path d="M107.31 36.69a16 16 0 0 0-22.62 0l-80 96C-5.35 142.74 1.78 160 16 160h48v304a16 16 0 0 0 16 16h32a16 16 0 0 0 16-16V160h48c14.21 0 21.38-17.24 11.31-27.31zM400 416h-16V304a16 16 0 0 0-16-16h-48a16 16 0 0 0-14.29 8.83l-16 32A16 16 0 0 0 304 352h16v64h-16a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h96a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16z"></path></svg>
                    )}
                    {label === 'Confirm' && (
                      <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M15.354 2.646a.5.5 0 010 .708l-7 7a.5.5 0 01-.708 0l-3-3a.5.5 0 11.708-.708L8 9.293l6.646-6.647a.5.5 0 01.708 0z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M1.5 13A1.5 1.5 0 003 14.5h10a1.5 1.5 0 001.5-1.5V8a.5.5 0 00-1 0v5a.5.5 0 01-.5.5H3a.5.5 0 01-.5-.5V3a.5.5 0 01.5-.5h8a.5.5 0 000-1H3A1.5 1.5 0 001.5 3v10z" clip-rule="evenodd"></path></svg>
                    )}
                  </div>
                  {index < steps.length - 1 && <div className="railLineV" />}
                </div>
                <span className="stepLabelText">
                  <strong>{index + 1}.</strong> {label}
                </span>
              </div>
            );
          })}
        </aside>

        <div className="saleBox">
          {activeStep === 0 && (
            <div className="formSection">
              <h2>Sale Details</h2>
              <button className="portfolioButton" onClick={() => setShowPortfolios((p) => !p)}>
                {selectedPortfolio?.name || 'Select Portfolio'}
                <span className="arrowMinimal">{showPortfolios ? '▲' : '▼'}</span>
              </button>

              {showPortfolios && (
                <div className="portfolioGrid">
                  {portfolios.map((p) => (
                    <div
                      key={p.id}
                      className={`folderCard ${selectedPortfolio?.id === p.id ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedPortfolio(p);
                        setShowPortfolios(false);
                        setActiveStep(1);
                      }}
                    >
                      <div className="folderIcon"><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M9.828 4a3 3 0 01-2.12-.879l-.83-.828A1 1 0 006.173 2H2.5a1 1 0 00-1 .981L1.546 4h-1L.5 3a2 2 0 012-2h3.672a2 2 0 011.414.586l.828.828A2 2 0 009.828 3v1z"></path><path fill-rule="evenodd" d="M13.81 4H2.19a1 1 0 00-.996 1.09l.637 7a1 1 0 00.995.91h10.348a1 1 0 00.995-.91l.637-7A1 1 0 0013.81 4zM2.19 3A2 2 0 00.198 5.181l.637 7A2 2 0 002.826 14h10.348a2 2 0 001.991-1.819l.637-7A2 2 0 0013.81 3H2.19z" clip-rule="evenodd"></path></svg></div>
                      <span>{p.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeStep === 1 && (
            <div className="formSection">
              <h2>Select Stock</h2>
              {stocks.length === 0 ? (
                <p>No stocks available in this portfolio.</p>
              ) : (
                <select
                  value={selectedStock?.stock_id ?? ''}
                  onChange={(e) =>
                    setSelectedStock(stocks.find((s) => s.stock_id === Number(e.target.value)))
                  }
                >
                  <option value="">Select stock</option>
                  {stocks.map((s) => (
                    <option key={s.stock_id} value={s.stock_id}>
                      {s.symbol} — {s.name} ({s.quantity} shares)
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {activeStep === 2 && (
            <div className="formSection">
              <h2>Enter Quantity</h2>
              {selectedStock ? (
                <>
                  <input
                    type="number"
                    min={1}
                    max={selectedStock.quantity}
                    value={quantity || ''}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      if (value <= selectedStock.quantity) setQuantity(value);
                    }}
                  />
                  <p className="hintText">Available: {selectedStock.quantity} shares</p>
                </>
              ) : (
                <p>Please select a stock first.</p>
              )}
            </div>
          )}

          {activeStep === 3 && (
            <div className="saleSummaryCard">
              <h2>Review & Confirm</h2>
              <div className="summaryGrid">
                <div><label>Portfolio</label><p>{selectedPortfolio?.name}</p></div>
                <div><label>Stock</label><p>{selectedStock?.symbol}</p></div>
                <div><label>Quantity</label><p>{quantity}</p></div>
                <div><label>Total</label><p>Q.{totalAmount.toFixed(2)}</p></div>
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
            <h3>✅ Your transaction has been completed</h3>
            <p>You will be redirected to your dashboard shortly...</p>
          </div>
        </div>
      )}
    </>
  );
}
