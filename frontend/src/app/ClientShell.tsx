'use client';

import { useState, useEffect } from 'react';
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
  const [role, setRole] = useState<'admin' | 'user' | null>(user?.role || null);

  useEffect(() => {
    setRole(user?.role || null);
  }, [user]);

  return (
    <>
      <SearchResults
        headerProps={{ marketOpen: true, totalAmount: 100 }}
        title="Resultados de la búsqueda"
        onOpenLogin={() => setLoginOpen(true)} 
      />

      {role === 'user' && (
        <OptionsUser onOpenWallet={() => setWalletOpen(true)} />
      )}

      {role === 'admin' && <SidebarOptions />}

      <Login 
        open={loginOpen} 
        onClose={() => setLoginOpen(false)} 
        onSuccess={(role) => setRole(role)} 
      />

      <Wallet open={walletOpen} onClose={() => setWalletOpen(false)} />

      {children}
    </>
  );
}
