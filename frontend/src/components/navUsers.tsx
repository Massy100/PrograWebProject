"use client";
import { JSX } from "react";
import { useRouter } from "next/navigation";
import { useAuth0 } from '@auth0/auth0-react';
import { FaTachometerAlt, FaWallet, FaHistory, FaChartBar, FaExchangeAlt, FaFileAlt } from "react-icons/fa";
import Link from "next/link";
import "../styles/navUser.css";

type OptionItem =
  | { name: string; icon: JSX.Element; href: string; type?: "link" }
  | { name: string; icon: JSX.Element; onClick: () => void; type: "action" };

export default function OptionsUser({ onOpenWallet }: { onOpenWallet?: () => void }) {
  const { logout } = useAuth0();
  const router = useRouter(); // <-- AÑADIDO

  const options: OptionItem[] = [
    { name: "Dashboard", icon: <FaTachometerAlt className="optionIcon" />, href: "/dashboard-user", type: "link" },
    { name: "Stocks", icon: <FaChartBar className="optionIcon" />, href: "/stocks", type: "link" },
    { name: "Portfolio", icon: <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M21.706,5.291l-2.999-2.998C18.52,2.105,18.266,2,18,2H6C5.734,2,5.48,2.105,5.293,2.293L2.294,5.291 C2.112,5.472,2,5.722,2,5.999V19c0,1.103,0.897,2,2,2h16c1.103,0,2-0.897,2-2V5.999C22,5.722,21.888,5.472,21.706,5.291z M6.414,4 h11.172l0.999,0.999H5.415L6.414,4z M4,19V6.999h16L20.002,19H4z"></path><path d="M15 12L9 12 9 10 7 10 7 14 17 14 17 10 15 10z"></path></svg>, href: "/portfolio", type: "link" },
    { name: "History", icon: <FaHistory className="optionIcon" />, href: "/history", type: "link" },

    { name: "Wallet", icon: <FaWallet className="optionIcon" />, onClick: () => onOpenWallet?.(), type: "action" },

    { name: "Report", icon: <FaFileAlt className="optionIcon" />, href: "/report", type: "link" },
    { name: "Purchase", icon: <FaFileAlt className="optionIcon" />, href: "/purchase", type: "link" },
    { name: "Sale", icon: <FaExchangeAlt className="optionIcon" />, href: "/sale", type: "link" },

    {
      name: "Logout",
      icon: <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M16 13L16 11 7 11 7 8 2 12 7 16 7 13z"></path><path d="M20,3h-9C9.897,3,9,3.897,9,5v4h2V5h9v14h-9v-4H9v4c0,1.103,0.897,2,2,2h9c1.103,0,2-0.897,2-2V5C22,3.897,21.103,3,20,3z"></path></svg>,
      type: "action",
      onClick: () => {
        localStorage.clear();
        document.cookie = "auth=; path=/; max-age=0;";
        logout();
        router.push("/");
        console.log("si tendria que hacer el cambio")
      }
    },
  ];

  return (
    <nav className="optionsContainer no-carousel" aria-label="User navigation">
      <div className="optionsRow">
        {options.map((option) =>
          option.type === "action" ? (
            <button
              key={option.name}
              className="optionButton"
              onClick={option.onClick}
            >
              {option.icon}
              <span className="optionName">{option.name}</span>
            </button>
          ) : (
            <Link key={option.name} href={option.href} className="optionLink" passHref>
              <button className="optionButton">
                {option.icon}
                <span className="optionName">{option.name}</span>
              </button>
            </Link>
          )
        )}
      </div>
    </nav>
  );
}
