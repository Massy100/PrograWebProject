// src/components/navUsers.tsx
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
    { name: "Portfolio",    icon: <FaChartBar className="optionIcon" />,     href: "/portfolio",       type: "link" },
    { name: "History",      icon: <FaHistory className="optionIcon" />,      href: "/history",         type: "link" },

    // Wallet as an ACTION (opens panel)
    { name: "Wallet", icon: <FaWallet className="optionIcon" />, onClick: () => onOpenWallet?.(), type: "action" },

    { name: "Report",       icon: <FaFileAlt className="optionIcon" />,      href: "/report",          type: "link" },
    { name: "Purchase/Sale",icon: <FaExchangeAlt className="optionIcon" />,  href: "/purchase-sale",   type: "link" },

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


// "use client";
// import { useState, useRef, JSX } from "react";
// import { useRouter } from "next/navigation";
// import { useSession } from "@/components/SessionProvider";
// import { FaArrowLeft, FaArrowRight, FaTachometerAlt, FaWallet, FaHistory, FaChartBar, FaExchangeAlt, FaFileAlt } from "react-icons/fa";
// import Link from "next/link";
// import "../styles/navUser.css";

// type OptionItem =
//   | { name: string; icon: JSX.Element; href: string; type?: "link" }
//   | { name: string; icon: JSX.Element; onClick: () => void; type: "action" };

// export default function OptionsUser() {
//   const router = useRouter();
//   const { logout } = useSession();

//   const options: OptionItem[] = [
//     { name: "Dashboard", icon: <FaTachometerAlt className="optionIcon" />, href: "/dashboard", type: "link" },
//     { name: "Portfolio", icon: <FaChartBar className="optionIcon" />, href: "/portfolio", type: "link" },
//     { name: "History", icon: <FaHistory className="optionIcon" />, href: "/history", type: "link" },
//     { name: "Wallet", icon: <FaWallet className="optionIcon" />, href: "/wallet", type: "link" },
//     { name: "Report", icon: <FaFileAlt className="optionIcon" />, href: "/report", type: "link" },
//     { name: "Purchase/Sale", icon: <FaExchangeAlt className="optionIcon" />, href: "/purchase-sale", type: "link" },

//     // ---- Opción Logout (acción) ----
//     {name: "Logout", icon: <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M16 13L16 11 7 11 7 8 2 12 7 16 7 13z"></path><path d="M20,3h-9C9.897,3,9,3.897,9,5v4h2V5h9v14h-9v-4H9v4c0,1.103,0.897,2,2,2h9c1.103,0,2-0.897,2-2V5C22,3.897,21.103,3,20,3z"></path></svg>,
//       onClick: () => {
//         logout();
//         router.push("/");
//       },
//       type: "action",
//     },
//   ];

//   const VISIBLE_COUNT = 5;
//   const [startIdx, setStartIdx] = useState(0);
//   const [animDirection, setAnimDirection] = useState<"left" | "right" | null>(null);
//   const timeoutRef = useRef<NodeJS.Timeout | null>(null);
//   const endIdx = startIdx + VISIBLE_COUNT;
//   const canGoLeft = startIdx > 0;
//   const canGoRight = endIdx < options.length;

//   const handleLeft = () => {
//     if (!canGoLeft) return;
//     setAnimDirection("left");
//     if (timeoutRef.current) clearTimeout(timeoutRef.current);
//     timeoutRef.current = setTimeout(() => {
//       setStartIdx((idx) => idx - 1);
//       setAnimDirection(null);
//     }, 350);
//   };

//   const handleRight = () => {
//     if (!canGoRight) return;
//     setAnimDirection("right");
//     if (timeoutRef.current) clearTimeout(timeoutRef.current);
//     timeoutRef.current = setTimeout(() => {
//       setStartIdx((idx) => idx + 1);
//       setAnimDirection(null);
//     }, 350);
//   };

//   return (
//     <div className="optionsContainer">
//       <button className="arrowButton" onClick={handleLeft} disabled={!canGoLeft} aria-label="Anterior">
//         <FaArrowLeft className="arrowIcon" />
//       </button>

//       <div className="carousel">
//         {options.slice(startIdx, endIdx).map((option) => {
//           let animClass = "optionCard";
//           if (animDirection === "left") animClass += " slide-out";
//           if (animDirection === "right") animClass += " slide-in";

//           // Render según tipo
//           if (option.type === "action") {
//             return (
//               <div key={option.name} className={animClass}>
//                 <button className="optionButton" onClick={option.onClick} aria-label={option.name} title={option.name}>
//                   {option.icon}
//                   <span className="optionName">{option.name}</span>
//                 </button>
//               </div>
//             );
//           }

//           return (
//             <div key={option.name} className={animClass}>
//               <Link href={option.href} className="optionLink" passHref>
//                 <button className="optionButton">
//                   {option.icon}
//                   <span className="optionName">{option.name}</span>
//                 </button>
//               </Link>
//             </div>
//           );
//         })}
//       </div>

//       <button className="arrowButton" onClick={handleRight} disabled={!canGoRight} aria-label="Siguiente">
//         <FaArrowRight className="arrowIcon" />
//       </button>
//     </div>
//   );
// }
