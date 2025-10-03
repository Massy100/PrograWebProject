'use client';

import { useMemo, useState } from 'react';
import AdminTransactionsTable from "@/components/AdminTransactionsTable";
import AdminTransactionsMoneyTable from "@/components/AdminTrasactionsMoneyTable";
import FilterTransactionType from "@/components/FilterTransactionType";
import "./transactionsAdmin.css";

type FilterTxType = 'purchase' | 'sale' | 'money_movement' | null;

export default function TransactionsAdmin() {
  const [selectedType, setSelectedType] = useState<FilterTxType>(null);

  // Tus mocks (sin cambios)
  const mockRows = [
    { transaction_type: 'buy',  user: 'Grecia Fuentes', stock: 'AAPL', code: 'TX123', total_amount: 1500, created_at: new Date(), is_active: true,  quantity: 10, unit_price: 150 },
    { transaction_type: 'sell', user: 'Grecia Fuentes', stock: 'TSLA', code: 'TX124', total_amount: 900,  created_at: new Date(), is_active: false, quantity: 3,  unit_price: 300 },
    { transaction_type: 'buy',  user: 'Grecia Fuentes', stock: 'AAPL', code: 'TX125', total_amount: 1200, created_at: new Date(), is_active: true,  quantity: 8,  unit_price: 150 },
    { transaction_type: 'sell', user: 'Grecia Fuentes', stock: 'TSLA', code: 'TX126', total_amount: 600,  created_at: new Date(), is_active: true,  quantity: 2,  unit_price: 300 },
  ];

  const moneyMove = [
    { transaction_type: 'moneyMovement', user: 'Grecia Fuentes', code: '4585F6', total_amount: 1500, created_at: new Date(), bank: "Banrural" },
  ];

  // Filtrado SOLO para la tabla de compras/ventas cuando elijas purchase o sale
  const filteredTradeRows = useMemo(() => {
    if (selectedType === 'purchase') return mockRows.filter(r => r.transaction_type === 'buy');
    if (selectedType === 'sale')     return mockRows.filter(r => r.transaction_type === 'sell');
    // null (todas) o money_movement: devolvemos todas (para null)
    return mockRows;
  }, [selectedType, mockRows]);

  const showMoneyTable  = selectedType === 'money_movement';
  const showTradesTable = !showMoneyTable; // null | purchase | sale

  return (
    <div className="div-trasactionAdmin">
      <h3 className="title-trasaction-admin">Transactions</h3>

      <div className="div-filter">
        <FilterTransactionType
          initial={null}           // ver compras+ventas al inicio
          includeAll={true}        // agrega opción "All"
          labels={{
            all: 'Purchases & Sales',
            purchase: 'Only Purchases',
            sale: 'Only Sales',
            money_movement: 'Only Money Movements',
            button: 'Transaction Type',
          }}
          onTypeChange={(value) => setSelectedType(value)}
        />
      </div>

      <div className="div-all-trasactions">
        {showTradesTable && <AdminTransactionsTable rows={filteredTradeRows} />}
        {showMoneyTable  && <AdminTransactionsMoneyTable rows={moneyMove} />}
      </div>


    </div>
  );
}
