'use client';
import { useState } from 'react';
import { useSession } from '@/components/SessionProvider';
import SearchResults from '@/components/searchResults';
import Login from '@/components/login';
import OptionsUser from '@/components/navUsers';
import SidebarOptions from '@/components/navAdmin';
import Wallet from '@/components/wallet';

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const [loginOpen, setLoginOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const { user } = useSession();
  const role = user?.role;

  return (
    <>
      <SearchResults
        headerProps={{ marketOpen: true, totalAmount: 100 }}
        title="Search results"
        onOpenLogin={() => setLoginOpen(true)}
      />

      {role === 'user' && <OptionsUser onOpenWallet={() => setWalletOpen(true)} />}
      {role === 'admin' && <SidebarOptions />}

      {/* Wallet panel lives at the shell level */}
      <Wallet open={walletOpen} onClose={() => setWalletOpen(false)} />

      <Login open={loginOpen} onClose={() => setLoginOpen(false)} />
      {children}
    </>
  );
}
