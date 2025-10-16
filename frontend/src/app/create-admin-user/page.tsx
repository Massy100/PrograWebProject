"use client";  

import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { useRouter } from 'next/navigation'; 
import '../../styles/createadminusers.css';

type LoginProps = {
  open: boolean;
  onClose?: () => void;
  onSuccess?: (role: "admin" | "user") => void;
};

export default function Createadminuser({ open, onClose, onSuccess }: LoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phoneFull, setPhoneFull] = useState('');
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '', 
    phone: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const router = useRouter();  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    setUserData({
      ...userData,
      [field]: e.target.value,
    });
  };


  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };


  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    

    setErrorMessage('');
    setSuccessMessage('');


    if (userData.password !== userData.confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    if (!phoneFull) {
      setErrorMessage('Phone number is required');
      return;
    }


    const formData = {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      phone: phoneFull,
    };

    setLoading(true);

    try {

      const response = await fetch('http://localhost:8000/api/usersadmin/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Registration successful!');
        router.push('/dashboard-user');  
      } else {
        setErrorMessage(data.message || 'Something went wrong, please try again.');
      }
    } catch (error) {
      setErrorMessage('Error connecting to the server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };


  const handleGoBack = () => {
    router.push('/dashboard-user');  
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-picture">
          <span>{getInitial(userData.username)}</span>
        </div>
        <div className="profile-info">
          <h1>{userData.username || 'Enter your name'}</h1>
          <p>{userData.email || 'Enter your email'}</p>
          <p>{phoneFull || 'Enter your phone number'}</p>
        </div>
      </div>

      <div className="profile-form">
        <h2>Register</h2>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}

        <form className="form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                placeholder="Username"
                className="input"
                value={userData.username}
                onChange={(e) => handleInputChange(e, 'username')}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="input"
                value={userData.email}
                onChange={(e) => handleInputChange(e, 'email')}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Password</label>
              <div className="passwordContainer">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  className="input"
                  value={userData.password}
                  onChange={(e) => handleInputChange(e, 'password')}
                />
                <button
                  type="button"
                  className="eyeButton"
                  onClick={togglePassword}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <div className="passwordContainer">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  className="input"
                  value={userData.confirmPassword}
                  onChange={(e) => handleInputChange(e, 'confirmPassword')}
                />
                <button
                  type="button"
                  className="eyeButton"
                  onClick={toggleConfirmPassword}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone Number</label>
              <PhoneInput
                value={phoneFull}
                onChange={setPhoneFull}
                inputClass="input"
                enableSearch
                placeholder="Phone Number"
              />
            </div>
          </div>

          <button type="submit" className="submitButton" disabled={loading}>
            {loading ? 'Registering...' : 'Save Changes'}
          </button>
        </form>


        <button onClick={handleGoBack} className="backButton">
          Back
        </button>
      </div>
    </div>
  );
};


