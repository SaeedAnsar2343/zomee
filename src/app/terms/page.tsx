import React from 'react';

export default function TermsOfUse() {
  return (
    <main style={{ minHeight: "100vh", padding: "64px 24px", background: "var(--bg-gradient)" }}>
      <div className="glass-panel" style={{ maxWidth: "800px", margin: "0 auto", padding: "48px" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: "800", marginBottom: "24px", color: "var(--primary-cyan)" }}>Terms of Use</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "32px" }}>Last updated: July 2026</p>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", lineHeight: "1.6" }}>
          <section>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "12px", color: "white" }}>1. Acceptance of Terms</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              By accessing and using Zomee, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this service.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "12px", color: "white" }}>2. Description of Service</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Zomee provides users with access to real-time video and audio communication tools, screen sharing, and chat capabilities. You understand and agree that the service is provided "AS-IS" and that Zomee assumes no responsibility for the timeliness, deletion, mis-delivery, or failure to store any user communications or personalization settings.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "12px", color: "white" }}>3. User Conduct</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              You agree to not use the Service to:
            </p>
            <ul style={{ color: "var(--text-secondary)", paddingLeft: "24px", marginTop: "8px" }}>
              <li>Upload, post, transmit or otherwise make available any content that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, libellous, invasive of another's privacy, hateful, or racially, ethnically or otherwise objectionable.</li>
              <li>Impersonate any person or entity, including, but not limited to, a Zomee official or host.</li>
              <li>Interfere with or disrupt the Service or servers or networks connected to the Service.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "12px", color: "white" }}>4. Modifications to Service</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Zomee reserves the right at any time and from time to time to modify or discontinue, temporarily or permanently, the Service (or any part thereof) with or without notice.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
