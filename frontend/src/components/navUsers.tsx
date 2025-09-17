"use client";
import { useState, useRef } from "react";
import { FaArrowLeft, FaArrowRight, FaTachometerAlt, FaWallet, FaHistory, FaChartBar, FaExchangeAlt, FaFileAlt } from "react-icons/fa";
import Link from "next/link";
import '../styles/navUser.css';
const options = [
    { name: "Dashboard", icon: <FaTachometerAlt className="optionIcon" />, href: "/dashboard" },
    { name: "Portfolio", icon: <FaChartBar className="optionIcon" />, href: "/portfolio" },
    { name: "History", icon: <FaHistory className="optionIcon" />, href: "/history" },
    { name: "Wallet", icon: <FaWallet className="optionIcon" />, href: "/wallet" },
    { name: "Report", icon: <FaFileAlt className="optionIcon" />, href: "/report" },
    { name: "Purchase/Sale", icon: <FaExchangeAlt className="optionIcon" />, href: "/purchase-sale" },
];

const VISIBLE_COUNT = 5;

export default function OptionsUser() {
    const [startIdx, setStartIdx] = useState(0);
    const [animDirection, setAnimDirection] = useState<'left'|'right'|null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const endIdx = startIdx + VISIBLE_COUNT;
    const canGoLeft = startIdx > 0;
    const canGoRight = endIdx < options.length;

    const handleLeft = () => {
        if (canGoLeft) {
            setAnimDirection('left');
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
                setStartIdx(idx => idx - 1);
                setAnimDirection(null);
            }, 350);
        }
    };
    const handleRight = () => {
        if (canGoRight) {
            setAnimDirection('right');
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
                setStartIdx(idx => idx + 1);
                setAnimDirection(null);
            }, 350);
        }
    };

    return (
        <div className="optionsContainer" >
            <button className="arrowButton" onClick={handleLeft} disabled={!canGoLeft}>
                <FaArrowLeft className="arrowIcon" />
            </button>
                <div className="carousel">
                    {options.slice(startIdx, endIdx).map((option, i) => {
                        let animClass = "optionCard";
                        if (animDirection === 'left') animClass += " slide-out";
                        if (animDirection === 'right') animClass += " slide-in";
                        return (
                            <div key={option.name} className="animClass">
                                <Link href={option.href} className="optionLink" passHref>
                                    <button className="optionButton">
                                        {option.icon}
                                        <span className="optionName">{option.name}</span>
                                    </button>
                                </Link>
                            </div>
                        );
                    })}
                </div>
            <button className="arrowButton" onClick={handleRight} disabled={!canGoRight}>
                <FaArrowRight className="arrowIcon" />
            </button>
        </div>
    );
}
