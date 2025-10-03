"use client";

import { useState } from "react";
import { useSession } from "@/components/SessionProvider";
import "../styles/login.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { PhoneNumberUtil } from "google-libphonenumber";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';




type LoginProps = {
  open: boolean;
  onClose?: () => void;
  onSuccess?: (role: 'admin' | 'user') => void; // 👈 nuevo
};

export default function Login({ open, onClose, onSuccess }: LoginProps) {
  const phoneUtil = PhoneNumberUtil.getInstance();
  const [showLogin, setShowLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);           
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); 
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState(""); 
  const [hasReferral, setHasReferral] = useState(false);
  const [referralError, setReferralError] = useState("");
  const [phoneFull, setPhoneFull] = useState("");


  const { login } = useSession();

  if (!open) return null;

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const emailoruser = String(formData.get("emailoruser"));
    const password = String(formData.get("password"));

    const success = await login(emailoruser, password);
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

    const formData = new FormData(e.currentTarget);
    const password = String(formData.get("password"));
    const confirmPassword = String(formData.get("confirmPassword"));
    

  
    
    if (password !== confirmPassword) {
      setPasswordError("Passwords must match");
      return;
    } else {
      setPasswordError("");
    }

    if (phoneFull) {
      try {
        const number = phoneUtil.parse(phoneFull); 
        if (!phoneUtil.isValidNumber(number)) {
          setPhoneError("Invalid phone number");
          return;
        } else {
          setPhoneError("");
        }
      } catch (err) {
        setPhoneError("Invalid phone number format");
        return;
      }
    } else {
      setPhoneError(""); 
    }


      const referralCode = String(formData.get("referred_code")).trim();
      if (hasReferral && !referralCode) {
        setReferralError("Referral code is required");
        return;
      } else {
        setReferralError("");
      }


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
              <input type="text" name="emailoruser" placeholder="Email or User" className="input" required />
              <input type="password" name="password" placeholder="Password" className="input" required />
              <button type="submit" className="submitButton">Login</button>
            </form>
            <p className="switchText">
              Don't have an account?{" "}
              <span className="switchLink" onClick={() => setShowLogin(false)}>Register</span>
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
                <button type="button" className="eyeButton" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <FaEyeSlash /> : <FaEye />}</button>
              </div>
              <div className="passwordContainer">
                <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="Confirm Password" className="input" required />
                <button type="button" className="eyeButton" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? <FaEyeSlash /> : <FaEye />}</button>
              </div>
              {passwordError && <p className="errorText">{passwordError}</p>}
              <div className="phoneContainer">
                <PhoneInput value={phoneFull} onChange={(value) => setPhoneFull(value)} inputClass="input" enableSearch placeholder="Phone" />
                {phoneError && <p className="errorText">{phoneError}</p>}
              </div>

              <input type="checkbox" checked={hasReferral} onChange={() => setHasReferral(!hasReferral)} /> I have a referral code
              {hasReferral && <input type="text" name="referred_code" placeholder="Referral Code" className="input" />}
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
