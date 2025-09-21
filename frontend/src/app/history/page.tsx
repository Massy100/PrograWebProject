'use client';

import { useState } from 'react';
import SearchResults from "@/components/searchResults";
import './history.css'
import TxTable from "@/components/tableTrasactions";
import KpiCard from "@/components/KpiCard";
import ChartSwitcher from "@/components/ChartSwitcher";
import PortfolioList from "@/components/PortfolioList";
import FilterDate from '@/components/filterDate';


export default function History() {


const rows = [
  {
    transaction_type: 'sell',
    stock: 'Microsoft',
    code: 'MSFT',
    created_at: '2025-09-16',
    quantity: 3,
    unit_price: 410.25,
    total_amount: 1230.75,
    is_active: true,
  },
  {
    transaction_type: 'buy',
    stock: 'NVIDIA',
    code: 'NVDA',
    created_at: '2025-09-14',
    quantity: 2,
    unit_price: 460,
    total_amount: -920,
    is_active: false,
  },
];


  return (
    <div className="div-purchaseSale">
      <SearchResults
        headerProps={{ isLoggedIn: true, marketOpen: true, totalAmount: 100 }}
        title="Resultados de la búsqueda"
      />

      <div className="info-purchaseSale">
        <FilterDate/>
        <div className="summary-div-transactions">
          <KpiCard
            title="Earned Total"
            value="700"
            format="money"
            dark
          />
          <KpiCard
            title="Invested Total"
            value="700"
            format="money"
          />
          <KpiCard
            title="Stocks Buy"
            value="700"
            format="number"
          />
          <KpiCard
            title="Stocks Buy"
            value="700"
            format="number"
          />
        </div>

        <div className="div-grafics-portfolio">
          <div className="div-grafics">
            <ChartSwitcher />
          </div>
          <div className="div-portfolio">
            <PortfolioList/>
          </div>
        </div>


        <h3 className="title_transactions">Transactions</h3>
        <div className="div-transactions">
          <TxTable rows={rows} />
        </div>
      </div>
    </div>
  )
}
