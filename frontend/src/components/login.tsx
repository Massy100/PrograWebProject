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
  
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    referred_code: ""
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
        alert("Login exitoso");
        onClose?.();
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
    const password = registerData.password;
    const confirmPassword = registerData.confirmPassword;

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

    const referralCode = registerData.referred_code.trim();
    if (hasReferral && !referralCode) {
      setReferralError("Referral code is required");
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
        alert("Registro exitoso");
        
        setLoginEmail("");
        setLoginPassword("");
        setRegisterData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          referred_code: ""
        });
        setPhoneFull("");
        setPhoneError("");
        setPasswordError("");
        setReferralError("");
        setHasReferral(false);
        setShowPassword(false);
        setShowConfirmPassword(false);
        
        setShowLogin(true);
      } else {
        alert("Error: " + result.message);
      }
    } catch (err) {
      //console.error(err);
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
      referred_code: ""
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
          <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
            <g>
              <path fill="none" d="M0 0h24v24H0z"></path>
              <path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z"></path>
            </g>
          </svg>
        </button>

        {showLogin ? (
          <>
            <h2 className="modalTitle">Login</h2>
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
                placeholder="Password" 
                className="input" 
                required 
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
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
              <input 
                type="text" 
                name="name" 
                placeholder="User" 
                className="input" 
                required 
                value={registerData.name}
                onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
              />
              <input 
                type="email" 
                name="email" 
                placeholder="Email" 
                className="input" 
                required 
                value={registerData.email}
                onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
              />
              <div className="passwordContainer">
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  placeholder="Password" 
                  className="input" 
                  required 
                  value={registerData.password}
                  onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                />
                <button type="button" className="eyeButton" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <div className="passwordContainer">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  name="confirmPassword" 
                  placeholder="Confirm Password" 
                  className="input" 
                  required 
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                />
                <button type="button" className="eyeButton" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
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
                  placeholder="Phone" 
                />
              </div>
              {phoneError && <p className="errorText2">{phoneError}</p>}
              <div className="referralRow">
                <input 
                  type="checkbox" 
                  checked={hasReferral} 
                  onChange={() => setHasReferral(!hasReferral)} 
                /> I have a referral code
              </div>
              {hasReferral && (
                <div className="referralInputContainer">
                  <input 
                    type="text" 
                    name="referred_code" 
                    placeholder="Referral Code" 
                    className="input referralInput" 
                    value={registerData.referred_code}
                    onChange={(e) => setRegisterData({...registerData, referred_code: e.target.value})}
                  />
                </div>
              )}
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