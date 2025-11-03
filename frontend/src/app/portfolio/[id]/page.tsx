"use client";

import React, { useEffect, useState } from "react";
import "./individualPortfolio.css";
import InfoPortfolioIndividual from "@/components/infoPortfolioIndivual";
import { useRouter, useParams } from "next/navigation";
import StockCard, { StockRow } from "@/components/stockcard";
import { useAuth0 } from "@auth0/auth0-react";

interface Portfolio {
  id: number;
  name: string;
  created_at: string;
  average_price: number;
  total_inversion: number;
  current_value: number;
  is_active: boolean;
}

export default function PortfolioPage() {
  const { getAccessTokenSilently } = useAuth0();
  const [portfolioInfo, setPortfolioInfo] = useState<Portfolio | null>(null);
  const [stocks, setStocks] = useState<StockRow[]>([]);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const router = useRouter();

  const portfolioId = params?.id;

  useEffect(() => {
    if (!portfolioId) return;

    (async () => {
      try {
        const token = await getAccessTokenSilently();

        const portfolioRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/portfolio/portfolios/${portfolioId}/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        if (!portfolioRes.ok) throw new Error("Error fetching portfolio data");
        const portfolioData = await portfolioRes.json();
        setPortfolioInfo(portfolioData);
        const investmentsRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/portfolio/investments/?portfolio=${portfolioId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        if (!investmentsRes.ok) throw new Error("Error fetching investments");
        const investmentsData = await investmentsRes.json();

        const rows: StockRow[] = investmentsData.map((inv: any) => ({
          symbol: inv.stock.symbol,
          name: inv.stock.name,
          quantity: inv.quantity,
          purchasePrice: Number(inv.purchase_price),
          averagePrice: Number(inv.average_price),
          totalInvested: Number(inv.total_invested),
          isActive: inv.is_active,
          lastPurchaseDate: new Date(inv.purchased_at).toLocaleDateString(),
          change: inv.gain_loss_percentage?.toFixed(2) ?? 0,
        }));

        setStocks(rows);
      } catch (err) {
        console.error("❌ Error loading portfolio:", err);
        router.push("/portfolio");
      } finally {
        setLoading(false);
      }
    })();
  }, [portfolioId, getAccessTokenSilently]);

  if (loading) return <div>Loading...</div>;
  if (!portfolioInfo) return <div>No portfolio found</div>;

  return (
    <div className="div-individaulPortfolio">
      <div className="left-div">
        <a href="/portfolio" className="return-btn-portfolio">
          ← Back
        </a>
        <InfoPortfolioIndividual data={portfolioInfo} />
      </div>

      <div className="right-div">
        <StockCard rows={stocks} />
      </div>
    </div>
  );
}
