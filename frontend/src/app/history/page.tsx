'use client';

import { useState, useEffect } from 'react';
import './history.css'
import KpiCard from "@/components/KpiCard";
import ChartSwitcher from "@/components/ChartSwitcher";
import PortfolioList from "@/components/PortfolioList";
import FilterDate from '@/components/filterDate';
import TransactionsTable from '@/components/tableTrasactions';
import BigCardKpi from '@/components/BigCardKpi';

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

type Summary = {
  earned_total: number;
  invested_total: number;
  buy_count: number;
  sell_count: number;
  transactions_count: number;
  transactions: TxRow[];
};

export default function History() {
  const [rows, setRows] = useState<TxRow[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<{ start: string; end: string } | null>(null);

  // función para traer datos con o sin filtro
  async function fetchSummary(range?: { start: string; end: string }) {
    try {
      setLoading(true);

      let url = 'http://localhost:8000/api/transactions/summary/';
      if (range) {
        url += `?start-date=${range.start}&end-date=${range.end}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      setSummary({
        earned_total: data.earned_total,
        invested_total: data.invested_total,
        buy_count: data.buy_count,
        sell_count: data.sell_count,
        transactions_count: data.transactions_count,
        transactions: data.transactions,
      });

      setRows(data.transactions);
    } catch (err) {
      console.error("Error fetching summary:", err);
    } finally {
      setLoading(false);
    }
  }

  // cargar al inicio con "sin filtro" → backend devuelve todo
  useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <div className="div-purchaseSale">

      <div className="info-purchaseSale">
        <FilterDate
          onFilterChange={(range, label) => {
            console.log("Filter change:", range, label);
            fetchSummary(range ?? undefined); 
          }}
        />
        
        <h3 className='title-history'>History</h3>
        <div className="summary-div-transactions">
          <BigCardKpi title={''} value={''}/>
        </div>
        {/* <div className="summary-div-transactions">
          <KpiCard
            title="Earned Total"
            value={summary?.earned_total ?? 0}
            format="money"
            dark
          />
          <KpiCard
            title="Invested Total"
            value={summary?.invested_total ?? 0}
            format="money"
          />
          <KpiCard
            title="Stocks Buy"
            value={summary?.buy_count ?? 0}
            format="number"
          />
          <KpiCard
            title="Stocks Sell"
            value={summary?.sell_count ?? 0}
            format="number"
          />
        </div> */}

        <div className="div-grafics-portfolio">
          <div className="div-grafics">
            {summary && <ChartSwitcher summary={summary} />}
          </div>
          {/* <div className="div-portfolio">
            <PortfolioList />
          </div> */}
        </div>

        <h3 className="title_transactions">Transactions</h3>
        <div className="div-transactions">
          {loading ? (
            <p>Loading transactions...</p>
          ) : (
            <TransactionsTable rows={rows} />
          )}
        </div>
      </div>
    </div>
  );
}
