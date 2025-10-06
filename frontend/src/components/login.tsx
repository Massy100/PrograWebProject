"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import "../styles/login.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { PhoneNumberUtil } from "google-libphonenumber";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

type LoginProps = {
  open: boolean;
  onClose?: () => void;
};

export default function Login({ open, onClose }: LoginProps) {
  const router = useRouter();
  const phoneUtil = PhoneNumberUtil.getInstance();

  const [showLogin, setShowLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);           
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); 
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState(""); 
  const [hasReferral, setHasReferral] = useState(false);
  const [referralError, setReferralError] = useState("");
  const [phoneFull, setPhoneFull] = useState("");

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
        router.push("/dashboard-user");
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
    const password = String(formData.get("password"));
    const confirmPassword = String(formData.get("confirmPassword"));

    if (password !== confirmPassword) {
      setPasswordError("Passwords must match");
      return;
    } else {
      setPasswordError("");
    }

    if (!phoneFull) {
      setPhoneError("Phone number is required");
      return;
    } else {
      setPhoneError("")
    }

    const referralCode = String(formData.get("referred_code")).trim();
    if (hasReferral && !referralCode) {
      setReferralError("Referral code is required");
      return;
    } else {
      setReferralError("");
    }


    try {
      const data = {
      username: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      phone: formData.get("phone"),
      referred_code: formData.get("referred_code"),
      };
    
      const res = await fetch("http://localhost:8000/api/users/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (res.ok) {
        alert("Registro exitoso");
        setShowLogin(true);

        setPhoneFull("");
        setPhoneError("");
        setPasswordError("");
        setReferralError("");
        setHasReferral(false);
        e.currentTarget.reset();

      } else {
        alert("Error: " + result.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error al conectar con el backend");
    }
  };

  return (
    <div className="modalOverlay"  onClick={() => { setPhoneFull("");  setPhoneError(""); setHasReferral(false); onClose?.(); }}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="closeButton" aria-label="Cerrar" onClick={() => { setPhoneFull("");  setPhoneError("");  setHasReferral(false);  onClose?.(); }}><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><g><path fill="none" d="M0 0h24v24H0z"></path><path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z"></path></g></svg></button>

        {showLogin ? (
          <>
            <h2 className="modalTitle">Login</h2>
            <form className="form" onSubmit={handleLogin}>
              <input type="email" name="email" placeholder="Email" className="input" required />
              <input type="password" name="password" placeholder="Password" className="input" required />
              <button type="submit" className="submitButton">Login</button>
            </form>
            <p className="switchText">
                Don't have an account?{" "}
              <span className="switchLink" onClick={() => setShowLogin(false)}>Regístrate</span>
            </p>
          </>
        ) : (
          <>
            <h2 className="modalTitle">Register</h2>
            <form className="form" onSubmit={handleRegister}>
              <input type="text" name="name" placeholder="User" className="input" required />
              <input type="email" name="email" placeholder="Email" className="input" required />
               <div className="passwordContainer">
                <input type={showPassword ? "text" : "password"} name="password" placeholder="Password" className="input" required />
                <button type="button" className="eyeButton" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <div className="passwordContainer">
                <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="Confirm Password" className="input" required />
                <button type="button" className="eyeButton" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {passwordError && <p className="errorText">{passwordError}</p>}
              <div className="phoneContainer">
                <PhoneInput value={phoneFull} onChange={(value) => setPhoneFull(value)} inputClass="input" enableSearch placeholder="Phone" />
              </div>
              {phoneError && <p className="errorText2">{phoneError}</p>}
              <div className="referralRow">
              <input type="checkbox" checked={hasReferral} onChange={() => setHasReferral(!hasReferral)} /> I have a referral code
              </div>
              {hasReferral &&  <div className="referralInputContainer"> <input type="text" name="referred_code" placeholder="Referral Code" className="input referralInput" /> </div>}
              {referralError && <p className="errorText">{referralError}</p>}
              <button type="submit" className="submitButton">Create Account</button>
            </form>
            <p className="switchText">
               Already have an account?{" "}
              <span className="switchLink" onClick={() => setShowLogin(true)}>Login</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}