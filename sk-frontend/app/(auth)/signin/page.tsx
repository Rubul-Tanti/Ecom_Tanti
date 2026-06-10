"use client";

import { useUserContext } from "@/contextProvider";
import { useAuthentication } from "@/hooks/useAuthentication";
import { useGoogleLogin } from "@react-oauth/google";
import { Loader } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const {registerWithGoogle,loginWithEmail} = useAuthentication()
    const {setUser}=useUserContext()
  const handleSubmit = (e:React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    // hook up your auth logic here
    loginWithEmail.mutate({email,password},{onSuccess:(v)=>{
      toast('login successfully')
        localStorage.setItem('access_token',v.data.access_token)
        setUser({
          isAuthenticated:true,
          role:v.data.data.role,
          email:v.data.data.email,
          userName:v.data.data.userName,
          profilePicture:v.data.data.profilePicture
          ,cartCount:v.data.data.cartCount
        })
        setLoading(false)
      },onError:(e:any)=>{
        setLoading(false)
        if(e.response){
          toast.error(e.response.data.message)
        }
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
          userName:v.data.data.userName,
          cartCount:v.data.data.cartCount,
          profilePicture:v.data.data.profilePicture
        })
      },onError:(e:any)=>{
        if(e.response){
          toast.error(e.response.data.message)
        }
      },})
    },
    onError: () => console.log("Login Failed"),
  });
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Syne:wght@400;500;600;700&display=swap');

        .lg-root {
          min-height: 100vh;
          background: #ffffff;
          display: flex;
          font-family: 'Syne', sans-serif;
          color: #0a0a0a;
          overflow: hidden;
          position: relative;
        }

        /* background grid */
        .lg-root::before {
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

        /* large watermark */
        .lg-watermark {
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

        .lg-container {
          position: relative;
          z-index: 1;
          width: 100%;
          display: flex;
          align-items: stretch;
        }

        /* left accent bar */
        .lg-sidebar {
          width: 6px;
          background: #0a0a0a;
          flex-shrink: 0;
          position: relative;
        }

        .lg-sidebar::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 6px;
          height: 40%;
          background: #ffffff;
          border-top: 6px solid #0a0a0a;
        }

        /* main form panel */
        .lg-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: clamp(40px, 8vw, 100px) clamp(32px, 8vw, 120px);
          max-width: 680px;
        }

        /* top nav */
        .lg-nav {
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

        .lg-logo {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 28px;
          letter-spacing: 4px;
          color: #0a0a0a;
          text-decoration: none;
        }

        .lg-nav-link {
          font-size: 11px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #888;
          text-decoration: none;
          transition: color 0.2s;
        }

        .lg-nav-link:hover { color: #0a0a0a; }

        /* content */
        .lg-content {
          padding-top: 80px;
          animation: fadeUp 0.5s ease forwards;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .lg-eyebrow {
          font-size: 11px;
          letter-spacing: 5px;
          text-transform: uppercase;
          color: #888;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .lg-eyebrow::before {
          content: '';
          display: block;
          width: 40px;
          height: 1px;
          background: #888;
        }

        .lg-heading {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(52px, 8vw, 88px);
          line-height: 0.9;
          letter-spacing: -1px;
          margin-bottom: 20px;
          color: #0a0a0a;
        }

        .lg-heading span {
          color: #888;
        }

        .lg-description {
          font-size: 15px;
          color: #555;
          line-height: 1.7;
          max-width: 360px;
          margin-bottom: 44px;
          font-weight: 400;
        }

        /* Google button */
        .lg-google-btn {
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
          margin-bottom: 28px;
          border-radius: 0;
        }

        .lg-google-btn:hover {
          border-color: #0a0a0a;
          box-shadow: 4px 4px 0px #0a0a0a;
          transform: translate(-2px, -2px);
        }

        .lg-google-btn:active {
          transform: translate(0,0);
          box-shadow: none;
        }

        /* divider */
        .lg-divider {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 28px;
        }

        .lg-divider-line {
          flex: 1;
          height: 1px;
          background: #e0e0e0;
        }

        .lg-divider-text {
          font-size: 10px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #aaa;
        }

        /* fields */
        .lg-field {
          margin-bottom: 20px;
        }

        .lg-label {
          display: block;
          font-size: 11px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #0a0a0a;
          margin-bottom: 10px;
          font-weight: 600;
        }

        .lg-input-wrap {
          position: relative;
        }

        .lg-input {
          width: 100%;
          padding: 16px 20px;
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

        .lg-input:focus {
          border-color: #0a0a0a;
          box-shadow: 4px 4px 0px #0a0a0a;
        }

        .lg-input::placeholder { color: #bbb; }

        .lg-input-pw {
          padding-right: 52px;
        }

        .lg-eye-btn {
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

        .lg-eye-btn:hover { color: #0a0a0a; }

        /* forgot link row */
        .lg-row {
          display: flex;
          justify-content: flex-end;
          margin-top: -8px;
          margin-bottom: 28px;
        }

        .lg-forgot {
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #888;
          text-decoration: none;
          transition: color 0.2s;
        }

        .lg-forgot:hover { color: #0a0a0a; }

        /* submit button */
        .lg-btn {
          width: 100%;
          padding: 20px;
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
        }

        .lg-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: #ffffff;
          transform: translateX(-101%);
          transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
          mix-blend-mode: difference;
        }

        .lg-btn:hover::after { transform: translateX(0); }

        .lg-btn:hover {
          box-shadow: 5px 5px 0px rgba(0,0,0,0.15);
          transform: translate(-2px,-2px);
        }

        .lg-btn:active {
          transform: translate(0,0);
          box-shadow: none;
        }

        .lg-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .lg-btn:disabled:hover {
          transform: none;
          box-shadow: none;
        }

        .lg-btn-inner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .lg-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* register link */
        .lg-register {
          margin-top: 28px;
          font-size: 13px;
          color: #888;
          text-align: center;
        }

        .lg-register a {
          color: #0a0a0a;
          font-weight: 600;
          text-decoration: none;
          border-bottom: 1px solid #0a0a0a;
          padding-bottom: 1px;
          transition: opacity 0.2s;
        }

        .lg-register a:hover { opacity: 0.6; }

        /* decorative right panel */
        .lg-deco {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .lg-deco-inner {
          position: relative;
          width: 300px;
          height: 300px;
        }

        .lg-deco-circle {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(0,0,0,0.1);
        }

        .lg-deco-circle:nth-child(1) { inset: 0;   animation: rotateCw 20s linear infinite; }
        .lg-deco-circle:nth-child(2) { inset: 30px; animation: rotateCcw 14s linear infinite; }
        .lg-deco-circle:nth-child(3) { inset: 70px; animation: rotateCw 8s linear infinite; }

        @keyframes rotateCw  { to { transform: rotate(360deg);  } }
        @keyframes rotateCcw { to { transform: rotate(-360deg); } }

        .lg-deco-dot {
          position: absolute;
          width: 6px;
          height: 6px;
          background: #0a0a0a;
          border-radius: 50%;
          top: -3px;
          left: 50%;
          transform: translateX(-50%);
        }

        .lg-deco-label {
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

        @media (max-width: 768px) {
          .lg-deco { display: none; }
          .lg-main { max-width: 100%; }
        }
      `}</style>

      <div className="lg-root">
        <div className="lg-watermark">TANTI</div>

        <div className="lg-sidebar" />

        <div className="lg-container">
          <div className="lg-main">
            {/* Nav */}
            <nav className="lg-nav">
              <a href="/" className="lg-logo">TANTI</a>
              <a href="/signup" className="lg-nav-link">Create Account</a>
            </nav>

            <div className="lg-content">
              <p className="lg-eyebrow">Welcome Back</p>
              <h1 className="lg-heading">
                SIGN<br />
                <span>INTO</span><br />
                TANTI
              </h1>
              <p className="lg-description">
                Your next pair is waiting. Log in to your account to continue.
              </p>

              {/* Google Sign In */}
              <button className="lg-google-btn" onClick={()=>handleGoogle()} type="button">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                  <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
                {registerWithGoogle.isPending?<div className="animate-pulse flex">Signing with google <Loader className="animate-spin"/>
                    </div>
                    :'Continue with Google'}

              </button>

              {/* Divider */}
              <div className="lg-divider">
                <div className="lg-divider-line" />
                <span className="lg-divider-text">or</span>
                <div className="lg-divider-line" />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div className="lg-field">
                  <label htmlFor="email" className="lg-label">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    className="lg-input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="lg-field">
                  <label htmlFor="password" className="lg-label">Password</label>
                  <div className="lg-input-wrap">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className="lg-input lg-input-pw"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="lg-eye-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
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
                </div>

                <div className="lg-row">
                  <a href="/forgot-password" className="lg-forgot">Forgot password?</a>
                </div>

                <button
                  type="submit"
                  className="lg-btn"
                  disabled={!email || !password || loading}
                >
                  <span className="lg-btn-inner">
                    {loading && <span className="lg-spinner" />}
                    {loading ? "Signing In..." : "Sign In"}
                  </span>
                </button>
              </form>

              <p className="lg-register">
                Don't have an account? <a href="/signup">Register</a>
              </p>
            </div>
          </div>

          {/* Decorative right panel */}
          <div className="lg-deco">
            <div className="lg-deco-inner">
              <div className="lg-deco-circle"><div className="lg-deco-dot" /></div>
              <div className="lg-deco-circle"><div className="lg-deco-dot" /></div>
              <div className="lg-deco-circle"><div className="lg-deco-dot" /></div>
              <span className="lg-deco-label">Member Access</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}