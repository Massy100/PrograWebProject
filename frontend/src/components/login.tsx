"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import "../styles/login.css";

type LoginProps = {
  open: boolean;
  onClose?: () => void;
};

export default function Login({ open, onClose }: LoginProps) {
  const [showLogin, setShowLogin] = useState(true);
  const router = useRouter();

  if (!open) return null; // <-- si no está abierto, no renderiza nada

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    try {
      const res = await fetch("http://localhost:8000/api/users/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (res.ok) {
        alert("Login exitoso");
        onClose?.();           // cierra modal si hay handler
        router.push("/dashboard");
      } else {
        alert("Error: " + result.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error al conectar con el backend");
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      username: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      phone: formData.get("phone"),
      referred_code: formData.get("referred_code"),
    };

    try {
      const res = await fetch("http://localhost:8000/api/users/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (res.ok) {
        alert("Registro exitoso");
        setShowLogin(true);
      } else {
        alert("Error: " + result.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error al conectar con el backend");
    }
  };

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="closeButton" aria-label="Cerrar" onClick={onClose}><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><g><path fill="none" d="M0 0h24v24H0z"></path><path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z"></path></g></svg></button>

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