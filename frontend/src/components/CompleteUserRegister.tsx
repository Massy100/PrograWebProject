"use client";

import { useState } from "react";
import "../styles/CompleteUserRegister.css";
import { PhoneNumberUtil } from "google-libphonenumber";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

export default function CompleteUserRegister() {
  const [isOpen, setIsOpen] = useState(true);
  const [hasReferral, setHasReferral] = useState(false);
  const [referralError, setReferralError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [phoneFull, setPhoneFull] = useState("");

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    referred_code: "",
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.first_name.trim() || !formData.last_name.trim()) {
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

    setPhoneError("");
    setReferralError("");
    setIsOpen(false);
  };

  const handleClose = () => setIsOpen(false);

  if (!isOpen) return null;

  return (
    <div className="modalOverlay" onClick={handleClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="closeButton" aria-label="Close" onClick={handleClose}>
          ✕
        </button>

        <h2 className="modalTitle">Complete Your Registration</h2>

        <form className="form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="First Name"
            className="input"
            value={formData.first_name}
            onChange={(e) =>
              setFormData({ ...formData, first_name: e.target.value })
            }
          />

          <input
            type="text"
            placeholder="Last Name"
            className="input"
            value={formData.last_name}
            onChange={(e) =>
              setFormData({ ...formData, last_name: e.target.value })
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
              onChange={(value) => setPhoneFull(value)}
              inputClass="input"
              enableSearch
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
                value={formData.referred_code}
                onChange={(e) =>
                  setFormData({ ...formData, referred_code: e.target.value })
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
