"use client";

import { SubmitEvent, useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e:SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Syne:wght@400;500;600;700&display=swap');

        .fp-root {
          min-height: 100vh;
          background: #ffffff;
          display: flex;
          font-family: 'Syne', sans-serif;
          color: #0a0a0a;
          overflow: hidden;
          position: relative;
        }

        /* Decorative background grid */
        .fp-root::before {
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

        /* Large watermark number */
        .fp-watermark {
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

        .fp-container {
          position: relative;
          z-index: 1;
          width: 100%;
          display: flex;
          align-items: stretch;
        }

        /* Left accent column */
        .fp-sidebar {
          width: 6px;
          background: #0a0a0a;
          flex-shrink: 0;
          position: relative;
        }

        .fp-sidebar::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 6px;
          height: 40%;
          background: #ffffff;
          border-top: 6px solid #0a0a0a;
        }

        /* Main content */
        .fp-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: clamp(40px, 8vw, 100px) clamp(32px, 8vw, 120px);
          max-width: 680px;
        }

        /* Top nav */
        .fp-nav {
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

        .fp-logo {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 28px;
          letter-spacing: 4px;
          color: #0a0a0a;
          text-decoration: none;
        }

        .fp-nav-step {
          font-size: 11px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #888;
        }

        /* Form area */
        .fp-content {
          padding-top: 80px;
        }

        .fp-eyebrow {
          font-size: 11px;
          letter-spacing: 5px;
          text-transform: uppercase;
          color: #888;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .fp-eyebrow::before {
          content: '';
          display: block;
          width: 40px;
          height: 1px;
          background: #888;
        }

        .fp-heading {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(52px, 8vw, 88px);
          line-height: 0.9;
          letter-spacing: -1px;
          margin-bottom: 20px;
          color: #0a0a0a;
        }

        .fp-heading span {
          display: block;
          color: #888;
        }

        .fp-description {
          font-size: 15px;
          color: #555;
          line-height: 1.7;
          max-width: 360px;
          margin-bottom: 52px;
          font-weight: 400;
        }

        /* Input group */
        .fp-field {
          margin-bottom: 24px;
          position: relative;
        }

        .fp-label {
          display: block;
          font-size: 11px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #0a0a0a;
          margin-bottom: 12px;
          font-weight: 600;
        }

        .fp-input-wrap {
          position: relative;
        }

        .fp-input {
          width: 100%;
          padding: 18px 20px;
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

        .fp-input:focus {
          border-color: #0a0a0a;
          box-shadow: 4px 4px 0px #0a0a0a;
        }

        .fp-input::placeholder {
          color: #bbb;
        }

        /* Submit button */
        .fp-btn {
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
          margin-top: 8px;
        }

        .fp-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: #ffffff;
          transform: translateX(-101%);
          transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
          mix-blend-mode: difference;
        }

        .fp-btn:hover::after {
          transform: translateX(0);
        }

        .fp-btn:hover {
          box-shadow: 5px 5px 0px rgba(0,0,0,0.15);
          transform: translate(-2px, -2px);
        }

        .fp-btn:active {
          transform: translate(0, 0);
          box-shadow: none;
        }

        .fp-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .fp-btn:disabled:hover {
          transform: none;
          box-shadow: none;
        }

        /* Back to login */
        .fp-back {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-top: 32px;
          font-size: 12px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #888;
          text-decoration: none;
          cursor: pointer;
          transition: color 0.2s;
          background: none;
          border: none;
          font-family: 'Syne', sans-serif;
        }

        .fp-back:hover {
          color: #0a0a0a;
        }

        .fp-back svg {
          transition: transform 0.2s;
        }

        .fp-back:hover svg {
          transform: translateX(-4px);
        }

        /* Success state */
        .fp-success {
          animation: fadeUp 0.5s ease forwards;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .fp-success-icon {
          width: 64px;
          height: 64px;
          border: 2px solid #0a0a0a;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 32px;
        }

        .fp-success-heading {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(44px, 7vw, 72px);
          line-height: 0.9;
          letter-spacing: -1px;
          margin-bottom: 20px;
          color: #0a0a0a;
        }

        .fp-success-text {
          font-size: 15px;
          color: #555;
          line-height: 1.7;
          max-width: 340px;
          margin-bottom: 48px;
        }

        .fp-success-email {
          font-weight: 600;
          color: #0a0a0a;
        }

        /* Right decorative panel */
        .fp-deco {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .fp-deco-inner {
          position: relative;
          width: 300px;
          height: 300px;
        }

        .fp-deco-circle {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(0,0,0,0.1);
        }

        .fp-deco-circle:nth-child(1) {
          inset: 0;
          animation: spin 20s linear infinite;
        }

        .fp-deco-circle:nth-child(2) {
          inset: 30px;
          animation: spin 14s linear infinite reverse;
        }

        .fp-deco-circle:nth-child(3) {
          inset: 70px;
          animation: spin 8s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        .fp-deco-dot {
          position: absolute;
          width: 6px;
          height: 6px;
          background: #0a0a0a;
          border-radius: 50%;
          top: -3px;
          left: 50%;
          transform: translateX(-50%);
        }

        .fp-deco-label {
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
          .fp-deco { display: none; }
          .fp-main { max-width: 100%; }
        }
      `}</style>

      <div className="fp-root">
        <div className="fp-watermark">TANTI</div>

        <div className="fp-sidebar" />

        <div className="fp-container">
          <div className="fp-main">
            {/* Nav */}
            <nav className="fp-nav">
              <a href="/" className="fp-logo">TANTI</a>
              <span className="fp-nav-step">Account Recovery</span>
            </nav>

            <div className="fp-content">
              {!submitted ? (
                <>
                  <p className="fp-eyebrow">Step 01 of 02</p>
                  <h1 className="fp-heading">
                    FORGOT<br />
                    <span>YOUR</span>
                    PASS?
                  </h1>
                  <p className="fp-description">
                    No stress. Drop your email below and we'll send a reset link straight to your inbox.
                  </p>

                  <form onSubmit={handleSubmit}>
                    <div className="fp-field">
                      <label htmlFor="email" className="fp-label">Email Address</label>
                      <div className="fp-input-wrap">
                        <input
                          id="email"
                          type="email"
                          className="fp-input"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onFocus={() => setFocused(true)}
                          onBlur={() => setFocused(false)}
                          required
                          autoComplete="email"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="fp-btn"
                      disabled={!email}
                    >
                      Send Reset Link
                    </button>
                  </form>

                  <button className="fp-back" onClick={() => window.history.back()}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Back to Sign In
                  </button>
                </>
              ) : (
                <div className="fp-success">
                  <div className="fp-success-icon">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                      <path d="M6 14L11 19L22 9" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h1 className="fp-success-heading">
                    CHECK<br />YOUR<br />INBOX
                  </h1>
                  <p className="fp-success-text">
                    We've sent a reset link to{" "}
                    <span className="fp-success-email">{email}</span>.
                    It expires in 15 minutes.
                  </p>
                  <button className="fp-back" onClick={() => { setSubmitted(false); setEmail(""); }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Try a different email
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Decorative right panel */}
          <div className="fp-deco">
            <div className="fp-deco-inner">
              <div className="fp-deco-circle">
                <div className="fp-deco-dot" />
              </div>
              <div className="fp-deco-circle">
                <div className="fp-deco-dot" />
              </div>
              <div className="fp-deco-circle">
                <div className="fp-deco-dot" />
              </div>
              <span className="fp-deco-label">Account Recovery</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}