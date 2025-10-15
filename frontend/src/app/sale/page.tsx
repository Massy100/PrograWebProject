'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import './Sale.css';

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
  {steps.map((label, index) => {
    const isActive = index === activeStep;
    const isCompleted = index < activeStep;
    const color = isCompleted
      ? '#fff'
      : isActive
      ? '#021631'
      : '#646c79';

    return (
      <div
        key={index}
        className={`railStepV ${
          isActive ? 'active' : isCompleted ? 'completed' : ''
        }`}
        onClick={() => setActiveStep(index)}
      >
        <div className="circleWrapperV">
          <div className="railCircleV">
            {label === 'Portfolio' && (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" width="18" height="18" style={{ color }}>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M9.828 4H2.19a1 1 0 00-.996 1.09l.637 7a1 1 0 00.995.91H9v1H2.826a2 2 0 01-1.991-1.819l-.637-7a1.99 1.99 0 01.342-1.31L.5 3a2 2 0 012-2h3.672a2 2 0 011.414.586l.828.828A2 2 0 009.828 3h3.982a2 2 0 011.992 2.181L15.546 8H14.54l.265-2.91A1 1 0 0013.81 4H9.828zm-2.95-1.707L7.587 3H2.19c-.24 0-.47.042-.684.12L1.5 2.98a1 1 0 011-.98h3.672a1 1 0 01.707.293z" ></path>
                {isCompleted && (
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M15.854 10.146a.5.5 0 010 .708l-3 3a.5.5 0 01-.708 0l-1.5-1.5a.5.5 0 01.708-.708l1.146 1.147 2.646-2.647a.5.5 0 01.708 0z"
                  />
                )}
              </svg>
            )}

            {label === 'Company' && (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" width="18" height="18" style={{ color }}>
                <path d="M1 4h14v10a2 2 0 01-2 2H3a2 2 0 01-2-2V4zm7-2.5A2.5 2.5 0 005.5 4h-1a3.5 3.5 0 117 0h-1A2.5 2.5 0 008 1.5z"></path>
              </svg>
            )}

            {label === 'Stock' && (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" fill="currentColor" width="18" height="18" style={{ color }}>
                <path d="M904 747H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zM165.7 621.8l39.7 39.5c3.1 3.1 8.2 3.1 11.3 0l234.7-233.9 97.6 97.3a32.11 32.11 0 0 0 45.2 0l264.2-263.2c3.1-3.1 3.1-8.2 0-11.3l-39.7-39.6a8.03 8.03 0 0 0-11.3 0l-235.7 235-97.7-97.3a32.11 32.11 0 0 0-45.2 0L165.7 610.5a7.94 7.94 0 0 0 0 11.3z"></path>
              </svg>
            )}

            {label === 'Quantity' && (
              <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 448 512" height="1em" width="1em" style={{ color }} xmlns="http://www.w3.org/2000/svg"><path d="M107.31 36.69a16 16 0 0 0-22.62 0l-80 96C-5.35 142.74 1.78 160 16 160h48v304a16 16 0 0 0 16 16h32a16 16 0 0 0 16-16V160h48c14.21 0 21.38-17.24 11.31-27.31zM400 416h-16V304a16 16 0 0 0-16-16h-48a16 16 0 0 0-14.29 8.83l-16 32A16 16 0 0 0 304 352h16v64h-16a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h96a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16zM330.17 34.91a79 79 0 0 0-55 54.17c-14.27 51.05 21.19 97.77 68.83 102.53a84.07 84.07 0 0 1-20.85 12.91c-7.57 3.4-10.8 12.47-8.18 20.34l9.9 20c2.87 8.63 12.53 13.49 20.9 9.91 58-24.77 86.25-61.61 86.25-132V112c-.02-51.21-48.4-91.34-101.85-77.09zM352 132a20 20 0 1 1 20-20 20 20 0 0 1-20 20z"></path></svg>
            )}

            {label === 'Confirm' && (
              <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 16 16" height="1em" width="1em" style={{ color }} xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M14.5 3h-13a.5.5 0 00-.5.5v9a.5.5 0 00.5.5h13a.5.5 0 00.5-.5v-9a.5.5 0 00-.5-.5zm-13-1A1.5 1.5 0 000 3.5v9A1.5 1.5 0 001.5 14h13a1.5 1.5 0 001.5-1.5v-9A1.5 1.5 0 0014.5 2h-13z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M7 5.5a.5.5 0 01.5-.5h5a.5.5 0 010 1h-5a.5.5 0 01-.5-.5zm-1.496-.854a.5.5 0 010 .708l-1.5 1.5a.5.5 0 01-.708 0l-.5-.5a.5.5 0 11.708-.708l.146.147 1.146-1.147a.5.5 0 01.708 0zM7 9.5a.5.5 0 01.5-.5h5a.5.5 0 010 1h-5a.5.5 0 01-.5-.5zm-1.496-.854a.5.5 0 010 .708l-1.5 1.5a.5.5 0 01-.708 0l-.5-.5a.5.5 0 01.708-.708l.146.147 1.146-1.147a.5.5 0 01.708 0z" clip-rule="evenodd"></path></svg>
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
                        <div className="folderIcon"><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M9.828 4a3 3 0 01-2.12-.879l-.83-.828A1 1 0 006.173 2H2.5a1 1 0 00-1 .981L1.546 4h-1L.5 3a2 2 0 012-2h3.672a2 2 0 011.414.586l.828.828A2 2 0 009.828 3v1z"></path><path fill-rule="evenodd" d="M13.81 4H2.19a1 1 0 00-.996 1.09l.637 7a1 1 0 00.995.91h10.348a1 1 0 00.995-.91l.637-7A1 1 0 0013.81 4zM2.19 3A2 2 0 00.198 5.181l.637 7A2 2 0 002.826 14h10.348a2 2 0 001.991-1.819l.637-7A2 2 0 0013.81 3H2.19z" clip-rule="evenodd"></path></svg></div>
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
