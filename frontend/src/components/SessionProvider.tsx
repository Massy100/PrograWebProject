'use client';

import { createContext, useContext, useState, useEffect } from 'react';

// Tipo de usuario
export type SessionUser = {
  id: number;
  email: string;
  role: 'admin' | 'user';
} | null;

type SessionContextType = {
  user: SessionUser;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
};

// Creamos el contexto
const SessionContext = createContext<SessionContextType | null>(null);

// =========================================================
// Eliminar la simulación para conectar con el back
type MockUser = {
  id: number;
  email: string;
  password: string;
  role: 'admin' | 'user';
};

const mockUsers: MockUser[] = [
  { id: 1, email: 'admin@example.com', password: 'admin123', role: 'admin' },
  { id: 2, email: 'user@example.com', password: 'user123', role: 'user' },
];
// =========================================================

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser>(null);

  useEffect(() => {
    // En simulación: leer localStorage al inicio
    const raw = localStorage.getItem('auth');
    if (raw) setUser(JSON.parse(raw));

    // =========================================================
    // Descomentar cuando el back quiera ser implementado
    /*
    async function fetchUser() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/me/`, {
          credentials: 'include',
          cache: 'no-store',
        });
        if (res.ok) {
          const data = await res.json();
          setUser({ id: data.id, email: data.email, role: data.role });
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Error cargando sesión:', err);
        setUser(null);
      }
    }
    fetchUser();
    */
    // =========================================================
  }, []);

  // =========================================================
  // Eliminar la simulación para conectar con el back
  const login = async (email: string, password: string) => {
    const found = mockUsers.find(u => u.email === email && u.password === password);
    if (found) {
      localStorage.setItem('auth', JSON.stringify(found));
      setUser(found);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('auth');
    setUser(null);
  };
  // =========================================================

  // =========================================================
  // Descomentar cuando el back quiera ser implementado
  /*
  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      if (res.ok) {
        await fetchUser();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/logout/`, {
      method: 'POST',
      credentials: 'include',
    });
    setUser(null);
  };
  */
  // =========================================================

  return (
    <SessionContext.Provider value={{ user, login, logout }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession debe usarse dentro de SessionProvider');
  return ctx;
}
