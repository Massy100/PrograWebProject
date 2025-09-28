"use client";

import React, { useEffect, useState } from "react";
import StockCard from "@/components/stockcard";
import '../../../styles/portfolio.css';
import { useRouter, useParams } from "next/navigation";
import Header from "@/components/Header";


type StockData = {
  id: number;
  symbol: string;
  name: string;
  quantity: number;
  purchase_price: number;
  current_value?: number;
  change?: number;
  category?: string;
};

export default function Portfolio() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<StockData[]>([]);
  const [filters, setFilters] = useState({
    name: "",
    priceMin: "",
    priceMax: "",
    category: "",
    sortBy: "name-asc",
  });
  const router = useRouter();

  const params = useParams(); 
  const portfolioId = params?.id; 


  const portfolioTitle = `My Portfolio ${portfolioId}`;

   useEffect(() => {
      
      const exampleStocks: StockData[] = [
        { id: 1, symbol: "AAPL", name: "Apple", quantity: 10, purchase_price: 150, current_value: 170, change: 13.3, category: "Tecnología"},
        { id: 2, symbol: "MSFT", name: "Microsoft", quantity: 5, purchase_price: 280, current_value: 300, change: 7.1, category:"Tecnología" },
        { id: 3, symbol: "GOOGL", name: "Google", quantity: 8, purchase_price: 120, current_value: 110, change: -8.3, category: "Finanzas" },
      ];

      setStocks(exampleStocks);
      setFilteredStocks(exampleStocks);
    }, []);
  

  /* const fetchStocks = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/stocks/"); 
      const data = await res.json();
      setStocks(data);
       setFilteredStocks(data);
    } catch (err) {
      console.error("Error fetching stocks:", err);
    }
  }; */

  

  /* useEffect(() => {
    fetchStocks();
  }, []); */

  
  const applyFiltersAndSort = (searchFilters: { name?: string; priceMin?: string; priceMax?: string; category?: string; sortBy?: string }) => {
 
    setFilters(prev => ({ ...prev, ...searchFilters }));

    let result = stocks.filter(stock => {
      const matchName = searchFilters.name
        ? stock.name.toLowerCase().includes(searchFilters.name.toLowerCase()) ||
          stock.symbol.toLowerCase().includes(searchFilters.name.toLowerCase())
        : true;

      const priceMin = Number(searchFilters.priceMin) || 0;
      const priceMax = Number(searchFilters.priceMax) || Infinity;
      const matchPrice = stock.purchase_price >= priceMin && stock.purchase_price <= priceMax;

      const matchCategory = searchFilters.category
        ? stock.category?.toLowerCase() === searchFilters.category.toLowerCase()
        : true;

      return matchName && matchPrice && matchCategory;
    });



    const sortBy = searchFilters.sortBy || filters.sortBy;
    switch (sortBy) {
      case "name-asc": result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case "name-desc": result.sort((a, b) => b.name.localeCompare(a.name)); break;
      case "quantity-asc": result.sort((a, b) => a.quantity - b.quantity); break;
      case "quantity-desc": result.sort((a, b) => b.quantity - a.quantity); break;
      case "purchase-asc": result.sort((a, b) => a.purchase_price - b.purchase_price); break;
      case "purchase-desc": result.sort((a, b) => b.purchase_price - a.purchase_price); break;
      case "current-asc": result.sort((a, b) => (a.current_value || 0) - (b.current_value || 0)); break;
      case "current-desc": result.sort((a, b) => (b.current_value || 0) - (a.current_value || 0)); break;
      case "change-asc": result.sort((a, b) => (a.change || 0) - (b.change || 0)); break;
      case "change-desc": result.sort((a, b) => (b.change || 0) - (a.change || 0)); break;
    }

    setFilteredStocks(result);
  };






  const goHome = () => {
    router.push("/portfolio"); 
  };


  

  return (
    
    <div className="page">
      <button className="backButton" onClick={goHome}>← Prev</button>
        
      <Header
        isLoggedIn={true}
        marketOpen={true}
        onSearch={(applyFiltersAndSort)} 
      />

      <header className="portfolioHeader">
        <h1>{portfolioTitle}</h1>
      </header>

   

      {stocks.length === 0 ? (
        <p className="noStocksText">You have no stocks in your portfolio.</p>
      ) : (
        <div className="stocksContainer">
          {filteredStocks.map((stock) => (
            <StockCard
              key={stock.id}
              symbol={stock.symbol}
              name={stock.name}
              quantity={stock.quantity}
              purchasePrice={stock.purchase_price}
              currentValue={stock.current_value}
              change={stock.change}
              category={stock.category} 
              variant="large"
            />
          ))}
        </div>
      )}


      
    </div>
  );
}
