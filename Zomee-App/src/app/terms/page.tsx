"use client";

import React from 'react';

export default function TermsOfUse() {
  return (
    <main style={{ minHeight: "100vh", position: "relative", overflowX: "clip", display: "flex", justifyContent: "center", background: "var(--bg-gradient)" }}>
      
      {/* Background styling */}
      <div className="bg-orb" style={{ position: "fixed", top: "-10%", right: "-10%", width: "50vw", height: "50vw", background: "radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, rgba(0,0,0,0) 70%)", borderRadius: "50%", zIndex: 0, filter: "blur(60px)", animation: "float 14s ease-in-out infinite reverse" }}></div>
      
      <div style={{ width: "100%", maxWidth: "1200px", display: "flex", gap: "48px", padding: "64px 24px", position: "relative", zIndex: 10 }}>
        
        {/* Sidebar Navigation */}
        <aside style={{ width: "250px", flexShrink: 0, display: "none" }} className="desktop-sidebar">
          <div style={{ position: "sticky", top: "64px", background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", padding: "24px", borderRadius: "16px" }}>
            <h3 style={{ color: "var(--primary-cyan)", marginBottom: "16px", fontWeight: "700" }}>Contents</h3>
            <nav style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <a href="#acceptance" className="nav-link">1. Acceptance of Terms</a>
              <a href="#rules" className="nav-link">2. User Conduct</a>
              <a href="#liability" className="nav-link">3. Limitation of Liability</a>
              <a href="#termination" className="nav-link">4. Account Termination</a>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <div className="glass-panel" style={{ flex: 1, padding: "48px", borderTop: "2px solid rgba(255,255,255,0.1)" }}>
          <h1 style={{ fontSize: "3rem", fontWeight: "800", marginBottom: "8px", background: "linear-gradient(135deg, #a5b4fc 0%, #fff 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Terms of Use</h1>
          <p style={{ color: "var(--text-secondary)", marginBottom: "40px", fontSize: "1.1rem" }}>Last updated: July 2026</p>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "32px", lineHeight: "1.7", fontSize: "1.05rem" }}>
            <section id="acceptance">
              <h2>1. Acceptance of Terms</h2>
              <p>By accessing or using the Zomee platform, you agree to be bound by these Terms of Use and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.</p>
            </section>

            <section id="rules">
              <h2>2. User Conduct & Acceptable Use</h2>
              <p>You agree not to use the Service to:</p>
              <ul>
                <li>Transmit any content that is unlawful, harmful, threatening, or otherwise objectionable.</li>
                <li>Impersonate any person or entity, including, but not limited to, a Zomee official or Host.</li>
                <li>Interfere with or disrupt the Service or servers connected to the Service (e.g., automated scraping, DDoS attacks).</li>
                <li>Attempt to bypass or manipulate the Room Verification or Host-Command security protocols.</li>
              </ul>
            </section>

            <section id="liability">
              <h2>3. Limitation of Liability</h2>
              <p>In no event shall Zomee, its developers, or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the Zomee platform, even if Zomee or an authorized representative has been notified orally or in writing of the possibility of such damage.</p>
            </section>

            <section id="termination">
              <h2>4. Termination of Access</h2>
              <p>We reserve the right to immediately terminate or suspend your access to the Zomee platform without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms of Use. Active Hosts hold the right to disconnect any participant from their individual rooms at their sole discretion.</p>
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
          border-color: rgba(99, 102, 241, 0.4);
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
