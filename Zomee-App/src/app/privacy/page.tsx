"use client";

import React from 'react';

export default function PrivacyPolicy() {
  return (
    <main style={{ minHeight: "100vh", position: "relative", overflowX: "clip", display: "flex", justifyContent: "center", background: "var(--bg-gradient)" }}>
      
      {/* Background styling */}
      <div className="bg-orb" style={{ position: "fixed", top: "-10%", left: "-10%", width: "50vw", height: "50vw", background: "radial-gradient(circle, rgba(34, 211, 238, 0.1) 0%, rgba(0,0,0,0) 70%)", borderRadius: "50%", zIndex: 0, filter: "blur(60px)", animation: "float 10s ease-in-out infinite" }}></div>
      
      <div style={{ width: "100%", maxWidth: "1200px", display: "flex", gap: "48px", padding: "64px 24px", position: "relative", zIndex: 10 }}>
        
        {/* Sidebar Navigation */}
        <aside style={{ width: "250px", flexShrink: 0, display: "none" }} className="desktop-sidebar">
          <div style={{ position: "sticky", top: "64px", background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", padding: "24px", borderRadius: "16px" }}>
            <h3 style={{ color: "var(--primary-cyan)", marginBottom: "16px", fontWeight: "700" }}>Contents</h3>
            <nav style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <a href="#intro" className="nav-link">1. Introduction</a>
              <a href="#data" className="nav-link">2. Data We Collect</a>
              <a href="#usage" className="nav-link">3. How We Use Data</a>
              <a href="#security" className="nav-link">4. Data Security</a>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <div className="glass-panel" style={{ flex: 1, padding: "48px", borderTop: "2px solid rgba(255,255,255,0.1)" }}>
          <h1 style={{ fontSize: "3rem", fontWeight: "800", marginBottom: "8px", background: "linear-gradient(135deg, #22d3ee 0%, #fff 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Privacy Policy</h1>
          <p style={{ color: "var(--text-secondary)", marginBottom: "40px", fontSize: "1.1rem" }}>Last updated: July 2026</p>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "32px", lineHeight: "1.7", fontSize: "1.05rem" }}>
            <section id="intro">
              <h2>1. Introduction</h2>
              <p>Welcome to Zomee. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and use our highly secure video conferencing services.</p>
            </section>

            <section id="data">
              <h2>2. Data We Collect</h2>
              <p>When you use Zomee, we prioritize minimizing the data footprint. We may collect:</p>
              <ul>
                <li><strong>Identity Data:</strong> Name or display name provided upon joining a meeting.</li>
                <li><strong>Technical Data:</strong> IP address, browser type and version, time zone setting, and operating system required to establish secure WebRTC connections.</li>
                <li><strong>Usage Data:</strong> Analytical information about platform stability. (Note: We do <strong>NOT</strong> record video or audio unless explicitly initiated by the host).</li>
              </ul>
            </section>

            <section id="usage">
              <h2>3. How We Use Your Data</h2>
              <p>We strictly use your data for the operational functionality of the platform:</p>
              <ul>
                <li>To provide and maintain the Zomee service (facilitating peer-to-peer and server-relayed LiveKit connections).</li>
                <li>To notify you about critical changes to our service.</li>
                <li>To provide customer support and improve the platform's stability.</li>
              </ul>
            </section>

            <section id="security">
              <h2>4. Data Security</h2>
              <p>Security is our core value. All video and audio streams are End-to-End Encrypted in transit. We have put in place robust, industry-leading security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way.</p>
            </section>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        @media (min-width: 768px) {
          .desktop-sidebar {
            display: block !important;
          }
        }
        .nav-link {
          color: var(--text-secondary);
          text-decoration: none;
          transition: all 0.2s;
          font-weight: 500;
        }
        .nav-link:hover {
          color: white;
          padding-left: 8px;
          border-left: 2px solid var(--primary-cyan);
        }
        section {
          background: rgba(0,0,0,0.25);
          padding: 32px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.05);
          transition: all 0.3s ease;
          scroll-margin-top: 100px;
        }
        section:hover {
          border-color: rgba(34, 211, 238, 0.4);
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          background: rgba(0,0,0,0.4);
        }
        section h2 {
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 16px;
          color: white;
        }
        section p, section ul {
          color: #cbd5e1;
        }
        section ul {
          padding-left: 24px;
          margin-top: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
      `}</style>
    </main>
  );
}
