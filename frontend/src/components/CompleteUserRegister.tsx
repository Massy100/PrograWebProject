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

interface ReferralValidationResult {
  valid: boolean;
  message: string;
  referrer_name?: string;
}

export default function CompleteUserRegister({ onClose, onSuccess }: CompleteUserRegisterProps) {
  const { getAccessTokenSilently, user: auth0User } = useAuth0();
  const [isOpen, setIsOpen] = useState(true);
  const [hasReferral, setHasReferral] = useState(false);
  const [referralError, setReferralError] = useState("");
  const [referralSuccess, setReferralSuccess] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [phoneFull, setPhoneFull] = useState("");
  const [isValidatingReferral, setIsValidatingReferral] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    used_referred_code: "",
    is_completed: true,
    phone: ""
  });

  const validateReferralCode = async (code: string): Promise<ReferralValidationResult> => {
    try {
      let token;
      try {
        token = await getAccessTokenSilently();
        console.log('✅ Token obtenido correctamente');
      } catch (tokenError) {
        console.error('❌ Error obteniendo token:', tokenError);
        return {
          valid: false,
          message: 'Authentication error. Please refresh the page.'
        };
      }

      console.log('🔍 Validando código:', code);

      // SOLUCIÓN: Enviar solo el código, sin user_id
      const requestBody = {
        referral_code: code
      };

      const response = await fetch('http://localhost:8000/api/referrals/validate-referral/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        try {
          const errorData = await response.json();
          console.error('❌ Error response:', errorData);
          return {
            valid: false,
            message: errorData.message || `Error: ${response.status}`
          };
        } catch (parseError) {
          console.error('❌ Error parsing error response:', parseError);
          return {
            valid: false,
            message: `Server error: ${response.status}`
          };
        }
      }

      const result = await response.json();
      console.log('✅ Success response:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Network error:', error);
      return {
        valid: false,
        message: 'Network error. Please check your connection and try again.'
      };
    }
  };

  const processReferral = async (code: string): Promise<boolean> => {
    try {
      const token = await getAccessTokenSilently();
      
      // SOLUCIÓN: No necesitamos el user_id aquí, el backend puede obtenerlo del token
      const response = await fetch('http://localhost:8000/api/referrals/process-referral/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          referral_code: code
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error processing referral:', errorData);
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Error processing referral:', error);
      return false;
    }
  };

  const handleReferralCodeInput = (value: string) => {
    // Solo permitir números
    const numericValue = value.replace(/[^0-9]/g, '');
    // Limitar a 5 dígitos
    const limitedValue = numericValue.slice(0, 5);
    
    setFormData({ ...formData, used_referred_code: limitedValue });
    setReferralError("");
    setReferralSuccess("");
    
    // Si tiene 5 dígitos, validar inmediatamente
    if (limitedValue.length === 5) {
      handleReferralCodeValidation(limitedValue);
    } else if (limitedValue.length > 0) {
      setReferralError("Referral code must be exactly 5 digits");
    }
  };

  const handleReferralCodeValidation = async (code: string) => {
    if (code.length !== 5) {
      setReferralError("Referral code must be exactly 5 digits");
      return;
    }

    setIsValidatingReferral(true);
    setReferralError("");
    setReferralSuccess("");

    try {
      const validation = await validateReferralCode(code);
      
      console.log('🎯 Validation result:', validation);
      
      if (validation.valid) {
        setReferralSuccess(`Valid referral code! Referred by: ${validation.referrer_name}`);
        setReferralError("");
      } else {
        setReferralError(validation.message);
        setReferralSuccess("");
      }
    } catch (error) {
      console.error('❌ Validation error:', error);
      setReferralError("Unexpected error validating referral code");
      setReferralSuccess("");
    } finally {
      setIsValidatingReferral(false);
    }
  };

  const callApiWithData = async (dataToSend: typeof formData) => {
    try {
      const token = await getAccessTokenSilently();

      // SOLUCIÓN: Usar el email de Auth0 para encontrar el usuario
      // O modificar el backend para que acepte el token
      let userEndpoint;
      
      if (auth0User?.email) {
        // Buscar usuario por email
        userEndpoint = `http://localhost:8000/api/users/by-email/${encodeURIComponent(auth0User.email)}/`;
      } else {
        throw new Error("No user email available");
      }

      // Primero obtener el usuario por email
      const userResponse = await fetch(userEndpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!userResponse.ok) {
        throw new Error(`Error finding user: ${userResponse.status}`);
      }

      const userData = await userResponse.json();
      console.log("✅ User found:", userData);

      // Actualizar el usuario con su ID real
      const updateResponse = await fetch(`http://localhost:8000/api/users/${userData.id}/`, {
        method: "PATCH",
        body: JSON.stringify(dataToSend),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!updateResponse.ok) {
        throw new Error(`HTTP error! status: ${updateResponse.status}`);
      }

      const updatedData = await updateResponse.json();
      console.log("✅ User updated:", updatedData);

      // Si hay un código de referido válido, procesarlo
      if (hasReferral && formData.used_referred_code.trim() && referralSuccess) {
        console.log('🔄 Processing referral...');
        const referralProcessed = await processReferral(formData.used_referred_code);
        if (referralProcessed) {
          console.log("✅ Referral processed successfully");
        } else {
          console.log("⚠️ Referral processing failed, but user was updated");
        }
      }

    } catch (e) {
      console.error("❌ Error updating user:", e);
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

    // Validar código de referido si está presente
    if (hasReferral && formData.used_referred_code.trim()) {
      if (formData.used_referred_code.length !== 5) {
        setReferralError("Referral code must be exactly 5 digits");
        return;
      }

      if (referralError) {
        setReferralError("Please fix the referral code error before submitting");
        return;
      }

      if (isValidatingReferral) {
        setReferralError("Please wait while we validate your referral code");
        return;
      }

      if (!referralSuccess) {
        setReferralError("Please enter a valid referral code");
        return;
      }
    }

    const updatedFormData = { ...formData, phone: phoneFull };

    try {
      await callApiWithData(updatedFormData);
      onSuccess();
    } catch (error) {
      setReferralError("Error completing registration. Please try again.");
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

          {phoneError && <p className="errorText">{phoneError}</p>}

          <div className="referralRow">
            <input
              type="checkbox"
              id="referralCheckbox"
              checked={hasReferral}
              onChange={() => {
                setHasReferral(!hasReferral);
                setReferralError("");
                setReferralSuccess("");
                setFormData({ ...formData, used_referred_code: "" });
              }}
            />
            <label htmlFor="referralCheckbox">I have a referral code</label>
          </div>

          {hasReferral && (
            <div className="referralInputContainer">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Enter 5-digit code (e.g., 12345)"
                className="input referralInput"
                value={formData.used_referred_code}
                onChange={(e) => handleReferralCodeInput(e.target.value)}
                disabled={isValidatingReferral}
                maxLength={5}
              />
              <div className="codeHint">
                Must be exactly 5 digits.
              </div>
              
              {isValidatingReferral && (
                <div className="validation-loading">Validating referral code...</div>
              )}
              {referralSuccess && (
                <div className="successText">{referralSuccess}</div>
              )}
            </div>
          )}

          {referralError && <p className="errorText">{referralError}</p>}

          <button 
            type="submit" 
            className="submitButton"
            disabled={isValidatingReferral}
          >
            {isValidatingReferral ? "Validating..." : "Finish Registration"}
          </button>
        </form>
      </div>
    </div>
  );
}