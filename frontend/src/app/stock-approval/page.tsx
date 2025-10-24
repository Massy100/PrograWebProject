import "./StocksApprovalPage.css";
import StockApproval from '@/components/StockApproval'; 

export default function StocksApprovalPage() {

  return (
    <div className="stocks-approval-div">
      <h2 className="approval-title">Stock Management</h2>
      <p className="approval-subtitle">
        Manage pending approvals and system stocks
      </p>
      <StockApproval />
    </div>
  );
}
