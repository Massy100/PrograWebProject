'use client';

import { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import './report.css';


type TxType = 'buy' | 'sell';

type TxRow = {
  code?: string | null;
  stock?: string;
  transaction_type: TxType;
  total_amount: number | string;
  created_at: string | Date;
  is_active: boolean;
  quantity?: number;
  unit_price?: number | string;
};

type PortfolioData = {
  balance: number;
  sales: number;
  referral: number;
  estimated: number;
  transactions: TxRow[];
};

const mockPortfolios = ['Alpha', 'Beta', 'Gamma'];
const mockProfile = 'analyst';

export default function DashboardOverview() {
  const [portfolio, setPortfolio] = useState<string>('Alpha');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [data, setData] = useState<PortfolioData | null>(null);

  useEffect(() => {
    const base = portfolio === 'Alpha' ? 3000 : portfolio === 'Beta' ? 4000 : 5000;
    setData({
      balance: base + 468.96,
      sales: portfolio === 'Gamma' ? 120 : 82,
      referral: 234,
      estimated: base + 312.5,
      transactions: [
        {
          stock: 'Banco Industrial',
          code: 'BI001',
          transaction_type: 'buy',
          total_amount: 1200,
          created_at: new Date('2025-10-01'),
          is_active: true,
          quantity: 10,
          unit_price: 120,
        },
        {
          stock: 'Grupo Financiero',
          code: 'GF002',
          transaction_type: 'sell',
          total_amount: 800,
          created_at: new Date('2025-10-20'),
          is_active: false,
          quantity: 5,
          unit_price: 160,
        },
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
    pdf.text(`Portfolio: ${portfolio}`, 10, 10);
    pdf.text(`Profile: ${mockProfile}`, 10, 16);
    pdf.text(`Dates: ${dateRange.from || '—'} to ${dateRange.to || '—'}`, 10, 22);
    pdf.addImage(imgData, 'PNG', 10, 30, 190, 0);
    pdf.save(`overview-${portfolio}.pdf`);
  };

  return (
    <main className="panel">
      <h1 className="panel__title">📊 Overview</h1>

      <div className="dashboard__controls">
        <label>
          <strong>Select portfolio:</strong><br />
          <select value={portfolio} onChange={e => setPortfolio(e.target.value)}>
            {mockPortfolios.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </label>

        <label>
          <strong>From:</strong><br />
          <input
            type="date"
            value={dateRange.from}
            onChange={e => setDateRange({ ...dateRange, from: e.target.value })}
          />
        </label>

        <label>
          <strong>To:</strong><br />
          <input
            type="date"
            value={dateRange.to}
            onChange={e => setDateRange({ ...dateRange, to: e.target.value })}
          />
        </label>

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

            <section className="tx__wrap">
              <table className="tx__table">
                <colgroup>
                  <col />
                  <col />
                  <col />
                  <col />
                  <col />
                  <col />
                  <col />
                </colgroup>

                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Asset</th>
                    <th>Date</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {data.transactions
                    .filter(r => {
                      const txDate = new Date(r.created_at).getTime();
                      const fromDate = dateRange.from ? new Date(dateRange.from).getTime() : -Infinity;
                      const toDate = dateRange.to ? new Date(dateRange.to).getTime() : Infinity;
                      return txDate >= fromDate && txDate <= toDate;
                    })
                    .map((r, i) => {
                      const pill = r.transaction_type === 'sell' ? 'S' : 'B';
                      const pillClass = r.transaction_type === 'sell' ? 'is-sell' : 'is-buy';
                      const gain = Number(r.total_amount) >= 0;

                      return (
                        <tr key={i}>
                          <td>
                            <span className={`tx__pill ${pillClass}`}>{pill}</span>
                          </td>
                          <td className="td-action-name">
                            <div className="tx__asset">
                              {r.stock && <div className="tx__assetTitle" title={r.stock}>{r.stock}</div>}
                              {r.code && <div className="tx__assetCode" title={String(r.code)}>{r.code}</div>}
                            </div>
                          </td>
                          <td>
                            {new Date(r.created_at).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>
                          <td>{r.quantity ?? '—'}</td>
                          <td>Q.{r.unit_price != null ? r.unit_price : '—'}</td>
                          <td className={gain ? 'is-gain' : 'is-loss'}>Q.{r.total_amount}</td>
                          <td>
                            <i className={`tx__dot ${r.is_active ? 'ok' : 'off'}`} />
                          </td>
                        </tr>
                      );
                    })}
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
        {warranty}% warranty
      </div>
    </div>
  );
}
