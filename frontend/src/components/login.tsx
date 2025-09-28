"use client";

import { useState } from "react";
import { useSession } from "@/components/SessionProvider";
import "../styles/login.css";

type LoginProps = {
  open: boolean;
  onClose?: () => void;
  onSuccess?: (role: 'admin' | 'user') => void; // 👈 nuevo
};

export default function Login({ open, onClose, onSuccess }: LoginProps) {
  const [showLogin, setShowLogin] = useState(true);
  const { login } = useSession();

  if (!open) return null;

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));

    const success = await login(email, password);
    if (success) {
      // ------- Simulación (mock) -------
      // lee el rol desde localStorage (mockUsers). 
      // Eliminar cuando conectes con el back.
      const auth = localStorage.getItem('auth');
      const role = (auth ? JSON.parse(auth).role : 'user') as 'admin' | 'user';
      // ---------------------------------

      // ------- Descomentar con backend -------
      // const me = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/me/`, {
      //   credentials: 'include',
      //   cache: 'no-store',
      // });
      // const data = await me.json();
      // const role = data.role as 'admin' | 'user';
      // ---------------------------------------

      onClose?.();
      onSuccess?.(role); // notifica a Home para que redirija por rol
    } else {
      alert("Credenciales incorrectas ❌");
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert("Registro simulado (pendiente backend)");
    setShowLogin(true);
  };

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="closeButton" aria-label="Cerrar" onClick={onClose}>
          <svg stroke="currentColor" fill="currentColor" viewBox="0 0 24 24" height="1em" width="1em"><path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z"></path></svg>
        </button>

        {showLogin ? (
          <>
            <h2 className="modalTitle">Login</h2>
            <form className="form" onSubmit={handleLogin}>
              <input type="email" name="email" placeholder="Email" className="input" required />
              <input type="password" name="password" placeholder="Contraseña" className="input" required />
              <button type="submit" className="submitButton">Entrar</button>
            </form>
            <p className="switchText">
              ¿No tienes cuenta?{" "}
              <span className="switchLink" onClick={() => setShowLogin(false)}>Regístrate</span>
            </p>
          </>
        ) : (
          <>
            <h2 className="modalTitle">Registro</h2>
            <form className="form" onSubmit={handleRegister}>
              <input type="text" name="name" placeholder="Nombre" className="input" required />
              <input type="email" name="email" placeholder="Email" className="input" required />
              <input type="password" name="password" placeholder="Contraseña" className="input" required />
              <input type="tel" name="phone" placeholder="Teléfono" className="input" />
              <input type="text" name="referred_code" placeholder="Código de referido" className="input" />
              <button type="submit" className="submitButton">Crear cuenta</button>
            </form>
            <p className="switchText">
              ¿Ya tienes cuenta?{" "}
              <span className="switchLink" onClick={() => setShowLogin(true)}>Login</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
