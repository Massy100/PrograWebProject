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

export default function CompleteUserRegister({ onClose, onSuccess }: CompleteUserRegisterProps) {
  const { getAccessTokenSilently } = useAuth0();
  const [isOpen, setIsOpen] = useState(true);
  const [hasReferral, setHasReferral] = useState(false);
  const [referralError, setReferralError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [phoneFull, setPhoneFull] = useState("");
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    used_referred_code: "",
    is_completed: true,
    phone: ""
  });

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
    } catch (e) {
      console.error("Error updating user:", e);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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

    const updatedFormData = { ...formData, phone: phoneFull };

    const strAuth = localStorage.getItem("auth");
    if (strAuth) {
      await callApiWithData(strAuth, updatedFormData);
      onSuccess();
    } else {
      throw new Error("User data was not fetched from storage.");
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
          />

          <input
            type="text"
            placeholder="Username"
            className="input"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
          />

          <div className="phoneContainer">
            <PhoneInput
              country={"gt"}
              value={phoneFull}
              onChange={(value, data, event, formattedValue) => {
                setPhoneFull(formattedValue || value);
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
              onChange={() => setHasReferral(!hasReferral)}
            />{" "}
            I have a referral code
          </div>

          {hasReferral && (
            <div className="referralInputContainer">
              <input
                type="text"
                placeholder="Referral code"
                className="input referralInput"
                value={formData.used_referred_code}
                onChange={(e) =>
                  setFormData({ ...formData, used_referred_code: e.target.value })
                }
              />
            </div>
          )}

          {referralError && <p className="errorText">{referralError}</p>}

          <button type="submit" className="submitButton">
            Finish Registration
          </button>
        </form>
      </div>
    </div>
  );
}