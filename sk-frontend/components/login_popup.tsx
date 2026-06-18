"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { FiMail, FiLock, FiEye, FiEyeOff, FiX, FiArrowRight } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import { GoogleLogin, GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import { useUserContext } from "@/contextProvider";
import { useAuthentication } from "@/hooks/useAuthentication";
import { toast } from "react-toastify";
import { Loader } from "lucide-react";

type FocusedField = "email" | "password" | null;

// ── Hook: detect mobile ────────────────────────────────────────────────────────
function useIsMobile(breakpoint = 600) {
  const [isMobile, setIsMobile] = useState(false);


  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [breakpoint]);
  return isMobile;
}

export default function LoginPopout() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<FocusedField>(null);
  const [btnHover, setBtnHover] = useState(false);
  const [googleHover, setGoogleHover] = useState(false);
    const {setUser,loginPopup:isOpen,setLoginPopup:setIsOpen}=useUserContext()
  const {registerWithGoogle,loginWithEmail} = useAuthentication()
  const isMobile = useIsMobile();
  useEffect(() => {
    const timer = setTimeout(() => setIsOpen(true), 600);
    return () => clearTimeout(timer);
  }, []);

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
               profilePicture:v.data.data.profilePicture,
               cartCount:v.data.data.cartCount,
               isLoading:false
             })

           },onError:(e:any)=>{
             if(e.response){
               toast.error(e.response.data.message)
             }
           },})
         },
         onError: () => console.log("Login Failed"),
       });
  // Lock body scroll without breaking pointer events
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
        loginWithEmail.mutate({email,password},{onSuccess:(v)=>{
          toast('login successfully')
            localStorage.setItem('access_token',v.data.access_token)
            setUser({
              isAuthenticated:true,
              role:v.data.data.role,
              email:v.data.data.email,
              userName:v.data.data.userName,
              profilePicture:v.data.data.profilePicture
            ,cartCount:v.data.data.cartCount,
            isLoading:false
            })
            setLoading(false)
                setIsOpen(false);
          },onError:(e:any)=>{
            setLoading(false)
            if(e.response){
              toast.error(e.response.data.message)
            }
          }})
  };

  // ── Variants ────────────────────────────────────────────────────────────────
  const overlayVariants: Variants = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.22 } },
    exit:    { opacity: 0, transition: { duration: 0.18 } },
  };

  // Desktop: spring up from centre. Mobile: slide up from bottom edge.
  const modalVariants: Variants = isMobile
    ? {
        hidden:  { y: "100%", opacity: 1 },
        visible: { y: 0,      opacity: 1, transition: { type: "spring", damping: 32, stiffness: 340 } },
        exit:    { y: "100%", opacity: 1, transition: { duration: 0.22, ease: "easeIn" } },
      }
    : {
        hidden:  { opacity: 0, y: 44, scale: 0.97 },
        visible: { opacity: 1, y: 0,  scale: 1,    transition: { type: "spring", damping: 28, stiffness: 320 } },
        exit:    { opacity: 0, y: 28, scale: 0.96, transition: { duration: 0.18 } },
      };

  const stagger: Variants = {
    hidden:  {},
    visible: { transition: { staggerChildren: 0.055, delayChildren: 0.04 } },
  };

  const child: Variants = {
    hidden:  { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0,  transition: { type: "spring", damping: 22, stiffness: 280 } },
  };

  // ── Styles (responsive) ──────────────────────────────────────────────────────
  const fieldWrap = (focused: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    border: `1.5px solid ${focused ? "#0a0a0a" : "#e0e0e0"}`,
    boxShadow: focused ? "4px 4px 0px #0a0a0a" : "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    background: "#fff",
    borderRadius: isMobile ? 8 : 0,
  });

  const iconWrap: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    padding: "0 14px",
    color: "#aaa",
    flexShrink: 0,
  };

  const inputStyle: React.CSSProperties = {
    flex: 1,
    border: "none",
    outline: "none",
    padding: isMobile ? "15px 12px" : "14px 12px",
    fontFamily: "'Syne', sans-serif",
    // ↓ CRITICAL: 16px minimum prevents iOS auto-zoom on input focus
    fontSize: 16,
    color: "#0a0a0a",
    background: "transparent",
    minWidth: 0,
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 10,
    letterSpacing: "0.22em",
    textTransform: "uppercase" as const,
    color: "#0a0a0a",
    fontWeight: 600,
    marginBottom: 8,
    fontFamily: "'Syne', sans-serif",
  };

  // ── Modal positioning ────────────────────────────────────────────────────────
  // Desktop: absolutely centred via transform.
  // Mobile: fixed bottom sheet, full width, rounded top corners.
  const modalPositionStyle: React.CSSProperties = isMobile
    ? {
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        width: "100%",
        maxHeight: "92dvh",       // dynamic viewport height — handles browser chrome
        overflowY: "auto",
        borderRadius: "20px 20px 0 0",
        zIndex: 51,
        background: "#ffffff",
        boxShadow: "0 -16px 60px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.05)",
        // Safe-area padding for notched phones (iPhone X+)
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }
    : {
        position: "fixed",
        top: "50%",
        left: "50%",
        translate:'-50% -50%',
        zIndex: 51,
        background: "#ffffff",
        width: "min(460px, 92vw)",
        boxShadow: "0 40px 100px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.06)",
        overflow: "hidden",
      };

  const canSubmit = !!email && !!password && !loading;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Syne:wght@400;500;600;700&display=swap');

        .lp-input::placeholder { color: #bbb; }

        .lp-submit-btn {
          position: relative;
          overflow: hidden;
          -webkit-tap-highlight-color: transparent;
        }
        .lp-submit-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: #fff;
          transform: translateX(-101%);
          transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
          mix-blend-mode: difference;
        }
        .lp-submit-btn:not(:disabled):hover::after {
          transform: translateX(0);
        }

        /* Smooth scroll inside sheet on iOS */
        .lp-sheet-scroll {
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
        }

        @keyframes lp-spin { to { transform: rotate(360deg); } }

        /* Remove tap highlight on mobile buttons */
        button { -webkit-tap-highlight-color: transparent; }
      `}</style>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* ── Backdrop ── */}
            <motion.div
              key="backdrop"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setIsOpen(false)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.38)",
                backdropFilter: "blur(3px)",
                WebkitBackdropFilter: "blur(3px)",
                zIndex: 50,
              }}
            />

            {/* ── Modal / Sheet ── */}
            <motion.div
              key="modal"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="lp-sheet-scroll"
              style={modalPositionStyle}
            >
              {/* Mobile: drag handle pill */}
              {isMobile && (
                <div style={{ display: "flex", justifyContent: "center", paddingTop: 12, paddingBottom: 4 }}>
                  <div style={{ width: 36, height: 4, borderRadius: 99, background: "#e0e0e0" }} />
                </div>
              )}

              {/* Desktop only: left accent bar */}
              {!isMobile && (
                <div style={{
                  position: "absolute",
                  top: 0, left: 0, bottom: 0,
                  width: 5,
                  background: "#0a0a0a",
                  zIndex: 2,
                }} />
              )}

              {/* Background grid texture */}
              <div style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `
                  linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)
                `,
                backgroundSize: "36px 36px",
                pointerEvents: "none",
                zIndex: 0,
              }} />

              {/* Watermark */}
              <div style={{
                position: "absolute",
                bottom: -20,
                right: -4,
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: isMobile ? 80 : 110,
                lineHeight: 1,
                color: "rgba(0,0,0,0.04)",
                pointerEvents: "none",
                userSelect: "none",
                zIndex: 0,
                letterSpacing: -2,
              }}>
                TANTI
              </div>

              {/* ── Content ── */}
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="visible"
                style={{
                  padding: isMobile
                    ? "16px 24px 32px 24px"
                    : "40px 40px 40px 52px",
                  position: "relative",
                  zIndex: 1,
                  fontFamily: "'Syne', sans-serif",
                }}
              >
                {/* Close button */}
                <motion.button
                  variants={child}
                  onClick={() => setIsOpen(false)}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.88 }}
                  aria-label="Close"
                  style={{
                    position: "absolute",
                    top: isMobile ? 14 : 20,
                    right: isMobile ? 16 : 20,
                    background: "none",
                    border: "1.5px solid #e0e0e0",
                    cursor: "pointer",
                    padding: 7,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#888",
                    borderRadius: 4,
                    transition: "border-color 0.2s, color 0.2s",
                    // Larger touch target on mobile
                    minWidth: isMobile ? 40 : "auto",
                    minHeight: isMobile ? 40 : "auto",
                  }}
                >
                  <FiX size={15} />
                </motion.button>

                {/* Header */}
                <motion.div variants={child} style={{ marginBottom: isMobile ? 20 : 28 }}>
                  <p style={{
                    fontSize: 10,
                    letterSpacing: "0.4em",
                    textTransform: "uppercase",
                    color: "#888",
                    marginBottom: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}>
                    <span style={{ display: "inline-block", width: 24, height: 1, background: "#888" }} />
                    Welcome Back
                  </p>
                  <h2 style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    // Fluid: 38px on tiny phones → 54px on desktop
                    fontSize: "clamp(36px, 10vw, 54px)",
                    fontWeight: 400,
                    lineHeight: 0.9,
                    letterSpacing: -0.5,
                    color: "#0a0a0a",
                  }}>
                    SIGN<br />
                    <span style={{ color: "#888" }}>INTO</span><br />
                    TANTI
                  </h2>
                </motion.div>

                {/* Google */}
                <motion.button
                  variants={child}
                  type="button"
                  onClick={()=>handleGoogle()}
                  onMouseEnter={() => setGoogleHover(true)}
                  onMouseLeave={() => setGoogleHover(false)}
                  style={{
                    width: "100%",
                    padding: isMobile ? "14px 16px" : "13px 16px",
                    background: "#fff",
                    border: `1.5px solid ${googleHover ? "#0a0a0a" : "#e0e0e0"}`,
                    borderRadius: isMobile ? 8 : 0,
                    fontFamily: "'Syne', sans-serif",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#0a0a0a",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    boxShadow: googleHover && !isMobile ? "4px 4px 0px #0a0a0a" : "none",
                    transform: googleHover && !isMobile ? "translate(-2px,-2px)" : "translate(0,0)",
                    transition: "all 0.18s",
                    marginBottom: isMobile ? 16 : 20,
                  }}
                >
                  <FcGoogle size={18} />
                     {registerWithGoogle.isPending?<div className="animate-pulse flex">Signing with google <Loader className="animate-spin"/></div>:'Continue with Google'
                     }
                </motion.button>



                {/* Divider */}
                <motion.div
                  variants={child}
                  style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: isMobile ? 16 : 20 }}
                >
                  <div style={{ flex: 1, height: 1, background: "#e0e0e0" }} />
                  <span style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "#aaa" }}>or</span>
                  <div style={{ flex: 1, height: 1, background: "#e0e0e0" }} />
                </motion.div>

                {/* Form */}
                <form onSubmit={handleSubmit} noValidate>

                  {/* Email */}
                  <motion.div variants={child} style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>Email Address</label>
                    <div style={fieldWrap(focusedField === "email")}>
                      <span style={iconWrap}><FiMail size={15} /></span>
                      <input
                        className="lp-input"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocusedField("email")}
                        onBlur={() => setFocusedField(null)}
                        placeholder="you@example.com"
                        style={inputStyle}
                      />
                    </div>
                  </motion.div>

                  {/* Password */}
                  <motion.div variants={child} style={{ marginBottom: 10 }}>
                    <label style={labelStyle}>Password</label>
                    <div style={fieldWrap(focusedField === "password")}>
                      <span style={iconWrap}><FiLock size={15} /></span>
                      <input
                        className="lp-input"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocusedField("password")}
                        onBlur={() => setFocusedField(null)}
                        placeholder="••••••••"
                        style={inputStyle}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        style={{
                          background: "none",
                          border: "none",
                          padding: "0 14px",
                          cursor: "pointer",
                          color: "#aaa",
                          display: "flex",
                          alignItems: "center",
                          flexShrink: 0,
                          // Larger touch target
                          minWidth: 44,
                          minHeight: 44,
                          justifyContent: "center",
                        }}
                      >
                        {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                      </button>
                    </div>
                  </motion.div>

                  {/* Forgot */}
                  <motion.div variants={child} style={{ textAlign: "right", marginBottom: isMobile ? 20 : 24 }}>
                    <Link
                      href="/forgot-password"
                      style={{
                        fontSize: 11,
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        color: "#888",
                        textDecoration: "none",
                        fontFamily: "'Syne', sans-serif",
                        // Bigger tap target on mobile
                        display: "inline-block",
                        padding: isMobile ? "6px 0" : "0",
                      }}
                    >
                      Forgot password?
                    </Link>
                  </motion.div>

                  {/* Submit */}
                  <motion.button
                    variants={child}
                    type="submit"
                    disabled={!canSubmit}
                    className="lp-submit-btn"
                    onMouseEnter={() => setBtnHover(true)}
                    onMouseLeave={() => setBtnHover(false)}
                    whileTap={{ scale: canSubmit ? 0.98 : 1 }}
                    style={{
                      width: "100%",
                      padding: isMobile ? "17px 16px" : "16px",
                      background: "#0a0a0a",
                      color: "#fff",
                      border: "none",
                      borderRadius: isMobile ? 10 : 0,
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: 17,
                      letterSpacing: "0.2em",
                      cursor: canSubmit ? "pointer" : "not-allowed",
                      opacity: !email || !password ? 0.4 : 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                      boxShadow: btnHover && canSubmit && !isMobile ? "5px 5px 0px rgba(0,0,0,0.15)" : "none",
                      transform: btnHover && canSubmit && !isMobile ? "translate(-2px,-2px)" : "translate(0,0)",
                      transition: "box-shadow 0.15s, transform 0.15s, opacity 0.2s",
                    }}
                  >
                    {loading ? (
                      <>
                        <span style={{
                          width: 14, height: 14,
                          border: "2px solid rgba(255,255,255,0.3)",
                          borderTopColor: "#fff",
                          borderRadius: "50%",
                          animation: "lp-spin 0.7s linear infinite",
                          display: "inline-block",
                          flexShrink: 0,
                        }} />
                        Signing In...
                      </>
                    ) : (
                      <>Sign In <FiArrowRight size={14} /></>
                    )}
                  </motion.button>
                </form>

                {/* Register link */}
                <motion.p
                  variants={child}
                  style={{
                    marginTop: isMobile ? 18 : 20,
                    fontSize: 12,
                    color: "#888",
                    textAlign: "center",
                    fontFamily: "'Syne', sans-serif",
                  }}
                >
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/signup"
                    style={{
                      color: "#0a0a0a",
                      fontWeight: 700,
                      textDecoration: "none",
                      borderBottom: "1px solid #0a0a0a",
                      paddingBottom: 1,
                    }}
                  >
                    Register
                  </Link>
                </motion.p>

              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}