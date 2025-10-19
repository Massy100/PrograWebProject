"use client";

import React, { useEffect, useState } from "react";
import PortfolioCard from "@/components/PortfolioCard";
import "./portfolio.css";
import PortfolioList from "@/components/PortfolioList";

interface Portfolio {
  id: number;
  name: string;
  created_at: string;
  avg_price: number;
  total_invested: number;
  current_value: number;
  is_active: boolean;
}

const PortfolioCarousel: React.FC = () => {
  const mockData: Portfolio[] = [
    {
      id: 1,
      name: "Growth 2025",
      created_at: "2024-03-12",
      avg_price: 150.4,
      total_invested: 5000,
      current_value: 6100,
      is_active: true,
    },
    {
      id: 2,
      name: "Tech Global",
      created_at: "2024-06-05",
      avg_price: 98.2,
      total_invested: 4200,
      current_value: 3600,
      is_active: false,
    },
    {
      id: 3,
      name: "Dividend Pro",
      created_at: "2023-11-18",
      avg_price: 73.5,
      total_invested: 2500,
      current_value: 3100,
      is_active: true,
    },
    {
      id: 4,
      name: "Balanced Crypto",
      created_at: "2024-01-20",
      avg_price: 22.7,
      total_invested: 1800,
      current_value: 950,
      is_active: false,
    },
    {
      id: 5,
      name: "National Bonds",
      created_at: "2023-08-30",
      avg_price: 45.9,
      total_invested: 3000,
      current_value: 3100,
      is_active: true,
    },
    {
      id: 6,
      name: "Emerging Stocks",
      created_at: "2023-12-01",
      avg_price: 67.2,
      total_invested: 4000,
      current_value: 5400,
      is_active: true,
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const visibleCards = 3; 
  const totalSlides = Math.ceil(mockData.length / visibleCards);


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
        <div className="carousel-container">
          <h2 className="carousel-title">Most Used Portfolios</h2>

          <div className="carousel-wrapper">
            <div
              className="carousel-track"
              style={{
                transform: `translateX(-${currentIndex * (100 / visibleCards)}%)`,
                width: `${(mockData.length * 100) / visibleCards}%`,
              }}
            >
              {mockData.map((p) => (
                <div className="carousel-slide" key={p.id}>
                  {/* este componente solo debe recibir  6 portafolio (pueden ser chance los que tienen mas movimientos)*/}
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
        {/* a este componente se le tendria que mandar la informacion del todos los portafolios */}
        <PortfolioList portfolios={mockData} />
      </div>
      
    </div>

  );
};

export default PortfolioCarousel;
