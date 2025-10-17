"use client";
import React, { useEffect, useRef } from "react";
import StockTrendCard from "./StockTrendCard";
import "../styles/StockGraphCarousel.css";

interface StockData {
  name: string;
  symbol: string;
  currentPrice: number;
  changePercent: number;
  history: number[];
  status: "up" | "down";
}

const StockGraphCarouselLoop: React.FC = () => {
  const mockStocks: StockData[] = [
    {
      name: "Apple Inc.",
      symbol: "AAPL",
      currentPrice: 185.12,
      changePercent: 2.34,
      history: [180, 181, 183, 184, 185],
      status: "up",
    },
    {
      name: "Tesla Motors",
      symbol: "TSLA",
      currentPrice: 240.76,
      changePercent: -1.8,
      history: [250, 248, 246, 243, 240],
      status: "down",
    },
    {
      name: "Microsoft Corp.",
      symbol: "MSFT",
      currentPrice: 330.56,
      changePercent: 1.12,
      history: [320, 323, 326, 328, 330],
      status: "up",
    },
    {
      name: "Amazon Inc.",
      symbol: "AMZN",
      currentPrice: 129.87,
      changePercent: 3.25,
      history: [123, 125, 127, 128, 129],
      status: "up",
    },
    {
      name: "NVIDIA",
      symbol: "NVDA",
      currentPrice: 410.44,
      changePercent: -0.65,
      history: [420, 417, 415, 412, 410],
      status: "down",
    },
    {
      name: "Meta Platforms",
      symbol: "META",
      currentPrice: 280.34,
      changePercent: -2.1,
      history: [290, 288, 285, 283, 280],
      status: "down",
    },
  ];

  const trackRef = useRef<HTMLDivElement | null>(null);

  // Duplicamos los stocks para crear efecto de loop
  const loopedStocks = [...mockStocks, ...mockStocks];

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let position = 0;
    let animationFrame: number;

    const move = () => {
      position -= 0.5; // 🔹 Velocidad (puedes ajustar)
      if (Math.abs(position) >= track.scrollWidth / 2) {
        position = 0; // 🔁 Reinicia para loop infinito
      }
      track.style.transform = `translateX(${position}px)`;
      animationFrame = requestAnimationFrame(move);
    };

    animationFrame = requestAnimationFrame(move);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <div className="loop-carousel-container">
      <h2 className="loop-carousel-title">Live Market Trends</h2>

      <div className="loop-carousel-wrapper">
        <div className="loop-carousel-track" ref={trackRef}>
          {loopedStocks.map((stock, i) => (
            <div className="loop-carousel-slide" key={i}>
              <StockTrendCard stocks={[stock]} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StockGraphCarouselLoop;
