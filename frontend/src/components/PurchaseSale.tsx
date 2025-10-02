'use client';

import { useState } from 'react';
import '../styles/purchaseSale.css';

// 🧠 Pasos del proceso
const steps = ['Select Portfolio', 'Select Company', 'Select Stock', 'Enter Quantity', 'Confirm'];

export default function BuyProcess() {
  const [activeStep, setActiveStep] = useState(0);
  const [portfolio, setPortfolio] = useState('');
  const [company, setCompany] = useState('');
  const [stock, setStock] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [isBuying] = useState(true); // ← modo fijo: compra

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleConfirm = () => {
    alert(`✅ ${isBuying ? 'Purchase' : 'Sale'} confirmed:\nPortfolio: ${portfolio}\nCompany: ${company}\nStock: ${stock}\nQuantity: ${quantity}\nTotal: $${quantity ? quantity * 100 : 0}`);
  };

  return (
    <div className="buy-container">
      {/* 🔢 Indicadores de pasos con línea */}
      <div className="step-indicator">
        {steps.map((label, index) => (
          <div key={index} className="step-wrapper">
            <div className={`step-circle ${index <= activeStep ? 'active' : ''}`}>
              {index + 1}
            </div>
            {index < steps.length - 1 && <div className="step-line" />}
          </div>
        ))}
      </div>

      {/* 🧭 Contenido por paso */}
      <div className="step-content">
        {activeStep === 0 && (
          <div>
            <h3>Select a portfolio</h3>
            <select value={portfolio} onChange={(e) => setPortfolio(e.target.value)}>
              <option value="">-- Choose --</option>
              <option value="Growth">Growth</option>
              <option value="Income">Income</option>
              <option value="Balanced">Balanced</option>
            </select>
            <button onClick={handleNext} disabled={!portfolio}>Next</button>
          </div>
        )}

        {activeStep === 1 && (
          <div>
            <h3>Select a company</h3>
            <select value={company} onChange={(e) => setCompany(e.target.value)}>
              <option value="">-- Choose --</option>
              <option value="Apple">Apple</option>
              <option value="Google">Google</option>
              <option value="Tesla">Tesla</option>
            </select>
            <button onClick={handleNext} disabled={!company}>Next</button>
          </div>
        )}

        {activeStep === 2 && (
          <div>
            <h3>Select a stock</h3>
            <select value={stock} onChange={(e) => setStock(e.target.value)}>
              <option value="">-- Choose --</option>
              <option value="Common">Common</option>
              <option value="Preferred">Preferred</option>
            </select>
            <button onClick={handleNext} disabled={!stock}>Next</button>
          </div>
        )}

        {activeStep === 3 && (
          <div>
            <h3>Enter quantity</h3>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              placeholder="Number of shares"
            />
            <button onClick={handleNext} disabled={!quantity || quantity <= 0}>Next</button>
          </div>
        )}

        {activeStep === 4 && (
          <div>
            <h3>Confirm {isBuying ? 'purchase' : 'sale'}</h3>
            <p><strong>Portfolio:</strong> {portfolio}</p>
            <p><strong>Company:</strong> {company}</p>
            <p><strong>Stock:</strong> {stock}</p>
            <p><strong>Quantity:</strong> {quantity}</p>
            <p><strong>Total:</strong> ${quantity ? quantity * 100 : 0}</p>
            <button onClick={handleConfirm}>
              Confirm {isBuying ? 'Purchase' : 'Sale'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
