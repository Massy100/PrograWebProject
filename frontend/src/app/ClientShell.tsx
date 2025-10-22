'use client';

import { useState, useEffect } from 'react';
import SearchResults from '@/components/searchResults';
// import Login from '@/components/login';
import OptionsUser from '@/components/navUsers';    
import SidebarOptions from '@/components/navAdmin';   
import Wallet from '@/components/wallet';

import { useAuth0 } from '@auth0/auth0-react';
import { json } from 'stream/consumers';

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const [loginOpen, setLoginOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const { user, getAccessTokenSilently,  } = useAuth0();
  const [role, setRole] = useState<'admin' | 'client' | null>(null);
  const [dbUser, setDbUser] = useState(null);

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
      setDbUser(data.user);
      setRole(data.user.user_type);
      console.log(dbUser);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (user) {
        console.log(user);
        callApi();
    }
  }, [user]);

  return (
    <>
      <SearchResults
        headerProps={{ marketOpen: true, totalAmount: 100 }}
        title="Resultados de la búsqueda"
        onOpenLogin={() => setLoginOpen(true)} 
      />

      {role === 'client' && (
        <OptionsUser onOpenWallet={() => setWalletOpen(true)} />
      )}

      {role === 'admin' && <SidebarOptions />}

      {/*
      <Login 
        open={loginOpen} 
        onClose={() => setLoginOpen(false)} 
        onSuccess={(role) => setRole(role)} 
      />
      */}

      <Wallet open={walletOpen} onClose={() => setWalletOpen(false)} />

      {children}
    </>
  );
}
