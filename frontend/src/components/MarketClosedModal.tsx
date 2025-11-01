"use client";
import "../styles/marketClosedModal.css";

type MarketClosedModalProps = {
  show: boolean;
  onClose: () => void;
};

export default function MarketClosedModal({ show, onClose }: MarketClosedModalProps) {
  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Market Closed</h2>
        <p>You cannot buy or sell stocks while the market is closed. 
          Please try again once the market opens.</p>
        <button onClick={onClose}>Accept</button>
      </div>
    </div>
  );
}
