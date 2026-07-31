"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Video, Zap, Globe2, Lock, ArrowRight, Video as VideoIcon } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [meetingCode, setMeetingCode] = useState('');
  const [isHovering, setIsHovering] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [foundHost, setFoundHost] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const joinMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (meetingCode.trim()) {
      setIsVerifying(true);
      try {
        const res = await fetch(`/api/verify-room?room=${meetingCode.trim()}`);
        if (res.ok) {
          const data = await res.json();
          setFoundHost(data.hostName);
          setTimeout(() => {
            router.push(`/room/${meetingCode.trim()}`);
          }, 2500);
        } else {
          showToast("⚠️ Meeting not found or Host hasn't joined yet.");
          setIsVerifying(false);
        }
      } catch (err) {
        showToast("⚠️ Network error verifying meeting.");
        setIsVerifying(false);
      }
    }
  };

  const handleCreateMeeting = () => {
    const newRoomId = Math.random().toString(36).substring(2, 9);
    router.push(`/room/${newRoomId}?host=true`);
  };

  return (
    <main style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", padding: "20px", position: "relative", overflow: "hidden", backgroundColor: "#020617" }}>
      
      {/* Premium Aurora Background */}
      <div className="aurora-blob aurora-1"></div>
      <div className="aurora-blob aurora-2"></div>
      <div className="aurora-blob aurora-3"></div>
      
      {/* Refined Grid Overlay */}
      <div className="premium-grid"></div>

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: "absolute", top: "32px", left: "50%", transform: "translateX(-50%)",
          background: "rgba(255, 255, 255, 0.05)", backdropFilter: "blur(20px)", border: "1px solid rgba(255, 255, 255, 0.1)",
          color: "white", padding: "14px 28px", borderRadius: "100px", zIndex: 100,
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4), inset 0 0 0 1px rgba(255, 255, 255, 0.05)", fontWeight: "500", animation: "slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
        }}>
          {toastMessage}
        </div>
      )}

      {/* Success Modal */}
      {foundHost && (
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 200,
          background: "rgba(2, 6, 23, 0.85)", backdropFilter: "blur(20px)",
          display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column"
        }}>
          <div className="premium-glass-panel" style={{ padding: "50px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", position: "relative", overflow: "hidden" }}>
            <div className="shimmer-line"></div>
            
            <div className="logo-pulse-container" style={{ marginBottom: "28px" }}>
              <div className="logo-glow"></div>
              <div className="logo-icon-wrapper">
                <VideoIcon size={44} style={{ color: "white" }} />
              </div>
            </div>
            
            <h2 style={{ marginBottom: "12px", fontSize: "2rem", fontWeight: "700", letterSpacing: "-0.03em" }}>Meeting Found</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", marginBottom: "32px" }}>Hosted by: <strong style={{ color: "white", fontWeight: "600" }}>{foundHost}</strong></p>
            
            <div style={{ display: "flex", alignItems: "center", gap: "14px", justifyContent: "center", color: "white", fontSize: "1.1rem", fontWeight: "500" }}>
              <div className="spinner"></div>
              Connecting securely...
            </div>
          </div>
        </div>
      )}

      <div style={{ zIndex: 10, width: "100%", maxWidth: "520px", display: "flex", flexDirection: "column", gap: "24px" }} className="animate-fade-in-up">
        
        {/* Main Hero Panel */}
        <div className="premium-glass-panel" style={{ width: "100%", padding: "56px 48px", textAlign: "center" }}>
          
          <div className="logo-pulse-container" style={{ margin: "0 auto 32px" }}>
            <div className="logo-glow"></div>
            <div className="logo-icon-wrapper">
              <VideoIcon size={40} style={{ color: "white" }} />
            </div>
          </div>

          <h1 className="hero-title">Zomee</h1>
          <p className="hero-subtitle">The next generation of fluid, high-fidelity video meetings.</p>

          {/* Feature Badges */}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px", marginTop: "24px", marginBottom: "36px" }}>
            <div className="premium-badge"><Lock size={14} color="#34d399" /><span>E2E Encrypted</span></div>
            <div className="premium-badge"><Globe2 size={14} color="#38bdf8" /><span>Global Edge</span></div>
            <div className="premium-badge"><Zap size={14} color="#fbbf24" /><span>Instant Join</span></div>
          </div>

          <form onSubmit={joinMeeting} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="input-group">
              <input 
                type="text" 
                className="premium-input" 
                placeholder="Enter meeting code" 
                value={meetingCode}
                onChange={(e) => setMeetingCode(e.target.value)}
              />
              <div className="input-glow"></div>
            </div>
            
            <button 
              type="submit" 
              className="premium-btn primary" 
              disabled={!meetingCode.trim() || isVerifying}
            >
              <span>{isVerifying ? "Verifying..." : "Join Anonymous Meeting"}</span>
              {!isVerifying && <ArrowRight size={18} className="btn-icon" />}
            </button>
          </form>

          <div className="divider">
            <span className="divider-text">OR</span>
          </div>

          <button 
            onClick={handleCreateMeeting}
            className="premium-btn secondary"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <span>Create New Meeting</span>
          </button>
        </div>

        {/* Footer */}
        <div className="footer-container">
          <div className="footer-support">
            <span style={{ display: "block", color: "rgba(255,255,255,0.9)", marginBottom: "6px" }}>Built independently by <strong>Saeed Ansar</strong>.</span>
            <span>To support server costs, send help via <strong>Botim: +971588346500</strong></span>
          </div>
          <div className="footer-links">
            <a href="/privacy">Privacy Policy</a>
            <span className="dot">•</span>
            <a href="/terms">Terms of Use</a>
          </div>
        </div>
      </div>

      <style jsx global>{`
        :root {
          --cyan-500: #06b6d4;
          --blue-500: #3b82f6;
          --indigo-500: #6366f1;
        }

        /* Animations */
        @keyframes slideDown {
          0% { opacity: 0; transform: translate(-50%, -20px); }
          100% { opacity: 1; transform: translate(-50%, 0); }
        }

        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(30px) scale(0.95); filter: blur(10px); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulseLogo {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }

        @keyframes blobFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        @keyframes blobFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-50px, 30px) scale(1.2); }
          66% { transform: translate(20px, -20px) scale(0.8); }
        }

        .animate-fade-in-up {
          animation: fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* Background Aurora */
        .aurora-blob {
          position: absolute;
          filter: blur(80px);
          opacity: 0.4;
          border-radius: 50%;
          z-index: 0;
          pointer-events: none;
        }
        .aurora-1 {
          top: -10%; left: -10%; width: 50vw; height: 50vw;
          background: radial-gradient(circle, var(--indigo-500), transparent 70%);
          animation: blobFloat1 15s infinite ease-in-out;
        }
        .aurora-2 {
          bottom: -20%; right: -10%; width: 60vw; height: 60vw;
          background: radial-gradient(circle, var(--cyan-500), transparent 70%);
          animation: blobFloat2 18s infinite ease-in-out reverse;
        }
        .aurora-3 {
          top: 30%; left: 40%; width: 40vw; height: 40vw;
          background: radial-gradient(circle, var(--blue-500), transparent 70%);
          animation: blobFloat1 20s infinite ease-in-out 2s;
          opacity: 0.2;
        }

        .premium-grid {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background-image: 
            linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 40px 40px;
          z-index: 0;
          pointer-events: none;
          mask-image: radial-gradient(circle at center, black, transparent 80%);
          -webkit-mask-image: radial-gradient(circle at center, black, transparent 80%);
        }

        /* Premium Glass Panel */
        .premium-glass-panel {
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 32px;
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .shimmer-line {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          animation: shimmer 3s infinite linear;
        }

        /* Logo Component */
        .logo-pulse-container {
          position: relative;
          width: 80px; height: 80px;
          display: flex; alignItems: center; justifyContent: center;
        }
        .logo-glow {
          position: absolute;
          width: 100%; height: 100%;
          background: linear-gradient(135deg, var(--cyan-500), var(--blue-500));
          border-radius: 24px;
          filter: blur(15px);
          animation: pulseLogo 4s infinite ease-in-out;
        }
        .logo-icon-wrapper {
          position: relative;
          width: 100%; height: 100%;
          background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.03));
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 24px;
          display: flex; align-items: center; justify-content: center;
          backdrop-filter: blur(10px);
          box-shadow: inset 0 2px 20px rgba(255,255,255,0.1);
        }

        /* Typography */
        .hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          margin-bottom: 8px;
          letter-spacing: -0.04em;
          background: linear-gradient(180deg, #ffffff 0%, #a1a1aa 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero-subtitle {
          color: #a1a1aa;
          font-size: 1.15rem;
          letter-spacing: -0.01em;
          line-height: 1.5;
        }

        /* Badges */
        .premium-badge {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          padding: 6px 14px;
          border-radius: 100px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          color: #d4d4d8;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        .premium-badge:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.15);
          color: white;
          transform: translateY(-1px);
        }

        /* Inputs */
        .input-group {
          position: relative;
        }
        .premium-input {
          width: 100%;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 18px 24px;
          color: white;
          font-size: 1.05rem;
          transition: all 0.3s ease;
          outline: none;
          box-shadow: inset 0 2px 10px rgba(0,0,0,0.2);
        }
        .premium-input::placeholder {
          color: #71717a;
        }
        .input-glow {
          position: absolute;
          inset: -1px;
          border-radius: 16px;
          background: linear-gradient(90deg, var(--cyan-500), var(--blue-500));
          z-index: -1;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .premium-input:focus {
          border-color: transparent;
          background: rgba(0, 0, 0, 0.4);
        }
        .premium-input:focus + .input-glow {
          opacity: 1;
        }

        /* Buttons */
        .premium-btn {
          width: 100%;
          padding: 18px;
          border-radius: 16px;
          font-size: 1.05rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }
        .premium-btn.primary {
          background: linear-gradient(135deg, var(--text-primary) 0%, #e4e4e7 100%);
          color: #09090b;
          border: none;
          box-shadow: 0 10px 25px rgba(255,255,255,0.15);
        }
        .premium-btn.primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 15px 35px rgba(255,255,255,0.25);
          background: white;
        }
        .premium-btn.primary:active:not(:disabled) {
          transform: translateY(1px);
          box-shadow: 0 5px 15px rgba(255,255,255,0.1);
        }
        .premium-btn.primary:disabled {
          background: rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.3);
          box-shadow: none;
          cursor: not-allowed;
        }
        .premium-btn .btn-icon {
          transition: transform 0.3s ease;
        }
        .premium-btn:hover .btn-icon {
          transform: translateX(4px);
        }

        .divider {
          display: flex;
          align-items: center;
          margin: 28px 0;
          position: relative;
        }
        .divider::before, .divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
        }
        .divider-text {
          margin: 0 16px;
          font-size: 0.8rem;
          color: #71717a;
          font-weight: 600;
          letter-spacing: 0.05em;
        }

        .premium-btn.secondary {
          background: transparent;
          color: white;
          border: 1px solid rgba(255,255,255,0.15);
        }
        .premium-btn.secondary:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.3);
        }

        /* Footer */
        .footer-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          margin-top: 10px;
        }
        .footer-support {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          padding: 16px 24px;
          border-radius: 16px;
          font-size: 0.85rem;
          color: #a1a1aa;
          text-align: center;
          backdrop-filter: blur(10px);
        }
        .footer-links {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.85rem;
          color: #71717a;
        }
        .footer-links a {
          transition: color 0.2s ease;
        }
        .footer-links a:hover {
          color: white;
        }
        .dot {
          font-size: 0.6rem;
          opacity: 0.5;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255,255,255,0.2);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        /* Mobile Responsive Overrides */
        @media (max-width: 768px) {
          .premium-glass-panel {
            padding: 36px 24px !important;
          }
          .hero-title {
            font-size: 2.5rem;
          }
          .hero-subtitle {
            font-size: 0.95rem;
            padding: 0 10px;
          }
          .premium-badge {
            font-size: 0.75rem;
            padding: 4px 10px;
          }
          .footer-support {
            padding: 12px 16px;
            font-size: 0.75rem;
          }
        }
      `}</style>
    </main>
  );
}
