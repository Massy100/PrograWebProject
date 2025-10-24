'use client';

import { useState, useEffect, useMemo } from 'react';
import './history.css';
import ChartSwitcher from "@/components/ChartSwitcher";
import FilterDate from '@/components/filterDate';
import TransactionsTable from '@/components/tableTrasactions';
import BigCardKpi from '@/components/BigCardKpi';
import FilterTransactionType from "@/components/FilterTransactionType"; 

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


function generateMockData(): Summary {
  const stocks = ['AAPL', 'TSLA', 'AMZN', 'MSFT', 'NVDA', 'META', 'GOOGL', 'NFLX'];
  const transactions: TxRow[] = [];
  let invested = 0;
  let earned = 0;
  let buys = 0;
  let sells = 0;

  const today = new Date();
  for (let i = 0; i < 90; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const numTx = Math.floor(Math.random() * 4) + 1;

    for (let j = 0; j < numTx; j++) {
      const type = Math.random() > 0.45 ? 'buy' : 'sell';
      const hour = Math.floor(Math.random() * 24);
      const minute = Math.floor(Math.random() * 60);
      const amount = Math.floor(Math.random() * 3000 + 100);
      const stock = stocks[Math.floor(Math.random() * stocks.length)];

      const txDate = new Date(date);
      txDate.setHours(hour, minute, 0, 0);

      transactions.push({
        code: `TX-${i}-${j}`,
        stock,
        transaction_type: type,
        total_amount: amount,
        created_at: txDate.toISOString(),
        is_active: true,
        quantity: Math.floor(Math.random() * 10 + 1),
        unit_price: (amount / (Math.random() * 8 + 1)).toFixed(2),
      });

      if (type === 'buy') {
        invested += amount;
        buys++;
      } else {
        earned += amount;
        sells++;
      }
    }
  }

  return {
    earned_total: earned,
    invested_total: invested,
    buy_count: buys,
    sell_count: sells,
    transactions_count: transactions.length,
    transactions,
  };
}

export default function History() {
  const [rows, setRows] = useState<TxRow[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  const [rangeType, setRangeType] = useState<'Today' | 'Week' | 'Month' | 'Year' | 'Custom'>('Month');
  const [rangeDates, setRangeDates] = useState<{ start: string; end: string } | null>(null);

  const [selectedType, setSelectedType] = useState<'purchase' | 'sale' | null>(null);

  useEffect(() => {
    const mock = generateMockData();
    setSummary(mock);
    setRows(mock.transactions);
    setLoading(false);
  }, []);


  const filteredRows = useMemo(() => {
    if (!rows) return [];
    if (selectedType === 'purchase') return rows.filter(r => r.transaction_type === 'buy');
    if (selectedType === 'sale') return rows.filter(r => r.transaction_type === 'sell');
    return rows; 
  }, [selectedType, rows]);

  return (
    <div className="div-purchaseSale">
      <div className="info-purchaseSale">
        
        <FilterDate
          onFilterChange={(range, label) => {
            console.log('Filter change:', range, label);
            setRangeType(label as any);
            setRangeDates(range);
          }}
        />

        <h3 className="title-history">History</h3>

        {/*
          El backend debe enviar:
          - earned_total: total ganado
          - invested_total: total invertido
          - buy_count: cantidad de compras
          - sell_count: cantidad de ventas
        */}
        <div className="summary-div-transactions">
          {summary && (
            <BigCardKpi
              earnedTotal={summary.earned_total}
              investedTotal={summary.invested_total}
              stocksBuy={summary.buy_count}
              stocksSell={summary.sell_count}
            />
          )}
        </div>

        {/* 
          El backend debe enviar dentro de summary.transactions:
          - created_at: fecha y hora ISO (ej: "2025-10-21T14:30:00Z")
          - transaction_type: "buy" o "sell"
          - total_amount: monto total de la operación
          - (opcional) stock_symbol: símbolo o nombre del activo
        */}
        <div className="div-grafics-portfolio">
          <div className="div-grafics">
            {summary && (
              <ChartSwitcher
                summary={summary}
                rangeType={rangeType}
                rangeDates={rangeDates}
              />
            )}
          </div>
        </div>

        {/* 
          Aquí se muestran todas las transacciones filtradas por tipo.
        */}
        <h3 className="title_transactions">Transactions</h3>

        <div className="div-filter">
          <FilterTransactionType
            initial={null}            
            includeAll={true}         
            labels={{
              all: 'All Transactions',
              purchase: 'Only Purchases',
              sale: 'Only Sales',
              button: 'Transaction Type',
            }}
            onTypeChange={(value) => setSelectedType(value)}
          />
        </div>

        <div className="div-transactions">
          {loading ? (
            <p>Loading transactions...</p>
          ) : (
            <TransactionsTable rows={filteredRows} />
          )}
        </div>
      </div>
    </div>
  );
}
