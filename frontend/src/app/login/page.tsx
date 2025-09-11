"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Dashboard from "../dashboard/page";
import styles from "./login.module.css";




export default function Login() {
  const [showModal, setShowModal] = useState(true);
  const [showLogin, setShowLogin] = useState(true);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get("email"),
      password: formData.get("password"),
    };


    try {
      const res = await fetch("http://localhost:3000/api/users/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (res.ok) {
        alert("Login exitoso");
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
      const res = await fetch("http://localhost:3000/api/users/register/", {
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
    <div className={styles.page}>
      <div className={showModal ? styles.blurred : ""}>
        <Dashboard />
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            {showLogin ? (
              <>
                <h2 className={styles.modalTitle}>Login</h2>
                <form className={styles.form} onSubmit={handleLogin}>
                  <input type="email" name="email" placeholder="Email" className={styles.input} required />
                  <input type="password" name="password" placeholder="Contraseña" className={styles.input} required />
                  <button type="submit" className={styles.submitButton}>Entrar</button>
                </form>
                <p className={styles.switchText}>
                  ¿No tienes cuenta?{" "}
                  <span className={styles.switchLink} onClick={() => setShowLogin(false)}>Regístrate</span>
                </p>
              </>
            ) : (
              <>
                <h2 className={styles.modalTitle}>Registro</h2>
                <form className={styles.form} onSubmit={handleRegister}>
                  <input type="text" name="name" placeholder="Nombre" className={styles.input} required />         
                  <input type="email" name="email" placeholder="Email" className={styles.input} required />           
                  <input type="password" name="password" placeholder="Contraseña" className={styles.input} required />  
                  <input type="tel" name="phone" placeholder="Teléfono" className={styles.input} />         
                  <input type="text" name="referred_code" placeholder="Código de referido" className={styles.input} /> 
                  <button type="submit" className={styles.submitButton}>Crear cuenta</button>
                </form>
                <p className={styles.switchText}>
                  ¿Ya tienes cuenta?{" "}
                  <span className={styles.switchLink} onClick={() => setShowLogin(true)}>Login</span>
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
