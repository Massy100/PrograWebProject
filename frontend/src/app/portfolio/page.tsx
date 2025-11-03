  "use client";

  import React, { useEffect, useState } from "react";
  import PortfolioCard from "@/components/PortfolioCard";
  import PortfolioList from "@/components/PortfolioList";
  import PortfolioGrowthChart from "@/components/PortfolioGrowthChart";
  import { useAuth0 } from "@auth0/auth0-react";
  import "./portfolio.css";

  interface Portfolio {
    id: number;
    name: string;
    created_at: string;
    avg_price: number;
    total_invested: number;
    current_value: number;
    is_active: boolean;
  }

  interface GrowthPoint {
    month: string;
    [key: string]: number | string;
  }

  const PortfolioCarousel: React.FC = () => {
    const { getAccessTokenSilently } = useAuth0();

    const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
    const [growthData, setGrowthData] = useState<GrowthPoint[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const visibleCards = 3;

    useEffect(() => {
      if (!getAccessTokenSilently) return;

      (async () => {
        try {
          const token = await getAccessTokenSilently();

          const currentUser = localStorage.getItem("auth");
          const userId = currentUser ? JSON.parse(currentUser).id : null;
          if (!userId) {
            console.error("User not found in localStorage");
            return;
          }

          const portfoliosRes = await fetch(process.env.NEXT_PUBLIC_API_URL + "/portfolio/portfolios/", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          });

          const growthRes = await fetch(
            process.env.NEXT_PUBLIC_API_URL + `/portfolio/value/year-summary/?client_id=${userId}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              cache: "no-store",
            }
          );

          if (!portfoliosRes.ok) throw new Error("Error fetching portfolios");
          if (!growthRes.ok) throw new Error("Error fetching growth data");

          const portfoliosData = await portfoliosRes.json();
          const growthDataJson = await growthRes.json();

          const finalPortfolios = Array.isArray(portfoliosData)
            ? portfoliosData
            : portfoliosData.results || [];
          setPortfolios(finalPortfolios);

          setGrowthData(Array.isArray(growthDataJson) ? growthDataJson : []);
        } catch (err) {
          console.error("❌ Error loading portfolios:", err);
        }
      })();
    }, [getAccessTokenSilently]);

    const totalSlides = Math.ceil(portfolios.length / visibleCards);

    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % totalSlides);
      }, 15000);
      return () => clearInterval(interval);
    }, [totalSlides]);

    const goToSlide = (index: number) => setCurrentIndex(index);

    return (
      <div className="div-portfolio">
        <div className="div-portfolio-info">
          <PortfolioGrowthChart
            portfolios={portfolios.map((p) => ({ id: p.id, name: p.name }))}
            growthData={growthData}
          />

          <div className="carousel-container">
            <h2 className="carousel-title">Most Used Portfolios</h2>

            <div className="carousel-wrapper">
              <div
                className="carousel-track"
                style={{
                  transform: `translateX(-${currentIndex * (100 / visibleCards)}%)`,
                  width: `${(portfolios.length * 100) / visibleCards}%`,
                }}
              >
                {portfolios.slice(0, 6).map((p) => (
                  <div className="carousel-slide" key={p.id}>
                    <PortfolioCard data={p} />
                  </div>
                ))}
              </div>
            </div>

            <div className="carousel-dots">
              {Array.from({ length: totalSlides }).map((_, idx) => (
                <span
                  key={idx}
                  className={`dot ${idx === currentIndex ? "active" : ""}`}
                  onClick={() => goToSlide(idx)}
                ></span>
              ))}
            </div>
          </div>
          <PortfolioList portfolios={portfolios} />
        </div>
      </div>
    );
  };

  export default PortfolioCarousel;
