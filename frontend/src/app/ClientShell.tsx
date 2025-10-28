"use client";
import Header from "@/components/Header";
import SidebarOptions from "@/components/navAdmin";
import OptionsUser from "@/components/navUsers";
import { useEffect, useState } from "react";


export default function ClientShell({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const raw = document.cookie.split("; ").find(c => c.startsWith("auth="));
    if (raw) {
      try {
        const { role } = JSON.parse(decodeURIComponent(raw.split("=")[1]));
        setRole(role);
      } catch (err) {
        console.error("Error parsing auth cookie:", err);
      }
    }
  }, []);

  return (
    <div className="appLayout">
      {role === "admin" && <Header marketOpen={false} />}
      {role === "client" && <Header marketOpen={false}/>}

      <div className="appBody">
        {role === "admin" && <SidebarOptions />}
        {role === "client" && <OptionsUser />}

        {/* CONTENIDO PRINCIPAL */}
        <main className="appMain">{children}</main>
      </div>
    </div>
  );
}
