'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  const [showPortfolios, setShowPortfolios] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    document.body.classList.toggle('scrollEnabled', activeStep === 0);
    if (activeStep === 0) setShowPortfolios(true);
  }, [activeStep]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === 'portfolio') {
      setShowPortfolios(false);
      setActiveStep(1);
    } else if (field === 'company') {
      setActiveStep(2);
    } else if (field === 'stock') {
      setActiveStep(3);
    } else if (field === 'quantity') {
      setActiveStep(4);
    }
  };

  const handleNext = () => {
    if (activeStep < steps.length - 1) setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (activeStep > 0) setActiveStep((prev) => prev - 1);
  };

  const confirmSale = () => {
    setShowModal(true);
    setTimeout(() => {
      router.push('/dashboard-user');
    }, 2500);
  };

  const isDisabled = (stepIndex: number) => stepIndex !== activeStep;

  const isNextDisabled =
    (activeStep === 0 && !formData.portfolio) ||
    (activeStep === 1 && !formData.company) ||
    (activeStep === 2 && !formData.stock) ||
    (activeStep === 3 && !formData.quantity);

  const portfolioOptions = [
    'Growth', 'Income', 'Balanced', 'Tech',
    'Real Estate', 'Crypto', 'Energy', 'Healthcare',
    'Dividend', 'Emerging Markets', 'Green', 'AI', 'Biotech'
  ];

  return (
    <>
      <div className="saleLayoutSplit">
        <aside className="stepRailVertical">
          {steps.map((label, index) => (
            <div
              key={index}
              className={`railStepV ${
                index === activeStep ? 'active' : index <= activeStep ? 'completed' : ''
              }`}
              onClick={() => setActiveStep(index)}
            >
              <div className="circleWrapperV">
                <div className="railCircleV">{index + 1}</div>
                {index < steps.length - 1 && <div className="railLineV" />}
              </div>
              <span>{label}</span>
            </div>
          ))}
        </aside>

        <div className="saleBox">
          {activeStep < 4 ? (
            <div className="formSection">
              <h2>Sale Details</h2>

              {/* Step 1: Portfolio */}
              <div className={`stepBlock ${activeStep === 0 ? 'active' : ''}`}>
                <button
                  className="portfolioButton"
                  onClick={() => {
                    setActiveStep(0);
                    setShowPortfolios((prev) => !prev);
                  }}
                >
                  {formData.portfolio || 'Select portfolio'}
                  <span className="arrowMinimal">{showPortfolios ? '▲' : '▼'}</span>
                </button>

                <div
                  className="portfolioInline"
                  style={{ display: showPortfolios ? 'block' : 'none' }}
                >
                  <div className="portfolioGrid">
                    {portfolioOptions.map((name) => (
                      <div
                        key={name}
                        className={`folderCard ${formData.portfolio === name ? 'selected' : ''}`}
                        onClick={() => {
                          if (formData.portfolio === name) {
                            setActiveStep(0);
                            setShowPortfolios(true);
                          } else {
                            handleChange('portfolio', name);
                          }
                        }}
                      >
                        <div className="folderIcon">📁</div>
                        <span>{name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step 2–4 */}
              <div className="stepRow">
                <div className={`stepBlock ${activeStep === 1 ? 'active' : ''}`}>
                  <label>Company</label>
                  <select
                    disabled={isDisabled(1)}
                    value={formData.company}
                    onClick={() => {
                      if (formData.company) setActiveStep(1);
                    }}
                    onChange={(e) => handleChange('company', e.target.value)}
                  >
                    <option value="">Select a company</option>
                    <option value="Apple">Apple</option>
                    <option value="Google">Google</option>
                    <option value="Tesla">Tesla</option>
                  </select>
                </div>

                <div className={`stepBlock ${activeStep === 2 ? 'active' : ''}`}>
                  <label>Stock Type</label>
                  <select
                    disabled={isDisabled(2)}
                    value={formData.stock}
                    onClick={() => {
                      if (formData.stock) setActiveStep(2);
                    }}
                    onChange={(e) => handleChange('stock', e.target.value)}
                  >
                    <option value="">Select stock type</option>
                    <option value="Common">Common</option>
                    <option value="Preferred">Preferred</option>
                  </select>
                </div>

                <div className={`stepBlock ${activeStep === 3 ? 'active' : ''}`}>
                  <label>Quantity</label>
                  <input
                    type="number"
                    disabled={isDisabled(3)}
                    placeholder="Enter quantity"
                    value={formData.quantity}
                    onClick={() => {
                      if (formData.quantity) setActiveStep(3);
                    }}
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

          <div className="formNav">
            {activeStep > 0 && <button onClick={handleBack}>Back</button>}
            {activeStep < steps.length - 1 && (
              <button onClick={handleNext} disabled={isNextDisabled}>
                Next
              </button>
            )}
            {activeStep === steps.length - 1 && (
              <button onClick={confirmSale}>Confirm Sale</button>
            )}
          </div>
        </div>
      </div>

      {/* ✅ Confirmation Modal */}
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
