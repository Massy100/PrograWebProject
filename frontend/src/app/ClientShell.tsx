"use client";

import Footer from "@/components/Footer";
import SidebarOptions from "@/components/navAdmin";
import OptionsUser from "@/components/navUsers";
import SearchResults from "@/components/searchResults";
import Wallet from "@/components/wallet";
import { useMarketStatus } from "@/hook/useMarketStatus";
import { useEffect, useState } from "react";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<string | null>(null);
  const [verified, setVerified] = useState<boolean>(false);
  const [completed, setCompleted] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [walletOpen, setWalletOpen] = useState(false);
  const marketOpen = useMarketStatus();

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
      {(isAdmin || isClientVerified) && (
        <SearchResults
          headerProps={{
            isLoggedIn: Boolean(role),
            marketOpen,
            totalAmount: 0, 
          }}
          title="Search Results"
        />
      )}

      <div className="appBody">
        {isAdmin && <SidebarOptions />}
        {isClientVerified && (
          <OptionsUser onOpenWallet={() => setWalletOpen(true)} />
        )}

        <main className="appMain">{children}</main>
      </div>

      <Wallet open={walletOpen} onClose={() => setWalletOpen(false)} />

      <Footer/>
    </div>
  );
}
