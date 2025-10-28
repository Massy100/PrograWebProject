"use client";
import Header from "@/components/Header";
import SidebarOptions from "@/components/navAdmin";
import OptionsUser from "@/components/navUsers";
import Wallet from "@/components/wallet";
import { useEffect, useState } from "react";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<string | null>(null);
  const [verified, setVerified] = useState<boolean>(false);
  const [completed, setCompleted] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [walletOpen, setWalletOpen] = useState(false); // 👈 estado para abrir/cerrar wallet

  useEffect(() => {
    const raw = document.cookie.split("; ").find((c) => c.startsWith("auth="));
    if (raw) {
      try {
        const parsed = JSON.parse(decodeURIComponent(raw.split("=")[1]));
        setRole(parsed.role || null);
        setVerified(parsed.verified || false);
        setCompleted(parsed.completed || false);
      } catch (err) {
        console.error("Error parsing auth cookie:", err);
      }
    }
    setLoading(false);
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  const isAdmin = role === "admin";
  const isClientVerified = role === "client" && verified && completed;

  return (
    <div className="appLayout">
      {(isAdmin || isClientVerified) && <Header marketOpen={false} />}

      <div className="appBody">
        {isAdmin && <SidebarOptions />}
        {isClientVerified && (
          <OptionsUser onOpenWallet={() => setWalletOpen(true)} /> // ✅ pasa la función
        )}

        <main className="appMain">{children}</main>
      </div>

      <Wallet open={walletOpen} onClose={() => setWalletOpen(false)} /> {/* ✅ usa open y onClose */}
    </div>
  );
}
