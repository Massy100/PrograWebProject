'use client';

import { useState } from 'react';
import { useSession } from '@/components/SessionProvider';
import SearchResults from '@/components/searchResults';
import Login from '@/components/login';
import OptionsUser from '@/components/navUsers';    
import SidebarOptions from '@/components/navAdmin';   

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const [loginOpen, setLoginOpen] = useState(false);
  const { user } = useSession();
  const role = user?.role; // 'admin' | 'user' | undefined

  return (
    <>
      <SearchResults
        headerProps={{ marketOpen: true, totalAmount: 100 }}
        title="Resultados de la búsqueda"
        onOpenLogin={() => setLoginOpen(true)} // Header abre login si no hay sesión
      />

      {/* Nav por rol */}
      {role === 'user' && <OptionsUser />}
      {role === 'admin' && <SidebarOptions />}

      <Login open={loginOpen} onClose={() => setLoginOpen(false)} />
      {children}
    </>
  );
}
