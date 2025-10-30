"use client";
import { JSX, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth0 } from "@auth0/auth0-react";
import Link from "next/link";
import {
  FaTachometerAlt,
  FaWallet,
  FaHistory,
  FaChartBar,
  FaExchangeAlt,
  FaFileAlt,
} from "react-icons/fa";

import MarketClosedModal from "../components/MarketClosedModal";
import "../styles/navUser.css";
import { useMarketStatus } from "@/hook/useMarketStatus";

export default function OptionsUser({ onOpenWallet }: { onOpenWallet?: () => void }) {
  const { logout } = useAuth0();
  const router = useRouter();
  const marketOpen = useMarketStatus();

  const [showModal, setShowModal] = useState(false);

  const handleRestrictedAction = (path: string) => {
    if (!marketOpen) {
      setShowModal(true);
      return;
    }
    router.push(path);
  };

  const options = [
    { name: "Dashboard", icon: <FaTachometerAlt className="optionIcon" />, href: "/dashboard-user" },
    { name: "Stocks", icon: <FaChartBar className="optionIcon" />, href: "/stocks" },
    { name: "Portfolio", icon: <FaWallet className="optionIcon" />, href: "/portfolio" },
    { name: "History", icon: <FaHistory className="optionIcon" />, href: "/history" },
    { name: "Wallet", icon: <FaWallet className="optionIcon" />, onClick: () => onOpenWallet?.() },
    { name: "Report", icon: <FaFileAlt className="optionIcon" />, href: "/report" },
    {
      name: "Purchase",
      icon: <FaFileAlt className="optionIcon" />,
      onClick: () => handleRestrictedAction("/purchase"),
    },
    {
      name: "Sale",
      icon: <FaExchangeAlt className="optionIcon" />,
      onClick: () => handleRestrictedAction("/sale"),
    },
    {
      name: "Logout",
      icon: (
        <svg
          stroke="currentColor"
          fill="currentColor"
          viewBox="0 0 24 24"
          height="1em"
          width="1em"
        >
          <path d="M16 13L16 11 7 11 7 8 2 12 7 16 7 13z"></path>
          <path d="M20,3h-9C9.897,3,9,3.897,9,5v4h2V5h9v14h-9v-4H9v4c0,1.103,0.897,2,2,2h9c1.103,0,2-0.897,2-2V5 C22,3.897,21.103,3,20,3z"></path>
        </svg>
      ),
      onClick: () => {
        localStorage.clear();
        document.cookie = "auth=; path=/; max-age=0;";
        logout();
        router.push("/");
      },
    },
  ];

  return (
    <>
      <nav className="optionsContainer no-carousel" aria-label="User navigation">
        <div className="optionsRow">
          {options.map((option) => (
            <button
              key={option.name}
              className="optionButton"
              onClick={option.onClick ?? (() => router.push(option.href!))}
            >
              {option.icon}
              <span className="optionName">{option.name}</span>
            </button>
          ))}
        </div>
      </nav>

      <MarketClosedModal show={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
