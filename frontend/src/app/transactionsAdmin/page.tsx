'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import AdminTransactionsTable from "@/components/AdminTransactionsTable";
import FilterTransactionType from "@/components/FilterTransactionType";
import "./transactionsAdmin.css";

type FilterTxType = 'purchase' | 'sale' | null;

type TradeRow = {
  id: number;
  transaction_type: 'buy' | 'sell';
  user: string;
  stock: string;
  code: string;
  total_amount: number;
  created_at: string;
  is_active: boolean;
  quantity: number;
  unit_price: number;
};

export default function TransactionsAdmin() {
  const { getAccessTokenSilently } = useAuth0();
  const [selectedType, setSelectedType] = useState<FilterTxType>(null);
  const [trades, setTrades] = useState<TradeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Cargar transacciones desde el backend
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const token = await getAccessTokenSilently();

        const res = await fetch(`http://localhost:8000/api/transactions/summary/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch transactions");
        }

        const data = await res.json();

        if (data?.transactions) {
          const parsedTrades = data.transactions.map((tx: any) => ({
            id: tx.id,
            transaction_type: tx.transaction_type,
            user: tx.client_name || "Unknown",
            stock: tx.stock_symbol || "—",
            code: tx.code || `TX-${tx.id}`,
            total_amount: tx.total_amount || 0,
            created_at: tx.created_at,
            is_active: tx.is_active,
            quantity: tx.quantity,
            unit_price: tx.unit_price,
          }));
          setTrades(parsedTrades);
        }

        setError(null);
      } catch (err) {
        console.error("❌ Error fetching transactions:", err);
        setError("Could not load transactions. Showing mock data.");
        setTrades([
          { id: 1, transaction_type: 'buy', user: 'Grecia Fuentes', stock: 'AAPL', code: 'TX123', total_amount: 1500, created_at: new Date().toISOString(), is_active: true, quantity: 10, unit_price: 150 },
          { id: 2, transaction_type: 'sell', user: 'Grecia Fuentes', stock: 'TSLA', code: 'TX124', total_amount: 900, created_at: new Date().toISOString(), is_active: false, quantity: 3, unit_price: 300 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [getAccessTokenSilently]);

  const filteredTradeRows = useMemo(() => {
    if (selectedType === 'purchase') return trades.filter((r) => r.transaction_type === 'buy');
    if (selectedType === 'sale') return trades.filter((r) => r.transaction_type === 'sell');
    return trades;
  }, [selectedType, trades]);

  return (
    <div className="div-trasactionAdmin">
      <h3 className="title-trasaction-admin">Transactions</h3>

      {error && <p className="error-message">{error}</p>}

      <div className="div-filter">
        <FilterTransactionType
          initial={null}
          includeAll={true}
          labels={{
            all: 'Purchases & Sales',
            purchase: 'Only Purchases',
            sale: 'Only Sales',
            button: 'Transaction Type',
          }}
          onTypeChange={(value) => setSelectedType(value)}
        />
      </div>

      <div className="div-all-trasactions">
        {loading ? (
          <p className="loading-text">Loading transactions...</p>
        ) : (
          <AdminTransactionsTable rows={filteredTradeRows} />
        )}
      </div>
    </div>
  );
}
