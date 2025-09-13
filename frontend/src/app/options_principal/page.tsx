"use client";
import { FaUsers, FaChartLine, FaExchangeAlt, FaTachometerAlt } from "react-icons/fa";
import Link from "next/link";
import styles from "./sidebar.module.css";

const options = [
	{ name: "Gestión de usuarios", icon: <FaUsers />, href: "/users" },
	{ name: "Catálogo de acciones", icon: <FaChartLine />, href: "/stocks" },
	{ name: "Transacciones", icon: <FaExchangeAlt />, href: "/transactions" },
	{ name: "Dashboard", icon: <FaTachometerAlt />, href: "/dashboard" },
];

export default function SidebarOptions() {
	return (
		<div className={styles.sidebar}>
			{options.map(option => (
				<Link href={option.href} key={option.name} className={styles.iconLink}>
					<div className={styles.iconWrapper}>
						{option.icon}
						<span className={styles.tooltip}>{option.name}</span>
					</div>
				</Link>
			))}
		</div>
	);
}
