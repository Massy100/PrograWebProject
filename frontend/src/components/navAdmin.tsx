"use client";
import { FaUsers, FaChartLine, FaExchangeAlt, FaTachometerAlt } from "react-icons/fa";
import Link from "next/link";
import '../styles/navAdmin.css';

const options = [
  { name: "User management", icon: <FaUsers />, href: "/users" },
  { name: "Stock catalog", icon: <FaChartLine />, href: "/stocks" },
  { name: "Transactions", icon: <FaExchangeAlt />, href: "/transactions" },
  { name: "Dashboard", icon: <FaTachometerAlt />, href: "/dashboard" },
];

export default function SidebarOptions() {
  return (
    <div className="sidebar">
      {options.map((option) => (
        <Link href={option.href} key={option.name} className="iconLink">
          <div className="iconWrapper">
            {option.icon}
            <span className="tooltip">{option.name}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
