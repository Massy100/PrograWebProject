"use client";

import React, { useEffect, useState } from "react";
import "./individualPortfolio.css";
import InfoPortfolioIndividual from "@/components/infoPortfolioIndivual";
import { useRouter, useParams } from "next/navigation";
import StockCard, { StockRow } from "@/components/stockcard";

interface Portfolio {
  id: number;
  name: string;
  created_at: string;
  avg_price: number;
  total_invested: number;
  current_value: number;
  is_active: boolean;
}

export default function PortfolioPage() {
  const [portfolioInfo, setPortfolioInfo] = useState<Portfolio | null>(null);
  const [stocks, setStocks] = useState<StockRow[]>([]);
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    const saved = sessionStorage.getItem("selectedPortfolio");
    if (saved) {
      const parsed = JSON.parse(saved);
      setPortfolioInfo(parsed);
    } else {
      console.warn("No portfolio data found, redirecting...");
      router.push("/portfolio");
    }

    // esto no va a existri porque aqui tiene que ir las acciones que se tienen en ese portafolio
    const exampleStocks: StockRow[] = [
      { symbol: "AAPL", name: "Apple Inc.", quantity: 10, purchasePrice: 150, averagePrice: 155, totalInvested: 1500, isActive: true, lastPurchaseDate: "2025-09-15", change: 13.3 },
      { symbol: "MSFT", name: "Microsoft Corp.", quantity: 5, purchasePrice: 280, averagePrice: 290, totalInvested: 1400, isActive: true, lastPurchaseDate: "2025-09-10", change: 7.1 },
    ];
    setStocks(exampleStocks);
  }, []);

  if (!portfolioInfo) return <div>Loading...</div>;

  return (
    <div className="div-individaulPortfolio">
      <div className="left-div">
        <a href="/portfolio" className="return-btn-portfolio">← Back</a>
        <InfoPortfolioIndividual data={portfolioInfo} />
      </div>
      <div className="right-div">
        <StockCard rows={stocks} />
      </div>
    </div>
  );
}
