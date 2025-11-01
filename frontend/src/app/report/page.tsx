'use client';

import { use, useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import './report.css';
import { useAuth0, User } from '@auth0/auth0-react';

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
  gain: number;
  gain_percentage: number;
  currently_invested: number;
};

type PortfolioBasic = {
  id: number;
  name: string;
}


export default function DashboardOverview() {
  const [portfolio, setPortfolio] = useState<number>(0);
  const [portfolios, setPortfolios] = useState<PortfolioBasic[]>();
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [data, setData] = useState<PortfolioData | null>(null);
  const [transactionData, setTransactionData] = useState<TxRow[]>([]);
  const { getAccessTokenSilently } = useAuth0();

  const fetchUserPortfolios = async () => {
    // Placeholder for fetching user portfolios if needed
    const auth = localStorage.getItem('auth');
    if (!auth) return;
    const user = JSON.parse(auth);
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    const token = await getAccessTokenSilently();

    const res = await fetch(baseUrl + `/portfolio/portfolios/?client_id=${user.client_id}`,
        {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },}
      );

     const data = res.json();
     const portfolioNames = (await data).map((p: PortfolioBasic) => ({ id: p.id, name: p.name }));
     setPortfolios(portfolioNames);
     if (portfolioNames.length > 0) {
       setPortfolio(portfolioNames[0].id);
     }
  };

  useEffect(() => {
    fetchUserPortfolios();
  }, []);

  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const token = await getAccessTokenSilently();
        const response = await fetch(baseUrl + 
          `/portfolio/value/gain/?start_date=${dateRange.from}&end_date=${dateRange.to}&portfolio_id=${portfolio}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch data');

        const result = response.json();
        setData({
          balance: (await result).balance,
          gain: (await result).gain,
          gain_percentage: (await result).gain_percent,
          currently_invested: (await result).total_invested,
        });
      } catch (error) {
        console.error('Error connecting to backend:', error);
        setData(null);
      }
    };

    const fetchTransactions = async () => {
      try {

        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const token = await getAccessTokenSilently();

        const auth = localStorage.getItem('auth');
        if (!auth) return;
        const user = JSON.parse(auth);

        const response = await fetch(baseUrl + 
          `/transactions/summary/?start-date=${dateRange.from}&end-date=${dateRange.to}&client_id=${user.client_id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch transactions');
        const result = await response.json();
        const transactions = result.transactions;
        const formattedResult = transactions.flatMap((tx: any )=> tx.details.map((detail: any) => ({
          code: tx.code,
          stock: detail.stock,
          transaction_type: tx.transaction_type,
          total_amount: detail.total_amount,
          created_at: tx.created_at,
          is_active: tx.is_active,
          quantity: detail.quantity,
          unit_price: detail.unit_price,
        })));
        setTransactionData(formattedResult);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setTransactionData([]);
      }
    }
    if (dateRange.from !== '' && dateRange.to !== '' && portfolio !== 0) {
      fetchPortfolioData();
      fetchTransactions();
    }

  }, [dateRange]);

  const exportPDF = async () => {
    const element = document.getElementById('dashboard-pdf');
    if (!element || !data) return;

    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });

    const margin = 40;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.setTextColor('#021631');
    pdf.text('Portfolio Summary', margin, margin);

    const portfolioName = portfolios!.map((p: PortfolioBasic) => {
      if (p.id == portfolio) {
        return p.name;
      }
    });

    pdf.setFontSize(11);
    pdf.setTextColor('#6b7280');
    pdf.text(`Portfolio: ${portfolioName}`, margin, margin + 20);
    pdf.text(`Profile: Client`, margin, margin + 35);
    pdf.text(`Date range: ${dateRange.from || '—'} to ${dateRange.to || '—'}`, margin, margin + 50);

    const imgWidth = pageWidth - margin * 2;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const imgY = margin + 70;

    if (imgY + imgHeight > pageHeight) {
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
    } else {
      pdf.addImage(imgData, 'PNG', margin, imgY, imgWidth, imgHeight);
    }

    pdf.save(`summary-${portfolio}.pdf`);
  };

  return (
    <main className="panel">
      <h1 className="panel__title">Summary by date</h1>

      <div className="dashboard__controls">
        <label>
          <strong>Select portfolio:</strong><br />
          <select value={portfolio} onChange={e => setPortfolio(Number(e.target.value))}>
            {portfolios && portfolios.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
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

        {
          portfolio !== 0 && (<button className="alertBtn" onClick={exportPDF}>⬇ Export PDF</button>)
        }
        
      </div>

      <div id="dashboard-pdf" className="dashboard__wrap">
        {data && (
          <>
            <h2>Portfolio Summary</h2>
            <section className="fc__grid">
              <Card title="Balance" value={data.balance} />
              <Card title="Gain" value={data.gain} warranty={data.gain_percentage} positive={data.gain_percentage >= 0} />
              <Card title="Currently invested" value={data.currently_invested} />
            </section>

            <h2>Transactions Summary</h2>
            <section className="tx__wrap">
              <table className="tx__table">
                <colgroup><col /><col /><col /><col /><col /><col /><col /></colgroup>

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
                  {transactionData
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
                              {r.stock}
                          </td>
                          <td>
                            {new Date(r.created_at).toLocaleDateString('en-US', {
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
  positive = true,
  warranty,
}: {
  title: string;
  value: number;
  warranty?: number;
  positive?: boolean;
}) {
  return (
    <div className="fc__card">
      <div className="fc__title">{title.toUpperCase()}</div>
      <div className="fc__value">${value.toLocaleString('en-US')}</div>
      {
        warranty !== undefined && (
          <div className={`fc__warranty ${positive ? 'green' : 'red'}`}>
        {warranty}% percentage
      </div>
        )
      }
      
    </div>
  );
}
