"use client";

import { createContext, useContext, useState, useEffect } from "react";

export type SessionUser = {
  id: number;
  email: string;
  username: string;
  role: "admin" | "user";
} | null;

type SessionContextType = {
  user: SessionUser;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

const SessionContext = createContext<SessionContextType | null>(null);

const API_URL = "http://localhost:8000";

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser>(null);

  // Al montar, verificar si hay sesión activa
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch(`${API_URL}/api/users/check_auth/`, {
          method: "GET",
          credentials: "include", 
        });

        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setUser({
              id: data.user.id,
              email: data.user.email,
              username: data.user.username,
              role: data.user.user_type === "ADMIN" ? "admin" : "user",
            });
          } else {
            setUser(null);
          }
        }
      } catch (err) {
        console.error("Error verificando sesión:", err);
      }
    }

    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/api/users/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok && data.user) {
        const role = data.user.user_type === "ADMIN" ? "admin" : "user";
        setUser({
          id: data.user.id,
          email: data.user.email,
          username: data.user.username,
          role,
        });
        return true;
      }

      console.warn("Login fallido:", data.message);
      return false;
    } catch (error) {
      console.error("Error en login:", error);
      return false;
    }
  };


  const logout = async () => {
    try {
      await fetch(`${API_URL}/api/users/logout/`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Error cerrando sesión:", err);
    } finally {
      setUser(null);
    }
  };

  return (
    <SessionContext.Provider value={{ user, login, logout }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession debe usarse dentro de <SessionProvider>");
  return ctx;
}
