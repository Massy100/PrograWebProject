'use client';

import { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import './report.css';

type DashboardData = {
  balance: number;
  sales: number;
  wallet: number;
  referral: number;
  estimated: number;
  orders: {
    invoice: string;
    customer: string;
    price: number;
    status: 'Done' | 'Pending';
  }[];
};

const mockPortfolios = ['Alpha', 'Beta', 'Gamma'];
const mockProfile = 'analyst'; // Simula perfil actual

export default function MinimalDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [portfolio, setPortfolio] = useState<string>('Alpha');

  useEffect(() => {
    // Simula datos del backend según portafolio
    setTimeout(() => {
      const base = portfolio === 'Alpha' ? 3000 : portfolio === 'Beta' ? 4000 : 5000;
      setData({
        balance: base + 468.96,
        sales: portfolio === 'Gamma' ? 120 : 82,
        wallet: base + 567.33,
        referral: 234.0,
        estimated: base + 312.5,
        orders: [
          { invoice: '#2369', customer: 'Miron', price: 1236, status: 'Done' },
          { invoice: '#2368', customer: 'John Doe', price: 1236, status: 'Pending' },
        ],
      });
    }, 600);
  }, [portfolio]);

  const exportPDF = async () => {
    const element = document.getElementById('minimal-dashboard');
    if (!element || !data) return;

    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();

    pdf.setFontSize(12);
    pdf.text(`Portafolio: ${portfolio}`, 10, 10);
    pdf.text(`Perfil: ${mockProfile}`, 10, 16);
    pdf.text(`Rango de fechas: ${dateRange.from || '—'} a ${dateRange.to || '—'}`, 10, 22);
    pdf.addImage(imgData, 'PNG', 10, 30, 190, 0);
    pdf.save(`dashboard-${portfolio}.pdf`);
  };

  return (
    <main className="panel">
      <h1 className="panel__title">📊 Overview</h1>

      <div className="dashboard__controls">
        <select value={portfolio} onChange={e => setPortfolio(e.target.value)}>
          {mockPortfolios.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <input
          type="date"
          value={dateRange.from}
          onChange={e => setDateRange({ ...dateRange, from: e.target.value })}
        />
        <span>to</span>
        <input
          type="date"
          value={dateRange.to}
          onChange={e => setDateRange({ ...dateRange, to: e.target.value })}
        />
        <button className="alertBtn" onClick={exportPDF}>⬇ Export PDF</button>
      </div>

      <div id="minimal-dashboard" className="dashboard__wrap">
        {data ? (
          <>
            <section className="dashboard__cards">
              <div className="card">💰 Balance: ${data.balance}</div>
              <div className="card">📈 Sales: {data.sales}</div>
              {mockProfile === 'admin' && (
                <div className="card">🪙 Wallet: ${data.wallet}</div>
              )}
              <div className="card">🔗 Referral: ${data.referral}</div>
              <div className="card">📊 Estimated: ${data.estimated}</div>
            </section>

            <section className="dashboard__table">
              <h3>📦 Orders</h3>
              <table>
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Customer</th>
                    <th>Price</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.orders.map((order, i) => (
                    <tr key={i}>
                      <td>{order.invoice}</td>
                      <td>{order.customer}</td>
                      <td>${order.price}</td>
                      <td>
                        <span className={`pill ${order.status.toLowerCase()}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </>
        ) : (
          <p>Loading data...</p>
        )}
      </div>
    </main>
  );
}
