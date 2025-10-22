'use client';

import { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import './report.css';

type Order = {
  invoice: string;
  customer: string;
  price: number;
  status: 'Done' | 'Pending';
};

type PortfolioData = {
  balance: number;
  sales: number;
  referral: number;
  estimated: number;
  orders: Order[];
};

const mockPortfolios = ['Alpha', 'Beta', 'Gamma'];
const mockProfile = 'analyst';

export default function DashboardOverview() {
  const [portfolio, setPortfolio] = useState<string>('Alpha');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [data, setData] = useState<PortfolioData | null>(null);

  useEffect(() => {
    // Simula datos por portafolio
    const base = portfolio === 'Alpha' ? 3000 : portfolio === 'Beta' ? 4000 : 5000;
    setData({
      balance: base + 468.96,
      sales: portfolio === 'Gamma' ? 120 : 82,
      referral: 234,
      estimated: base + 312.5,
      orders: [
        { invoice: '#2369', customer: 'Miron', price: 1236, status: 'Done' },
        { invoice: '#2368', customer: 'John Doe', price: 1236, status: 'Pending' },
        { invoice: '#2367', customer: 'Angelica', price: 1236, status: 'Done' },
      ],
    });
  }, [portfolio]);

  const exportPDF = async () => {
    const element = document.getElementById('dashboard-pdf');
    if (!element || !data) return;

    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();

    pdf.setFontSize(12);
    pdf.text(`Portafolio: ${portfolio}`, 10, 10);
    pdf.text(`Perfil: ${mockProfile}`, 10, 16);
    pdf.text(`Fechas: ${dateRange.from || '—'} a ${dateRange.to || '—'}`, 10, 22);
    pdf.addImage(imgData, 'PNG', 10, 30, 190, 0);
    pdf.save(`overview-${portfolio}.pdf`);
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

      <div id="dashboard-pdf" className="dashboard__wrap">
        {data && (
          <>
            <section className="fc__grid">
              <Card title="Balance" value={data.balance} warranty={48} positive />
              <Card title="Sales" value={data.sales} warranty={48} positive={false} />
              <Card title="Referral" value={data.referral} warranty={48} positive={false} />
              <Card title="Estimated" value={data.estimated} warranty={48} positive />
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
        )}
      </div>
    </main>
  );
}

function Card({
  title,
  value,
  warranty,
  positive = true,
}: {
  title: string;
  value: number;
  warranty: number;
  positive?: boolean;
}) {
  return (
    <div className="fc__card">
      <div className="fc__title">{title.toUpperCase()}</div>
      <div className="fc__value">${value.toLocaleString()}</div>
      <div className={`fc__warranty ${positive ? 'green' : 'red'}`}>
        {warranty}% garantía
      </div>
    </div>
  );
}
