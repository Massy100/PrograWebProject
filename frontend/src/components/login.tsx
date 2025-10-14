"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import "../styles/login.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { PhoneNumberUtil } from "google-libphonenumber";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useSession } from "@/components/SessionProvider"; 

type LoginProps = {
  open: boolean;
  onClose?: () => void;
  onSuccess?: (role: "admin" | "user") => void;
};

export default function Login({ open, onClose, onSuccess }: LoginProps) {
  const router = useRouter();
  const { login: setSessionUser } = useSession(); 
  const phoneUtil = PhoneNumberUtil.getInstance();

  const [showLogin, setShowLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState("");
  const [hasReferral, setHasReferral] = useState(false);
  const [referralError, setReferralError] = useState("");
  const [phoneFull, setPhoneFull] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    referred_code: "",
  });

  if (!open) return null;


  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = {
      email: loginEmail,
      password: loginPassword,
    };

    try {
      const res = await fetch("http://localhost:8000/api/users/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        alert("Login exitoso ");


        await setSessionUser(loginEmail, loginPassword);

        const role = result.role || "user";

        onSuccess?.(role);


        onClose?.();

        if (role === "admin") {
          router.push("/dashboard-admin");
        } else {
          router.push("/dashboard-user");
        }
      } else {
        alert("Error: " + (result.message || "Credenciales incorrectas"));
      }
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      alert("Error al conectar con el servidor");
    }
  };


  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const password = registerData.password;
    const confirmPassword = registerData.confirmPassword;

    if (password !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden");
      return;
    } else {
      setPasswordError("");
    }

    if (!phoneFull) {
      setPhoneError("El teléfono es obligatorio");
      return;
    } else {
      setPhoneError("");
    }

    const referralCode = registerData.referred_code.trim();
    if (hasReferral && !referralCode) {
      setReferralError("El código de referido es obligatorio");
      return;
    } else {
      setReferralError("");
    }

    try {
      const data = {
        username: registerData.name,
        email: registerData.email,
        password: registerData.password,
        phone: phoneFull,
        referred_code: registerData.referred_code,
      };

      const res = await fetch("http://localhost:8000/api/users/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (res.ok) {
        alert("Registro exitoso 🎉");
        setShowLogin(true);
        // Limpieza
        setRegisterData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          referred_code: "",
        });
        setPhoneFull("");
        setHasReferral(false);
        setShowPassword(false);
        setShowConfirmPassword(false);
      } else {
        alert("Error: " + (result.message || "No se pudo registrar"));
      }
    } catch (err) {
      console.error("Error en el registro:", err);
      alert("Error al conectar con el servidor");
    }
  };


  const handleClose = () => {
    setLoginEmail("");
    setLoginPassword("");
    setRegisterData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      referred_code: "",
    });
    setPhoneFull("");
    setPhoneError("");
    setPasswordError("");
    setReferralError("");
    setHasReferral(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
    onClose?.();
  };


  return (
    <div className="modalOverlay" onClick={handleClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="closeButton" aria-label="Cerrar" onClick={handleClose}>
          ✕
        </button>

        {showLogin ? (
          <>
            <h2 className="modalTitle">Iniciar sesión</h2>
            <form className="form" onSubmit={handleLogin}>
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="input"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
              <input
                type="password"
                name="password"
                placeholder="Contraseña"
                className="input"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
              <button type="submit" className="submitButton">
                Entrar
              </button>
            </form>
            <p className="switchText">
              ¿No tienes cuenta?{" "}
              <span className="switchLink" onClick={() => setShowLogin(false)}>
                Regístrate
              </span>
            </p>
          </>
        ) : (
          <>
            <h2 className="modalTitle">Registro</h2>
            <form className="form" onSubmit={handleRegister}>
              <input
                type="text"
                name="name"
                placeholder="Usuario"
                className="input"
                required
                value={registerData.name}
                onChange={(e) =>
                  setRegisterData({ ...registerData, name: e.target.value })
                }
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="input"
                required
                value={registerData.email}
                onChange={(e) =>
                  setRegisterData({ ...registerData, email: e.target.value })
                }
              />

              <div className="passwordContainer">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Contraseña"
                  className="input"
                  required
                  value={registerData.password}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="eyeButton"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <div className="passwordContainer">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirmar contraseña"
                  className="input"
                  required
                  value={registerData.confirmPassword}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      confirmPassword: e.target.value,
                    })
                  }
                />
                <button
                  type="button"
                  className="eyeButton"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {passwordError && <p className="errorText">{passwordError}</p>}

              <div className="phoneContainer">
                <PhoneInput
                  value={phoneFull}
                  onChange={(value) => setPhoneFull(value)}
                  inputClass="input"
                  enableSearch
                  placeholder="Teléfono"
                />
              </div>

              {phoneError && <p className="errorText2">{phoneError}</p>}

              <div className="referralRow">
                <input
                  type="checkbox"
                  checked={hasReferral}
                  onChange={() => setHasReferral(!hasReferral)}
                />{" "}
                Tengo un código de referido
              </div>

              {hasReferral && (
                <div className="referralInputContainer">
                  <input
                    type="text"
                    name="referred_code"
                    placeholder="Código de referido"
                    className="input referralInput"
                    value={registerData.referred_code}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        referred_code: e.target.value,
                      })
                    }
                  />
                </div>
              )}

              {referralError && <p className="errorText">{referralError}</p>}

              <button type="submit" className="submitButton">
                Crear cuenta
              </button>
            </form>

            <p className="switchText">
              ¿Ya tienes una cuenta?{" "}
              <span className="switchLink" onClick={() => setShowLogin(true)}>
                Inicia sesión
              </span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}