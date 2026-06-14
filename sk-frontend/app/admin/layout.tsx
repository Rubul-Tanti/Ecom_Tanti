"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { MdCategory, MdOutlineLocalOffer } from "react-icons/md";
import { BiSolidOffer } from "react-icons/bi";
import Link from "next/link";

// ─── Types ─────────────────────────────────────────────────────────────────
interface AdminLayoutProps {
  children: React.ReactNode;
}

// ─── Nav config ─────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <rect x="1" y="1" width="5" height="5" stroke="currentColor" strokeWidth="1.3"/>
        <rect x="9" y="1" width="5" height="5" stroke="currentColor" strokeWidth="1.3"/>
        <rect x="1" y="9" width="5" height="5" stroke="currentColor" strokeWidth="1.3"/>
        <rect x="9" y="9" width="5" height="5" stroke="currentColor" strokeWidth="1.3"/>
      </svg>
    ),
  },{
    label:"Events",
    href:'/admin/events',
    icon:<BiSolidOffer />

  },
  {
    label: "Products",
    href: "/admin/products",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <rect x="1" y="4" width="13" height="9" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M5 4V3a2 2 0 014 0v1" stroke="currentColor" strokeWidth="1.3"/>
      </svg>
    ),
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M1 1h2l2 8h7l2-5H5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="7" cy="13" r="1" fill="currentColor"/>
        <circle cx="12" cy="13" r="1" fill="currentColor"/>
      </svg>
    ),
  },
  {
    label: "Customers",
    href: "/admin/customers",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <circle cx="7.5" cy="5" r="3" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M1 14c0-3 3-5 6.5-5s6.5 2 6.5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: "Promo Code",
    href: "/admin/promocode",
    icon: (
      <MdOutlineLocalOffer />
    ),
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M1 13l4-5 3 3 4-7 2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <circle cx="7.5" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M7.5 1v1.5M7.5 12.5V14M1 7.5h1.5M12.5 7.5H14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: "Categories",
    href: "/admin/category",
    icon: <MdCategory />,
  },
];

// ─── Layout ──────────────────────────────────────────────────────────────────
export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  // Detect mobile
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const handler = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
      if (!e.matches) setMobileOpen(false);
    };
    setIsMobile(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const activeItem =
    NAV_ITEMS.slice()
      .reverse()
      .find(item =>
        item.href === "/admin"
          ? pathname === "/admin"
          : pathname.startsWith(item.href)
      ) ?? NAV_ITEMS[0];

  // On mobile, sidebar is always "open" (full width) when drawer is visible
  const effectiveSidebarOpen = isMobile ? true : sidebarOpen;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Syne:wght@400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .adm-root {
          min-height: 100vh;
          display: flex;
          font-family: 'Syne', sans-serif;
          background: #f5f5f3;
          color: #0a0a0a;
        }

        /* ── Overlay (mobile only) ── */
        .adm-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.55);
          z-index: 49;
          opacity: 0;
          transition: opacity 0.25s;
        }
        .adm-overlay.visible {
          display: block;
          opacity: 1;
        }

        /* ── Sidebar ── */
        .adm-sidebar {
          width: ${effectiveSidebarOpen ? "240px" : "64px"};
          background: #0a0a0a;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          transition: width 0.25s cubic-bezier(0.4,0,0.2,1), transform 0.25s cubic-bezier(0.4,0,0.2,1);
          position: sticky;
          top: 0;
          height: 100vh;
          overflow: hidden;
          z-index: 50;
        }

        /* Mobile: sidebar becomes fixed slide-over */
        @media (max-width: 768px) {
          .adm-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            height: 100vh;
            width: 260px !important;
            transform: translateX(-100%);
            box-shadow: 4px 0 32px rgba(0,0,0,0.25);
          }
          .adm-sidebar.mobile-open {
            transform: translateX(0);
          }
        }

        .adm-sidebar-logo {
          padding: ${effectiveSidebarOpen ? "28px 24px 24px" : "20px 0"};
          border-bottom: 1px solid rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          justify-content: ${effectiveSidebarOpen ? "space-between" : "center"};
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .adm-sidebar-logo {
            padding: 24px 24px 20px !important;
            justify-content: space-between !important;
          }
        }

        .adm-logo-text {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 28px;
          letter-spacing: 6px;
          color: #fff;
          white-space: nowrap;
          opacity: ${effectiveSidebarOpen ? 1 : 0};
          transition: opacity 0.2s;
        }

        @media (max-width: 768px) {
          .adm-logo-text { opacity: 1 !important; }
        }

        .adm-toggle {
          width: 28px; height: 28px;
          background: rgba(255,255,255,0.08);
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: #fff; flex-shrink: 0;
          transition: background 0.15s;
        }
        .adm-toggle:hover { background: rgba(255,255,255,0.15); }

        /* Hide desktop toggle on mobile, show close button instead */
        @media (max-width: 768px) {
          .adm-toggle { display: none; }
          .adm-mobile-close {
            width: 28px; height: 28px;
            background: rgba(255,255,255,0.08);
            border: none; cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            color: #fff; flex-shrink: 0;
          }
        }
        .adm-mobile-close { display: none; }

        .adm-nav { flex: 1; padding: 20px 0; overflow-y: auto; }

        .adm-nav-label {
          font-size: 9px;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.25);
          padding: ${effectiveSidebarOpen ? "0 24px" : "0"};
          margin-bottom: 8px;
          text-align: ${effectiveSidebarOpen ? "left" : "center"};
          white-space: nowrap;
          overflow: hidden;
        }

        @media (max-width: 768px) {
          .adm-nav-label {
            padding: 0 24px !important;
            text-align: left !important;
          }
        }

        .adm-nav-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: ${effectiveSidebarOpen ? "11px 24px" : "11px 0"};
          justify-content: ${effectiveSidebarOpen ? "flex-start" : "center"};
          cursor: pointer;
          color: rgba(255,255,255,0.45);
          font-size: 12px;
          letter-spacing: 2px;
          text-transform: uppercase;
          font-weight: 600;
          white-space: nowrap;
          transition: color 0.15s, background 0.15s;
          position: relative;
          background: none;
          width: 100%;
          font-family: 'Syne', sans-serif;
          text-decoration: none;
          /* Larger tap target on mobile */
          min-height: 48px;
        }

        @media (max-width: 768px) {
          .adm-nav-item {
            padding: 14px 24px !important;
            justify-content: flex-start !important;
            font-size: 13px;
          }
        }

        .adm-nav-item:hover { color: #fff; background: rgba(255,255,255,0.05); }

        .adm-nav-item.active {
          color: #fff;
          background: rgba(255,255,255,0.08);
        }

        .adm-nav-item.active::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
          background: #fff;
        }

        .adm-nav-text {
          opacity: ${effectiveSidebarOpen ? 1 : 0};
          transition: opacity 0.15s;
          overflow: hidden;
        }

        @media (max-width: 768px) {
          .adm-nav-text { opacity: 1 !important; }
        }

        .adm-sidebar-footer {
          padding: ${effectiveSidebarOpen ? "20px 24px" : "20px 0"};
          border-top: 1px solid rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          justify-content: ${effectiveSidebarOpen ? "flex-start" : "center"};
          gap: 12px;
        }

        @media (max-width: 768px) {
          .adm-sidebar-footer {
            padding: 20px 24px !important;
            justify-content: flex-start !important;
          }
        }

        .adm-avatar {
          width: 34px; height: 34px;
          background: #fff;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 14px;
          color: #0a0a0a;
          flex-shrink: 0;
        }

        .adm-user-info {
          opacity: ${effectiveSidebarOpen ? 1 : 0};
          transition: opacity 0.15s;
          overflow: hidden;
        }

        @media (max-width: 768px) {
          .adm-user-info { opacity: 1 !important; }
        }

        .adm-user-name { font-size: 12px; font-weight: 600; color: #fff; white-space: nowrap; }
        .adm-user-role { font-size: 10px; letter-spacing: 2px; color: rgba(255,255,255,0.4); text-transform: uppercase; }

        /* ── Main ── */
        .adm-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }

        /* Top bar */
        .adm-topbar {
          background: #fff;
          border-bottom: 1px solid #e8e8e8;
          padding: 0 32px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 40;
        }

        @media (max-width: 768px) {
          .adm-topbar { padding: 0 16px; }
        }

        .adm-topbar-left { display: flex; align-items: center; gap: 12px; }
        .adm-page-title  { font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: 3px; color: #0a0a0a; }
        .adm-breadcrumb  { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #bbb; }

        /* Hide breadcrumb on small mobile */
        @media (max-width: 480px) {
          .adm-breadcrumb { display: none; }
        }

        .adm-topbar-right { display: flex; align-items: center; gap: 8px; }

        /* Hamburger — only visible on mobile */
        .adm-hamburger {
          display: none;
          width: 36px; height: 36px;
          border: 1.5px solid #e0e0e0;
          background: none; cursor: pointer;
          align-items: center; justify-content: center;
          color: #555; transition: border-color 0.15s, color 0.15s;
          margin-right: 4px;
        }
        .adm-hamburger:hover { border-color: #0a0a0a; color: #0a0a0a; }

        @media (max-width: 768px) {
          .adm-hamburger { display: flex; }
        }

        .adm-icon-btn {
          width: 36px; height: 36px;
          border: 1.5px solid #e0e0e0;
          background: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: #555; transition: border-color 0.15s, color 0.15s;
        }
        .adm-icon-btn:hover { border-color: #0a0a0a; color: #0a0a0a; }

        /* Content slot */
        .adm-content-slot { flex: 1; display: flex; flex-direction: column; min-width: 0; }
      `}</style>

      <div className="adm-root">

        {/* ── Mobile overlay ── */}
        <div
          className={`adm-overlay${mobileOpen ? " visible" : ""}`}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />

        {/* ── Sidebar ── */}
        <aside className={`adm-sidebar${mobileOpen ? " mobile-open" : ""}`}>
          <div className="adm-sidebar-logo">
            <Link href={'/'} className="adm-logo-text">TANTI</Link>

            {/* Desktop collapse toggle */}
            <button
              className="adm-toggle"
              onClick={() => setSidebarOpen(o => !o)}
              aria-label="Toggle sidebar"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d={sidebarOpen ? "M9 2L4 7L9 12" : "M5 2L10 7L5 12"}
                  stroke="currentColor" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* Mobile close button */}
            <button
              className="adm-mobile-close"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          <nav className="adm-nav">
            <p className="adm-nav-label">{effectiveSidebarOpen ? "Navigation" : "·"}</p>

            {NAV_ITEMS.map(item => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`adm-nav-item${isActive ? " active" : ""}`}
                >
                  {item.icon}
                  <span className="adm-nav-text">{item.label}</span>
                </a>
              );
            })}
          </nav>

          <div className="adm-sidebar-footer">
            <div className="adm-avatar">AD</div>
            <div className="adm-user-info">
              <p className="adm-user-name">Admin</p>
              <p className="adm-user-role">Super Admin</p>
            </div>
          </div>
        </aside>

        {/* ── Main Area ── */}
        <main className="adm-main">

          {/* Top bar */}
          <div className="adm-topbar">
            <div className="adm-topbar-left">
              {/* Hamburger — mobile only */}
              <button
                className="adm-hamburger"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>

              <span className="adm-breadcrumb">TANTI /</span>
              <span className="adm-page-title">{activeItem.label.toUpperCase()}</span>
            </div>

            <div className="adm-topbar-right">
              <button className="adm-icon-btn" aria-label="Search">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              </button>
              <button className="adm-icon-btn" aria-label="Notifications">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path d="M7.5 1a4.5 4.5 0 00-4.5 4.5v2.5L1 10h13l-2-2V5.5A4.5 4.5 0 007.5 1z" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M6 11.5a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.3"/>
                </svg>
              </button>
            </div>
          </div>

          {/* ── Page content renders here ── */}
          <div className="adm-content-slot">
            {children}
          </div>

        </main>
      </div>
    </>
  );
}