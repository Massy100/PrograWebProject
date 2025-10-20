"use client";
import { JSX } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/SessionProvider";
import { FaTachometerAlt, FaWallet, FaHistory, FaChartBar, FaExchangeAlt, FaFileAlt } from "react-icons/fa";
import Link from "next/link";
import "../styles/navUser.css";

type OptionItem =
  | { name: string; icon: JSX.Element; href: string; type?: "link" }
  | { name: string; icon: JSX.Element; onClick: () => void; type: "action" };

export default function OptionsUser({ onOpenWallet }: { onOpenWallet?: () => void }) {
  const router = useRouter();
  const { logout } = useSession();

  const options: OptionItem[] = [
    { name: "Dashboard",    icon: <FaTachometerAlt className="optionIcon" />, href: "/dashboard-user", type: "link" },
    { name: "Stocks",    icon: <FaChartBar className="optionIcon" />, href: "/stocks", type: "link" },
    { name: "Portfolio",    icon: <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M21.706,5.291l-2.999-2.998C18.52,2.105,18.266,2,18,2H6C5.734,2,5.48,2.105,5.293,2.293L2.294,5.291 C2.112,5.472,2,5.722,2,5.999V19c0,1.103,0.897,2,2,2h16c1.103,0,2-0.897,2-2V5.999C22,5.722,21.888,5.472,21.706,5.291z M6.414,4 h11.172l0.999,0.999H5.415L6.414,4z M4,19V6.999h16L20.002,19H4z"></path><path d="M15 12L9 12 9 10 7 10 7 14 17 14 17 10 15 10z"></path></svg>,     href: "/portfolio",       type: "link" },
    { name: "History",      icon: <FaHistory className="optionIcon" />,      href: "/history",         type: "link" },

    // Wallet as an ACTION (opens panel)
    { name: "Wallet", icon: <FaWallet className="optionIcon" />, onClick: () => onOpenWallet?.(), type: "action" },

    { name: "Report",       icon: <FaFileAlt className="optionIcon" />,      href: "/report",          type: "link" },
    { name: "Purchase",icon: <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 1024 1024" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M882 272.1V144c0-17.7-14.3-32-32-32H174c-17.7 0-32 14.3-32 32v128.1c-16.7 1-30 14.9-30 31.9v131.7a177 177 0 0 0 14.4 70.4c4.3 10.2 9.6 19.8 15.6 28.9v345c0 17.6 14.3 32 32 32h676c17.7 0 32-14.3 32-32V535a175 175 0 0 0 15.6-28.9c9.5-22.3 14.4-46 14.4-70.4V304c0-17-13.3-30.9-30-31.9zM214 184h596v88H214v-88zm362 656.1H448V736h128v104.1zm234 0H640V704c0-17.7-14.3-32-32-32H416c-17.7 0-32 14.3-32 32v136.1H214V597.9c2.9 1.4 5.9 2.8 9 4 22.3 9.4 46 14.1 70.4 14.1s48-4.7 70.4-14.1c13.8-5.8 26.8-13.2 38.7-22.1.2-.1.4-.1.6 0a180.4 180.4 0 0 0 38.7 22.1c22.3 9.4 46 14.1 70.4 14.1 24.4 0 48-4.7 70.4-14.1 13.8-5.8 26.8-13.2 38.7-22.1.2-.1.4-.1.6 0a180.4 180.4 0 0 0 38.7 22.1c22.3 9.4 46 14.1 70.4 14.1 24.4 0 48-4.7 70.4-14.1 3-1.3 6-2.6 9-4v242.2zm30-404.4c0 59.8-49 108.3-109.3 108.3-40.8 0-76.4-22.1-95.2-54.9-2.9-5-8.1-8.1-13.9-8.1h-.6c-5.7 0-11 3.1-13.9 8.1A109.24 109.24 0 0 1 512 544c-40.7 0-76.2-22-95-54.7-3-5.1-8.4-8.3-14.3-8.3s-11.4 3.2-14.3 8.3a109.63 109.63 0 0 1-95.1 54.7C233 544 184 495.5 184 435.7v-91.2c0-.3.2-.5.5-.5h655c.3 0 .5.2.5.5v91.2z"></path></svg>,  href: "/purchase",   type: "link" },
    { name: "Sale",icon: <FaExchangeAlt className="optionIcon" />,  href: "/sale",   type: "link" },

    { name: "Logout", icon: <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M16 13L16 11 7 11 7 8 2 12 7 16 7 13z"></path><path d="M20,3h-9C9.897,3,9,3.897,9,5v4h2V5h9v14h-9v-4H9v4c0,1.103,0.897,2,2,2h9c1.103,0,2-0.897,2-2V5C22,3.897,21.103,3,20,3z"></path></svg>,
      onClick: () => { logout(); router.push("/"); },
      type: "action",
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
              aria-label={option.name}
              title={option.name}
            >
              {option.icon}
              <span className="optionName">{option.name}</span>
            </button>
          ) : (
            <Link key={option.name} href={option.href} className="optionLink" passHref>
              <button className="optionButton" aria-label={option.name} title={option.name}>
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