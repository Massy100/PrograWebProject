'use client';
import { useAuth0 } from '@auth0/auth0-react';
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



export default function History() {
  const [rows, setRows] = useState<TxRow[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  const [rangeType, setRangeType] = useState<'Today' | 'Week' | 'Month' | 'Year' | 'Custom'>('Month');
  const [rangeDates, setRangeDates] = useState<{ start: string; end: string } | null>(null);

  const [selectedType, setSelectedType] = useState<'purchase' | 'sale' | null>(null);

  const { getAccessTokenSilently } = useAuth0();

  const fetchTransactions = async () => {
      try {

        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const token = await getAccessTokenSilently();

        const auth = localStorage.getItem('auth');
        if (!auth) return;
        const user = JSON.parse(auth);

        const response = await fetch(baseUrl + 
          `/transactions/summary/?client_id=${user.client_id}`, {
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
        setRows(formattedResult);
        const dataSummary: Summary = {
          transactions_count: result.transactions_count,
          buy_count: result.buy_count,
          sell_count: result.sell_count,
          invested_total: result.invested_total,
          earned_total: result.earned_total,
          transactions: result.transactions
        }; 
        setSummary(dataSummary);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        return [];
      }
    }

  useEffect(() => {
    fetchTransactions();
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
        <div className='transactions-header'>  
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
