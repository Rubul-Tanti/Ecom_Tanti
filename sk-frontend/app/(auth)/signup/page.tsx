"use client";

import { useUserContext } from "@/contextProvider";
import { useAuthentication } from "@/hooks/useAuthentication";
import { useGoogleLogin } from "@react-oauth/google";
import { AxiosError } from "axios";
import { Loader } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";



export default function Register() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [form, setForm] = useState({ userName: "", email: "", password: "" });
  const [otpTimer, setOtpTimer] = useState(5 * 60);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const {registerUserWithEmail:emailVerification,otpVerifation,registerWithGoogle} = useAuthentication()
  const {setUser}=useUserContext()
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setOtpTimer(5 * 60);
    timerRef.current = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTimer = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const timerExpired = otpTimer === 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLoading(true);
    const onSuccess = () => {
      toast("OTP has been sent to your email");
      setLoading(false);
      setStep(2);
      startTimer();
    };
    const onError = (err:any) => {
        toast.error(err.response.data.message)
      setLoading(false);
    };
    emailVerification.mutate(form, { onSuccess, onError });
  };

  const handleResend = (e: React.MouseEvent<HTMLButtonElement>) => {
    setOtp(["", "", "", "", "", ""]);
    handleSubmit(e);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
  };

  const handleVerify = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (otp.join("").length < 6) return;
    setLoading(true);
    const Otp=otp.reduce((accumulator,currentVallue)=>accumulator+currentVallue)
          otpVerifation.mutate({...form,otp:Otp},{onSuccess:(v)=>{
            const data=v.data.data
            setUser({role:data.role,userName:data.userName,email:data.email,profilePicture:data.profilePicture,isAuthenticated:true,cartCount:data.cartCount,isLoading:false})
            localStorage.setItem('access_token',v.data.access_token)
          toast('user created successfully')
          setStep(3)
        },onError:(e)=>{
          toast.error(
            e.message
          )
        }})

  };

  const handleGoogle =useGoogleLogin({
    onSuccess: (tokenResponse) => {
      const token=tokenResponse.access_token
      registerWithGoogle.mutate(token,{onSuccess:(v)=>{
        toast(v.data.message)
        localStorage.setItem('access_token',v.data.access_token)
        setUser({
          isAuthenticated:true,
          role:v.data.data.role,
          email:v.data.data.email,
          cartCount:v.data.data._cart.count,
          userName:v.data.data.userName,
          profilePicture:v.data.data.profilePicture,
          isLoading:false
        })
        setStep(3)
      },onError:(e:any)=>{
        if(e.response){
          toast.error(e.response.data.message)
        }
      },})
    },
    onError: () => console.log("Login Failed"),
  });
  const filledOtp = otp.every((d) => d !== "");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Syne:wght@400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .rg-root {
          min-height: 100vh;
          background: #ffffff;
          display: flex;
          font-family: 'Syne', sans-serif;
          color: #0a0a0a;
          overflow: hidden;
          position: relative;
        }

        .rg-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
          z-index: 0;
        }

        .rg-watermark {
          position: fixed;
          bottom: -60px;
          right: -20px;
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(200px, 30vw, 380px);
          line-height: 1;
          color: rgba(0,0,0,0.04);
          pointer-events: none;
          user-select: none;
          z-index: 0;
          letter-spacing: -4px;
        }

        .rg-container {
          position: relative;
          z-index: 1;
          width: 100%;
          display: flex;
          align-items: stretch;
        }

        .rg-sidebar {
          width: 6px;
          background: #0a0a0a;
          flex-shrink: 0;
          position: relative;
        }

        .rg-sidebar::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 6px;
          height: 40%;
          background: #ffffff;
          border-top: 6px solid #0a0a0a;
        }

        .rg-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: clamp(40px, 6vw, 100px) clamp(32px, 8vw, 120px);
          max-width: 680px;
        }

        .rg-nav {
          position: fixed;
          top: 0;
          left: 6px;
          right: 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 28px clamp(32px, 8vw, 120px);
          z-index: 10;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(8px);
          border-bottom: 1px solid rgba(0,0,0,0.06);
        }

        .rg-logo {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 28px;
          letter-spacing: 4px;
          color: #0a0a0a;
          text-decoration: none;
        }

        .rg-nav-link {
          font-size: 11px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #888;
          text-decoration: none;
          transition: color 0.2s;
        }
        .rg-nav-link:hover { color: #0a0a0a; }

        .rg-steps {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 32px;
        }

        .rg-step-dot {
          width: 28px;
          height: 4px;
          background: #e0e0e0;
          transition: background 0.3s;
        }

        .rg-step-dot.active { background: #0a0a0a; }

        .rg-step-label {
          font-size: 10px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #aaa;
          margin-left: 4px;
        }

        .rg-content {
          padding-top: 90px;
          animation: fadeUp 0.45s ease forwards;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .rg-eyebrow {
          font-size: 11px;
          letter-spacing: 5px;
          text-transform: uppercase;
          color: #888;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .rg-eyebrow::before {
          content: '';
          display: block;
          width: 40px;
          height: 1px;
          background: #888;
        }

        .rg-heading {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(48px, 7vw, 80px);
          line-height: 0.9;
          letter-spacing: -1px;
          margin-bottom: 20px;
          color: #0a0a0a;
        }

        .rg-heading span { color: #888; }

        .rg-description {
          font-size: 15px;
          color: #555;
          line-height: 1.7;
          max-width: 380px;
          margin-bottom: 36px;
          font-weight: 400;
        }

        .rg-description strong { color: #0a0a0a; font-weight: 600; }

        .rg-google-btn {
          width: 100%;
          padding: 16px 20px;
          background: #fff;
          border: 1.5px solid #e0e0e0;
          font-family: 'Syne', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #0a0a0a;
          letter-spacing: 1px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
          margin-bottom: 24px;
          border-radius: 0;
        }

        .rg-google-btn:hover {
          border-color: #0a0a0a;
          box-shadow: 4px 4px 0px #0a0a0a;
          transform: translate(-2px, -2px);
        }

        .rg-google-btn:active { transform: translate(0,0); box-shadow: none; }

        .rg-divider {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }

        .rg-divider-line { flex: 1; height: 1px; background: #e0e0e0; }

        .rg-divider-text {
          font-size: 10px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #aaa;
        }

        .rg-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .rg-field { margin-bottom: 16px; }

        .rg-label {
          display: block;
          font-size: 11px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #0a0a0a;
          margin-bottom: 10px;
          font-weight: 600;
        }

        .rg-input-wrap { position: relative; }

        .rg-input {
          width: 100%;
          padding: 15px 18px;
          border: 1.5px solid #e0e0e0;
          background: #fff;
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          color: #0a0a0a;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          border-radius: 0;
          -webkit-appearance: none;
        }

        .rg-input:focus {
          border-color: #0a0a0a;
          box-shadow: 4px 4px 0px #0a0a0a;
        }

        .rg-input::placeholder { color: #bbb; }
        .rg-input-pw { padding-right: 52px; }

        .rg-eye-btn {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #888;
          padding: 4px;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }
        .rg-eye-btn:hover { color: #0a0a0a; }

        .rg-strength {
          display: flex;
          gap: 4px;
          margin-top: 8px;
        }

        .rg-strength-bar {
          flex: 1;
          height: 3px;
          background: #e0e0e0;
          transition: background 0.3s;
        }

        .rg-btn {
          width: 100%;
          padding: 19px;
          background: #0a0a0a;
          color: #ffffff;
          border: none;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 18px;
          letter-spacing: 4px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: transform 0.15s, box-shadow 0.15s;
          margin-top: 8px;
        }

        .rg-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: #ffffff;
          transform: translateX(-101%);
          transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
          mix-blend-mode: difference;
        }

        .rg-btn:not(:disabled):hover::after { transform: translateX(0); }

        .rg-btn:not(:disabled):hover {
          box-shadow: 5px 5px 0px rgba(0,0,0,0.15);
          transform: translate(-2px,-2px);
        }

        .rg-btn:active { transform: translate(0,0); box-shadow: none; }
        .rg-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .rg-btn-inner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .rg-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .rg-login {
          margin-top: 24px;
          font-size: 13px;
          color: #888;
          text-align: center;
        }

        .rg-login a {
          color: #0a0a0a;
          font-weight: 600;
          text-decoration: none;
          border-bottom: 1px solid #0a0a0a;
          padding-bottom: 1px;
          transition: opacity 0.2s;
        }

        .rg-login a:hover { opacity: 0.6; }

        /* ── OTP Timer ── */
        .otp-timer-row {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 24px;
        }

        .otp-timer-digits {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 32px;
          letter-spacing: 4px;
          line-height: 1;
          min-width: 72px;
          transition: color 0.3s;
        }

        .otp-timer-track { flex: 1; }

        .otp-timer-bar-bg {
          height: 3px;
          background: #e0e0e0;
          position: relative;
          overflow: hidden;
        }

        .otp-timer-bar-fill {
          position: absolute;
          inset: 0;
          transform-origin: left;
          transition: transform 1s linear, background 0.3s;
        }

        .otp-timer-caption {
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-top: 6px;
          transition: color 0.3s;
        }

        /* ── OTP Grid ── */
        .otp-grid {
          display: flex;
          gap: 10px;
          margin-bottom: 32px;
        }

        .otp-cell {
          flex: 1;
          aspect-ratio: 1;
          max-width: 64px;
          border: 1.5px solid #e0e0e0;
          background: #fff;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 28px;
          text-align: center;
          color: #0a0a0a;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, opacity 0.3s;
          border-radius: 0;
          -webkit-appearance: none;
          caret-color: transparent;
        }

        .otp-cell:focus {
          border-color: #0a0a0a;
          box-shadow: 4px 4px 0px #0a0a0a;
        }

        .otp-cell.filled { border-color: #0a0a0a; }
        .otp-cell:disabled { opacity: 0.4; cursor: not-allowed; }

        .rg-resend {
          font-size: 12px;
          color: #888;
          margin-top: 20px;
          text-align: center;
        }

        .rg-resend button {
          background: none;
          border: none;
          font-family: 'Syne', sans-serif;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: underline;
          padding: 0;
          transition: opacity 0.2s;
        }

        .rg-resend button:disabled {
          opacity: 0.35;
          cursor: not-allowed;
          text-decoration: none;
        }

        .rg-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-top: 28px;
          font-size: 11px;
          letter-spacing: 3px;
          text-transform: uppercase;
          cursor: pointer;
          background: none;
          border: none;
          font-family: 'Syne', sans-serif;
          transition: color 0.2s, opacity 0.2s;
          padding: 0;
        }

        .rg-back-btn:not(:disabled):hover { color: #0a0a0a; }
        .rg-back-btn:not(:disabled):hover svg { transform: translateX(-4px); }
        .rg-back-btn svg { transition: transform 0.2s; }
        .rg-back-btn:disabled { cursor: not-allowed; opacity: 0.3; }

        /* ── Success ── */
        .rg-success-icon {
          width: 64px;
          height: 64px;
          border: 2px solid #0a0a0a;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 32px;
        }

        /* ── Deco ── */
        .rg-deco {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .rg-deco-inner {
          position: relative;
          width: 300px;
          height: 300px;
        }

        .rg-deco-circle {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(0,0,0,0.1);
        }

        .rg-deco-circle:nth-child(1) { inset: 0;    animation: rotateCw  20s linear infinite; }
        .rg-deco-circle:nth-child(2) { inset: 30px; animation: rotateCcw 14s linear infinite; }
        .rg-deco-circle:nth-child(3) { inset: 70px; animation: rotateCw   8s linear infinite; }

        @keyframes rotateCw  { to { transform: rotate(360deg);  } }
        @keyframes rotateCcw { to { transform: rotate(-360deg); } }

        .rg-deco-dot {
          position: absolute;
          width: 6px;
          height: 6px;
          background: #0a0a0a;
          border-radius: 50%;
          top: -3px;
          left: 50%;
          transform: translateX(-50%);
        }

        .rg-deco-label {
          position: absolute;
          bottom: -48px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 10px;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: #bbb;
          white-space: nowrap;
        }

        .Toastify__progress-bar--success { background: #0a0a0a !important; }
        .Toastify__progress-bar--error   { background: #ef4444 !important; }

        @media (max-width: 768px) {
          .rg-deco { display: none; }
          .rg-main { max-width: 100%; }
          .rg-row-2 { grid-template-columns: 1fr; }
          .otp-grid { gap: 8px; }
        }
      `}</style>

      <div className="rg-root">
        <div className="rg-watermark">TANTI</div>
        <div className="rg-sidebar" />

        <div className="rg-container">
          <div className="rg-main">

            <nav className="rg-nav">
              <a href="/" className="rg-logo">TANTI</a>
              <a href="/signin" className="rg-nav-link">Sign In</a>
            </nav>

            <div className="rg-content" key={step}>

              <div className="rg-steps">
                {[1, 2, 3].map((s) => (
                  <div key={s} className={`rg-step-dot ${step >= s ? "active" : ""}`} />
                ))}
                <span className="rg-step-label">
                  {step === 1 && "Create Account"}
                  {step === 2 && "Verify Email"}
                  {step === 3 && "All Done"}
                </span>
              </div>

              {/* ════ STEP 1 ════ */}
              {step === 1 && (
                <>
                  <p className="rg-eyebrow">Step 01 of 02</p>
                  <h1 className="rg-heading">JOIN<br /><span>THE</span><br />TANTI</h1>
                  <p className="rg-description">
                    Create your account and get early access to drops, exclusive colourways, and member-only releases.
                  </p>

                  <button className="rg-google-btn" onClick={()=>{handleGoogle()}} type="button">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                    </svg>
                    {registerWithGoogle.isPending?<div className="animate-pulse flex">Signing with google <Loader className="animate-spin"/>
                    </div>
                    :'Sign up with Google'}
                  </button>

                  <div className="rg-divider">
                    <div className="rg-divider-line" />
                    <span className="rg-divider-text">or</span>
                    <div className="rg-divider-line" />
                  </div>

                  <form>
                    <div className="rg-row-2">
                      <div className="rg-field">
                        <label className="rg-label" htmlFor="userName">Username</label>
                        <input id="userName" name="userName" type="text" className="rg-input" placeholder="@handle" value={form.userName} onChange={handleChange} required autoComplete="username" />
                      </div>
                      <div className="rg-field">
                        <label className="rg-label" htmlFor="email">Email</label>
                        <input id="email" name="email" type="email" className="rg-input" placeholder="you@example.com" value={form.email} onChange={handleChange} required autoComplete="email" />
                      </div>
                    </div>

                    <div className="rg-field">
                      <label className="rg-label" htmlFor="password">Password</label>
                      <div className="rg-input-wrap">
                        <input
                          id="password" name="password"
                          type={showPassword ? "text" : "password"}
                          className="rg-input rg-input-pw"
                          placeholder="Min. 8 characters"
                          value={form.password} onChange={handleChange}
                          required autoComplete="new-password"
                        />
                        <button type="button" className="rg-eye-btn" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>
                          {showPassword ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                              <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                              <line x1="1" y1="1" x2="23" y2="23"/>
                            </svg>
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                              <circle cx="12" cy="12" r="3"/>
                            </svg>
                          )}
                        </button>
                      </div>
                      {form.password && (
                        <div className="rg-strength">
                          {[1, 2, 3, 4].map((lvl) => (
                            <div key={lvl} className="rg-strength-bar" style={{
                              background: form.password.length >= lvl * 3
                                ? lvl <= 1 ? "#ef4444" : lvl === 2 ? "#f97316" : lvl === 3 ? "#eab308" : "#22c55e"
                                : "#e0e0e0"
                            }} />
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      onClick={handleSubmit}
                      className="rg-btn"
                      disabled={!form.userName || !form.email || !form.password || loading}
                    >
                      <span className="rg-btn-inner">
                        {loading && <span className="rg-spinner" />}
                        {loading ? "Creating Account..." : "Create Account"}
                      </span>
                    </button>
                  </form>

                  <p className="rg-login">Already have an account? <a href="/signin">Sign In</a></p>
                </>
              )}

              {/* ════ STEP 2 ════ */}
              {step === 2 && (
                <>
                  <p className="rg-eyebrow">Step 02 of 02</p>
                  <h1 className="rg-heading">VERIFY<br /><span>YOUR</span><br />EMAIL</h1>
                  <p className="rg-description">
                    We sent a 6-digit code to <strong>{form.email}</strong>. Enter it below to confirm your account.
                  </p>

                  {/* Timer */}
                  <div className="otp-timer-row">
                    <div className="otp-timer-digits" style={{ color: timerExpired ? "#ef4444" : "#0a0a0a" }}>
                      {formatTimer(otpTimer)}
                    </div>
                    <div className="otp-timer-track">
                      <div className="otp-timer-bar-bg">
                        <div
                          className="otp-timer-bar-fill"
                          style={{
                            background: timerExpired ? "#ef4444" : "#0a0a0a",
                            transform: `scaleX(${otpTimer / 300})`,
                          }}
                        />
                      </div>
                      <div className="otp-timer-caption" style={{ color: timerExpired ? "#ef4444" : "#aaa" }}>
                        {timerExpired ? "Code expired" : "Code expires in"}
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleVerify}>
                    <div className="otp-grid" onPaste={handleOtpPaste}>
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el: HTMLInputElement | null) => { otpRefs.current[i] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          className={`otp-cell ${digit ? "filled" : ""}`}
                          value={digit}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e)}
                          autoFocus={i === 0}
                          disabled={timerExpired}
                        />
                      ))}
                    </div>

                    <button type="submit" className="rg-btn" disabled={!filledOtp || otpVerifation.isPending || timerExpired}>
                      <span className="rg-btn-inner">
                        {otpVerifation.isPending && <span className="rg-spinner" />}
                        {otpVerifation.isPending ? "Verifying..." : "Verify & Continue"}
                      </span>
                    </button>
                  </form>

                  <p className="rg-resend">
                    Didn't get a code?{" "}
                    <button
                      type="button"
                      disabled={!timerExpired}
                      onClick={handleResend}
                      style={{ color: timerExpired ? "#0a0a0a" : "#aaa" }}
                    >
                      {timerExpired ? "Resend code" : `Resend in ${formatTimer(otpTimer)}`}
                    </button>
                  </p>

                  <button
                    className="rg-back-btn"
                    disabled={!timerExpired}
                    onClick={() => { if (timerExpired) { clearInterval(timerRef.current!); setStep(1); } }}
                    style={{ color: timerExpired ? "#888" : "#ccc" }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {timerExpired ? "Back" : "Back (locked)"}
                  </button>
                </>
              )}

              {/* ════ STEP 3 ════ */}
              {step === 3 && (
                <>
                  <div className="rg-success-icon">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                      <path d="M6 14L11 19L22 9" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h1 className="rg-heading">YOU'RE<br /><span>IN THE</span><br />CREW</h1>
                  <p className="rg-description">
                    Welcome to TANTI, <strong>{form.userName}</strong>. Your account is ready. Start browsing the latest drops.
                  </p>
                  <a href="/" className="rg-btn" style={{ display: "block", textAlign: "center", textDecoration: "none", padding: "19px", fontFamily: "'Bebas Neue', sans-serif", fontSize: "18px", letterSpacing: "4px", background: "#0a0a0a", color: "#fff" }}>
                    Explore TANTI
                  </a>
                </>
              )}

            </div>
          </div>

          <div className="rg-deco">
            <div className="rg-deco-inner">
              <div className="rg-deco-circle"><div className="rg-deco-dot" /></div>
              <div className="rg-deco-circle"><div className="rg-deco-dot" /></div>
              <div className="rg-deco-circle"><div className="rg-deco-dot" /></div>
              <span className="rg-deco-label">New Member</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}