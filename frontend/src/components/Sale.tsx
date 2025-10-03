'use client';

import { useState } from 'react';
import '../styles/Sale.css';

const steps = ['Portfolio', 'Company', 'Stock', 'Quantity', 'Confirm'];

export default function SaleProcess() {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    portfolio: '',
    company: '',
    stock: '',
    quantity: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (activeStep < steps.length - 1) setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (activeStep > 0) setActiveStep((prev) => prev - 1);
  };

  const isDisabled = (stepIndex: number) => stepIndex !== activeStep;

  const isNextDisabled =
    (activeStep === 0 && !formData.portfolio) ||
    (activeStep === 1 && !formData.company) ||
    (activeStep === 2 && !formData.stock) ||
    (activeStep === 3 && !formData.quantity);

  return (
    <div className="saleLayoutSplit">
      {/* 🔵 Vertical step bar */}
      <aside className="stepRailVertical">
        {steps.map((label, index) => (
          <div
            key={index}
            className={`railStepV ${
              index === activeStep ? 'active' : index <= activeStep ? 'completed' : ''
            }`}
          >
            <div className="circleWrapperV">
              <div className="railCircleV">{index + 1}</div>
              {index < steps.length - 1 && <div className="railLineV" />}
            </div>
            <span>{label}</span>
          </div>
        ))}
      </aside>

      {/* 📦 Main content box */}
      <div className="saleBox">
        {activeStep < 4 ? (
          <div className="formSection">
            <h2>Sale Details</h2>

            {/* Step 1: Portfolio */}
            <div className={`stepBlock ${activeStep === 0 ? 'active' : ''}`}>
              <label>Portfolio</label>
              <div className="portfolioGrid">
                {['Growth', 'Income', 'Balanced', 'Tech'].map((name) => (
                  <div
                    key={name}
                    className={`folderCard ${formData.portfolio === name ? 'selected' : ''}`}
                    onClick={() => !isDisabled(0) && handleChange('portfolio', name)}
                    style={{ pointerEvents: isDisabled(0) ? 'none' : 'auto', opacity: isDisabled(0) ? 0.5 : 1 }}
                  >
                    <div className="folderIcon">📁</div>
                    <span>{name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 👇 Horizontal row below folders */}
            <div className="stepRow">
              {/* Step 2: Company */}
              <div className={`stepBlock ${activeStep === 1 ? 'active' : ''}`}>
                <label>Company</label>
                <select
                  disabled={isDisabled(1)}
                  value={formData.company}
                  onChange={(e) => handleChange('company', e.target.value)}
                >
                  <option value="">Select a company</option>
                  <option value="Apple">Apple</option>
                  <option value="Google">Google</option>
                  <option value="Tesla">Tesla</option>
                </select>
              </div>

              {/* Step 3: Stock */}
              <div className={`stepBlock ${activeStep === 2 ? 'active' : ''}`}>
                <label>Stock Type</label>
                <select
                  disabled={isDisabled(2)}
                  value={formData.stock}
                  onChange={(e) => handleChange('stock', e.target.value)}
                >
                  <option value="">Select stock type</option>
                  <option value="Common">Common</option>
                  <option value="Preferred">Preferred</option>
                </select>
              </div>

              {/* Step 4: Quantity */}
              <div className={`stepBlock ${activeStep === 3 ? 'active' : ''}`}>
                <label>Quantity</label>
                <input
                  type="number"
                  disabled={isDisabled(3)}
                  placeholder="Enter quantity"
                  value={formData.quantity}
                  onChange={(e) => handleChange('quantity', e.target.value)}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="saleSummaryCard">
            <h2>Review & Confirm</h2>
            <div className="summaryGrid">
              <div>
                <label>Portfolio</label>
                <p>{formData.portfolio}</p>
              </div>
              <div>
                <label>Company</label>
                <p>{formData.company}</p>
              </div>
              <div>
                <label>Stock Type</label>
                <p>{formData.stock}</p>
              </div>
              <div>
                <label>Quantity</label>
                <p>{formData.quantity}</p>
              </div>
              <div className="totalBox">
                <label>Total</label>
                <p>${formData.quantity ? Number(formData.quantity) * 100 : 0}</p>
              </div>
            </div>
          </div>
        )}

        {/* ⏮️⏭️ Navigation buttons */}
        <div className="formNav">
          {activeStep > 0 && <button onClick={handleBack}>Back</button>}
          {activeStep < steps.length - 1 && (
            <button onClick={handleNext} disabled={isNextDisabled}>
              Next
            </button>
          )}
          {activeStep === steps.length - 1 && (
            <button onClick={() => alert('✅ Sale confirmed!')}>Confirm Sale</button>
          )}
        </div>
      </div>
    </div>
  );
}
