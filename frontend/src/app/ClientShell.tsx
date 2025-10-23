'use client';

import { useState, useEffect } from 'react';
import SearchResults from '@/components/searchResults';
import OptionsUser from '@/components/navUsers';    
import SidebarOptions from '@/components/navAdmin';   
import CompleteUserRegister from '@/components/CompleteUserRegister';
import Wallet from '@/components/wallet';

import { useAuth0 } from '@auth0/auth0-react';

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const [walletOpen, setWalletOpen] = useState(false);
  const { user, getAccessTokenSilently,  } = useAuth0();
  const [role, setRole] = useState<'admin' | 'client' | null>(null);
  const [verifiedUser, setVerifiedUser] = useState(false);

  const callApi = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch("http://localhost:8000/api/users/sync/", {
        method: "POST",
        body: JSON.stringify(user),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const data = await response.json();
      if (!data) {
        throw new Error("No se obtuvo respuesta del backend.");
      }
      
      const dbUser = data.user;
      setVerifiedUser(dbUser.verified);
      localStorage.setItem("auth", JSON.stringify({id: dbUser.id, verified: verifiedUser, role: dbUser.user_type}));
      
      setRole(data.user.user_type);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (user) {
        callApi();
    }
  }, [user]);

  return (
    <>
      <SearchResults
        headerProps={{ marketOpen: true, totalAmount: 100 }}
        title="Resultados de la búsqueda"
      />

      {role === 'client' && verifiedUser && (
        <OptionsUser onOpenWallet={() => setWalletOpen(true)} />
      )}

      {role === 'admin' && <SidebarOptions />}

      <Wallet open={walletOpen} onClose={() => setWalletOpen(false)} />

      {children}
    </>
  );
}
