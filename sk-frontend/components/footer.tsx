"use client";

import { Instagram, Twitter, Facebook } from "lucide-react";

export default function Footer() {
  return (
    <footer
      style={{
        background: "#fafafa",
        borderTop: "1px solid #e5e5e5",
      }}
    >
      <div
        style={{
          maxWidth: "1120px",
          margin: "0 auto",
          padding: "64px 24px",
        }}
      >
        {/* TOP SECTION */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
            gap: "48px",
          }}
        >
          {/* Brand */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <h2
              style={{
                fontSize: 24,
                fontWeight: 600,
                letterSpacing: "-0.02em",
              }}
            >
              DRAPE.
            </h2>

            <p
              style={{
                fontSize: 14,
                color: "#737373",
                lineHeight: 1.6,
                maxWidth: 260,
              }}
            >
              Contemporary essentials designed for everyday movement.
            </p>

            <div style={{ display: "flex", gap: 16 }}>
              <Instagram size={18} />
              <Twitter size={18} />
              <Facebook size={18} />
            </div>
          </div>

          {/* SHOP */}
          <div>
            <p
              style={{
                fontSize: 12,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                marginBottom: 20,
                fontWeight: 600,
              }}
            >
              Shop
            </p>

            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {["Men", "Women", "New Arrivals", "Sale"].map((item) => (
                <li key={item} style={{ marginBottom: 12, color: "#737373" }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* HELP */}
          <div>
            <p
              style={{
                fontSize: 12,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                marginBottom: 20,
                fontWeight: 600,
              }}
            >
              Help
            </p>

            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {["Shipping", "Returns", "Contact"].map((item) => (
                <li key={item} style={{ marginBottom: 12, color: "#737373" }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* COMPANY */}
          <div>
            <p
              style={{
                fontSize: 12,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                marginBottom: 20,
                fontWeight: 600,
              }}
            >
              Company
            </p>

            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {["About", "Careers", "Privacy Policy"].map((item) => (
                <li key={item} style={{ marginBottom: 12, color: "#737373" }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div
          style={{
            marginTop: 64,
            paddingTop: 24,
            borderTop: "1px solid #e5e5e5",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            fontSize: 12,
            color: "#a3a3a3",
          }}
        >
          <p>© {new Date().getFullYear()} DRAPE. All rights reserved.</p>

          <div style={{ display: "flex", gap: 24 }}>
            <span>Terms</span>
            <span>Privacy</span>
            <span>Cookies</span>
          </div>
        </div>
      </div>
    </footer>
  );
}