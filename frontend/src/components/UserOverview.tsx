// app/user-overview/page.tsx
import React from "react";
import '../styles/UserOverview.css';


export type User = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  last_ip: string | null;
  referral_code: string | null;
  referral_used: boolean;
  created_at: string;
  updated_at: string;
};

export type Wallet = {
  id: string;
  user_id: string;
  balance_available: number;
  balance_blocked: number;
};

export default function UserOverview({
  user,
  wallet,
}: {
  user: User;
  wallet: Wallet;
}) {
  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n);

  const balance_total = wallet.balance_available + wallet.balance_blocked;

  return (
    <section className="div-content-grid">
      <div className="div-card div-user-info">
        <div className="div-card-header">
          <h2 className="div-card-title">Account Details</h2>
        </div>
        <div className="div-card-body">
          <div className="div-field-row">
            <span className="div-field-label">Name</span>
            <span className="div-field-value">{user.name || "—"}</span>
          </div>
          <div className="div-field-row">
            <span className="div-field-label">Email</span>
            <span className="div-field-value">{user.email || "—"}</span>
          </div>
          <div className="div-field-row">
            <span className="div-field-label">Phone</span>
            <span className="div-field-value">{user.phone || "—"}</span>
          </div>
          <div className="div-field-row">
            <span className="div-field-label">Last IP</span>
            <span className="div-field-value">{user.last_ip || "—"}</span>
          </div>

          <div className="div-divider" />

          <div className="div-field-row">
            <span className="div-field-label">Referral Code</span>
            <span className="div-field-value">{user.referral_code || "—"}</span>
          </div>
          <div className="div-field-row">
            <span className="div-field-label">Referral Used</span>
            <span className="div-field-chip">{user.referral_used ? "Yes" : "No"}</span>
          </div>

          <div className="div-divider" />

          <div className="div-field-row">
            <span className="div-field-label">Created At</span>
            <span className="div-field-value">{formatDate(user.created_at)}</span>
          </div>
          <div className="div-field-row">
            <span className="div-field-label">Last Updated</span>
            <span className="div-field-value">{formatDate(user.updated_at)}</span>
          </div>
        </div>
      </div>

      <div className="div-card div-wallet-info">
        <div className="div-card-header">
          <h2 className="div-card-title">Wallet</h2>
        </div>
        <div className="div-card-body">
          <div className="div-field-row">
            <span className="div-field-label">Wallet ID</span>
            <span className="div-field-value">{wallet.id}</span>
          </div>
          <div className="div-field-row">
            <span className="div-field-label">User ID</span>
            <span className="div-field-value">{wallet.user_id}</span>
          </div>

          <div className="div-divider" />

          <div className="div-field-row">
            <span className="div-field-label">Balance Available</span>
            <span className="div-field-value">{formatCurrency(wallet.balance_available)}</span>
          </div>
          <div className="div-field-row">
            <span className="div-field-label">Balance Blocked</span>
            <span className="div-field-value">{formatCurrency(wallet.balance_blocked)}</span>
          </div>
          <div className="div-total-row">
            <span className="div-total-label">Total Balance</span>
            <span className="div-total-value">{formatCurrency(balance_total)}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
