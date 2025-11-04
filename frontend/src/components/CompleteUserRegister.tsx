"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";
import "../styles/CompleteUserRegister.css";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

interface CompleteUserRegisterProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface ReferralValidationResponse {
  valid: boolean;
  message: string;
  referrer_name?: string;
}

export default function CompleteUserRegister({ onClose, onSuccess }: CompleteUserRegisterProps) {
  const { getAccessTokenSilently } = useAuth0();
  const [isOpen, setIsOpen] = useState(true);
  const [hasReferral, setHasReferral] = useState(false);
  const [referralError, setReferralError] = useState("");
  const [referralSuccess, setReferralSuccess] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [phoneFull, setPhoneFull] = useState("");
  const [validatingReferral, setValidatingReferral] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    used_referred_code: "",
    is_completed: true,
    phone: ""
  });

  // Función para validar el código de referido
  const validateReferralCode = async (code: string): Promise<ReferralValidationResponse> => {
    try {
      const token = await getAccessTokenSilently();
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/referrals/validate-referral/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ referral_code: code }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error validating referral code");
      }

      return await response.json();
    } catch (error: any) {
      console.error("Error validating referral code:", error);
      throw error;
    }
  };

  // Función para procesar el referral después del registro exitoso
  const processReferral = async (code: string) => {
    try {
      const token = await getAccessTokenSilently();
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/referrals/process-referral/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ referral_code: code }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error processing referral");
      }

      return await response.json();
    } catch (error: any) {
      console.error("Error processing referral:", error);
      throw error;
    }
  };

  // Validar código cuando el usuario termine de escribir
  const handleReferralCodeChange = async (code: string) => {
    setFormData({ ...formData, used_referred_code: code });
    setReferralError("");
    setReferralSuccess("");

    // Si el campo está vacío, no validar
    if (!code.trim()) {
      return;
    }

    // Validar formato básico primero
    if (!code.match(/^\d+$/)) {
      setReferralError("Referral code must contain only numbers");
      return;
    }

    if (code.length !== 5) {
      setReferralError("Referral code must be exactly 5 digits");
      return;
    }

    // Validar con el backend
    setValidatingReferral(true);
    try {
      const validation = await validateReferralCode(code);
      
      if (validation.valid) {
        setReferralSuccess(`Valid code! Referred by: ${validation.referrer_name}`);
        setReferralError("");
      } else {
        setReferralError(validation.message);
        setReferralSuccess("");
      }
    } catch (error: any) {
      setReferralError(error.message || "Error validating referral code");
      setReferralSuccess("");
    } finally {
      setValidatingReferral(false);
    }
  };

  const callApiWithData = async (strAuth: string, dataToSend: typeof formData) => {
    try {
      const auth = JSON.parse(strAuth);
      const token = await getAccessTokenSilently();

      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + `/users/${auth.id}/`, {
        method: "PATCH",
        body: JSON.stringify(dataToSend),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      const data = await response.json();
      if (!data) {
        throw new Error("No se obtuvo respuesta del backend.");
      }
      console.log("User updated:", data);
      
      // Procesar el referral después de actualizar el usuario exitosamente
      if (dataToSend.used_referred_code && dataToSend.used_referred_code.trim()) {
        try {
          await processReferral(dataToSend.used_referred_code);
          console.log("Referral processed successfully");
        } catch (referralError) {
          console.error("Referral processing failed, but user was updated:", referralError);
          // No bloqueamos el registro si falla el procesamiento del referral
        }
      }
      
      return data;
    } catch (e) {
      console.error("Error updating user:", e);
      throw e;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validaciones básicas
    if (!formData.full_name.trim()) {
      setReferralError("Please enter your first and last name");
      return;
    }

    if (!formData.username.trim()) {
      setReferralError("Username is required");
      return;
    }

    if (!phoneFull) {
      setPhoneError("Phone number is required");
      return;
    }

    // Validar código de referido si se proporcionó
    if (hasReferral && formData.used_referred_code.trim()) {
      const code = formData.used_referred_code;
      
      // Validación de formato en frontend
      if (!code.match(/^\d+$/)) {
        setReferralError("Referral code must contain only numbers");
        return;
      }

      if (code.length !== 5) {
        setReferralError("Referral code must be exactly 5 digits");
        return;
      }

      // Validar con backend antes de enviar
      try {
        setValidatingReferral(true);
        const validation = await validateReferralCode(code);
        
        if (!validation.valid) {
          setReferralError(validation.message);
          setValidatingReferral(false);
          return;
        }
      } catch (error: any) {
        setReferralError(error.message || "Error validating referral code");
        setValidatingReferral(false);
        return;
      } finally {
        setValidatingReferral(false);
      }
    }

    const updatedFormData = { ...formData, phone: phoneFull };

    const strAuth = localStorage.getItem("auth");
    if (strAuth) {
      try {
        await callApiWithData(strAuth, updatedFormData);
        onSuccess();
      } catch (error) {
        console.error("Registration failed:", error);
        setReferralError("Registration failed. Please try again.");
        return;
      }
    } else {
      setReferralError("User data was not found. Please refresh the page.");
      return;
    }

    setPhoneError("");
    setReferralError("");
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modalOverlay" onClick={handleClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="closeButton" aria-label="Close" onClick={handleClose}>
          ✕
        </button>

        <h2 className="modalTitle">Complete Your Registration</h2>
        <p>
          Completing your registration automatically sends an access request to our administration
          team. Once it gets accepted you can start managing your stocks.
        </p>

        <form className="form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full Name"
            className="input"
            value={formData.full_name}
            onChange={(e) =>
              setFormData({ ...formData, full_name: e.target.value })
            }
            required
          />

          <input
            type="text"
            placeholder="Username"
            className="input"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            required
          />

          <div className="phoneContainer">
            <PhoneInput
              country={"gt"}
              value={phoneFull}
              onChange={(value, data, event, formattedValue) => {
                setPhoneFull(formattedValue || value);
                setPhoneError("");
              }}
              enableSearch
              inputClass="input"
              placeholder="Phone number"
            />
          </div>

          {phoneError && <p className="errorText2">{phoneError}</p>}

          <div className="referralRow">
            <input
              type="checkbox"
              checked={hasReferral}
              onChange={() => {
                setHasReferral(!hasReferral);
                if (!hasReferral) {
                  setFormData({ ...formData, used_referred_code: "" });
                }
                setReferralError("");
                setReferralSuccess("");
              }}
            />{" "}
            I have a referral code
          </div>

          {hasReferral && (
            <div className="referralInputContainer">
              <input
                type="text"
                placeholder="Enter 5-digit referral code"
                className="input referralInput"
                value={formData.used_referred_code}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 5); // Solo números, máximo 5 dígitos
                  handleReferralCodeChange(value);
                }}
                maxLength={5}
                pattern="[0-9]{5}"
                title="Please enter exactly 5 digits"
              />
              {validatingReferral && (
                <div className="referral-validating">Validating code...</div>
              )}
              {referralSuccess && (
                <div className="referral-success">{referralSuccess}</div>
              )}
            </div>
          )}

          {referralError && <p className="errorText">{referralError}</p>}

          <button 
            type="submit" 
            className="submitButton"
            disabled={validatingReferral}
          >
            {validatingReferral ? "Validating..." : "Finish Registration"}
          </button>
        </form>
      </div>
    </div>
  );
}