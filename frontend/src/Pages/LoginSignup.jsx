import React, { useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShopContext } from '../Context/ShopContext';
import './LoginSignup.css';

const API_BASE = process.env.REACT_APP_API_URL || 'https://explorer-backend.vercel.app';

export const LoginSignup = () => {
  const [state, setState] = useState("Login");
  const [otpSent, setOtpSent] = useState(false);
  const [formData, setFormData] = useState({ username: "", email: "", otp: "" });

  const { getUser, mergeGuestCart, cartItems } = useContext(ShopContext);
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.from?.pathname || '/';

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOtp = () => {
    if (!formData.email) return alert("Please enter your email.");
    setOtpSent(true);
    alert(`Mock OTP sent to ${formData.email}. Use 123456 for testing.`);
  };

  const handleVerifyOtp = async () => {
    if (formData.otp !== "123456") return alert("Incorrect OTP. Use 123456.");

    // Capture guest cart before login overwrites state
    const guestCart = { ...cartItems };

    const endpoint = state === "Login" ? "/login" : "/signup";
    const body = state === "Login"
      ? { email: formData.email, password: "otp_verified" }
      : { name: formData.username, email: formData.email, password: "otp_verified" };

    let responseData;
    await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then((r) => r.json()).then((d) => responseData = d);

    if (responseData.success) {
      const token = responseData.token;
      localStorage.setItem('auth-token', token);
      // getUser overwrites cartItems with DB data; mergeGuestCart then pushes guest items on top
      await getUser(token);
      await mergeGuestCart(guestCart, token);
      navigate(returnTo, { replace: true });
    } else {
      alert(responseData.errors);
    }
  };

  return (
    <div className='loginsignup fade-in'>
      <div className="loginsignup-container">
        <div className="loginsignup-header-bar" />
        <div className="loginsignup-inner">
          <h1>{state}</h1>
          <p className="loginsignup-subtitle">
            {state === "Login" ? "Welcome back! Sign in to continue." : "Create your account in seconds."}
          </p>

          {!otpSent ? (
            <div className="loginsignup-fields">
              {state === "Sign Up" && (
                <input name='username' value={formData.username} onChange={changeHandler} type="text" placeholder='Your Full Name' />
              )}
              <input name='email' value={formData.email} onChange={changeHandler} type="email" placeholder='Email Address' />
              <button onClick={handleSendOtp}>Send OTP</button>
            </div>
          ) : (
            <div className="loginsignup-fields">
              <input name='otp' value={formData.otp} onChange={changeHandler} type="text" placeholder='Enter 6-digit OTP' maxLength={6} />
              <p className="loginsignup-otp-note">✉️ A code was sent to {formData.email}</p>
              <button onClick={handleVerifyOtp}>Verify & Continue</button>
            </div>
          )}

          {state === "Sign Up"
            ? <p className="loginsignup-login">Already have an account? <span onClick={() => { setState("Login"); setOtpSent(false); }}>Login here</span></p>
            : <p className="loginsignup-login">New here? <span onClick={() => { setState("Sign Up"); setOtpSent(false); }}>Create an account</span></p>}

          <div className="loginsignup-agree">
            <input type="checkbox" />
            <p>By continuing, I agree to the terms of use & privacy policy.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
