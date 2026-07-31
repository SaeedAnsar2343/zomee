import React from 'react';

export default function PrivacyPolicy() {
  return (
    <main style={{ minHeight: "100vh", padding: "64px 24px", background: "var(--bg-gradient)" }}>
      <div className="glass-panel" style={{ maxWidth: "800px", margin: "0 auto", padding: "48px" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: "800", marginBottom: "24px", color: "var(--primary-cyan)" }}>Privacy Policy</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "32px" }}>Last updated: July 2026</p>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", lineHeight: "1.6" }}>
          <section>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "12px", color: "white" }}>1. Introduction</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Welcome to Zomee. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and use our video conferencing services.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "12px", color: "white" }}>2. Data We Collect</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              When you use Zomee, we may collect:
            </p>
            <ul style={{ color: "var(--text-secondary)", paddingLeft: "24px", marginTop: "8px" }}>
              <li><strong>Identity Data:</strong> Name or display name provided upon joining a meeting.</li>
              <li><strong>Technical Data:</strong> IP address, browser type and version, time zone setting, and operating system.</li>
              <li><strong>Usage Data:</strong> Information about how you use our video, audio, and chat features (Note: We do NOT record video or audio unless explicitly initiated by the host).</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "12px", color: "white" }}>3. How We Use Your Data</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              We will only use your personal data for the following purposes:
            </p>
            <ul style={{ color: "var(--text-secondary)", paddingLeft: "24px", marginTop: "8px" }}>
              <li>To provide and maintain the Zomee service (facilitating peer-to-peer and server-relayed connections).</li>
              <li>To notify you about changes to our service.</li>
              <li>To provide customer support and improve the platform's stability.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "12px", color: "white" }}>4. Data Security</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              All video and audio streams are encrypted in transit. We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
