"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#f8f9fa",
      padding: "40px 16px 24px 16px"
    }}>
      <img src="/debisi_logo.png" alt="Debisi Logo" style={{ width: 80, marginBottom: 24 }} />
      <h1 style={{
        fontSize: 48,
        fontWeight: 700,
        color: "var(--primaryColor)",
        marginBottom: 12,
        textAlign: "center"
      }}>404</h1>
      <h2 style={{
        fontSize: 24,
        fontWeight: 600,
        color: "#333",
        marginBottom: 16,
        textAlign: "center"
      }}>Page Not Found</h2>
      <p style={{
        fontSize: 16,
        color: "#666",
        marginBottom: 32,
        textAlign: "center",
        maxWidth: 400
      }}>
        Sorry, the page you are looking for does not exist or has been moved.<br />
        Let&apos;s get you back to the homepage.
      </p>
      <Link href="/">
        <button style={{
          background: "linear-gradient(45deg, var(--secondaryColor), var(--primaryColor))",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          padding: "12px 32px",
          fontSize: 16,
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          transition: "background 0.2s"
        }}>
          Go Home
        </button>
      </Link>
    </div>
  );
} 