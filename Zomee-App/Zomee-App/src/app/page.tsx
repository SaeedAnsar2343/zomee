"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Video, Users, Link as LinkIcon, Shield, Zap, Globe2, Lock } from 'lucide-react';

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
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", position: "relative", overflow: "hidden" }}>
      
      {/* Abstract Background with Grid overlay */}
      <div className="bg-orb" style={{ position: "absolute", top: "-20%", left: "-10%", width: "70vw", height: "70vw", background: "radial-gradient(circle, rgba(34, 211, 238, 0.15) 0%, rgba(0,0,0,0) 70%)", borderRadius: "50%", zIndex: 0, filter: "blur(60px)", animation: "float 10s ease-in-out infinite" }}></div>
      <div className="bg-orb" style={{ position: "absolute", bottom: "-20%", right: "-10%", width: "60vw", height: "60vw", background: "radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, rgba(0,0,0,0) 70%)", borderRadius: "50%", zIndex: 0, filter: "blur(60px)", animation: "float 14s ease-in-out infinite reverse" }}></div>
      <div className="bg-grid"></div>

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: "absolute", top: "32px", left: "50%", transform: "translateX(-50%)",
          background: "rgba(239, 68, 68, 0.2)", backdropFilter: "blur(12px)", border: "1px solid rgba(239, 68, 68, 0.5)",
          color: "white", padding: "12px 24px", borderRadius: "100px", zIndex: 100,
          boxShadow: "0 10px 30px rgba(239, 68, 68, 0.2)", fontWeight: "500", animation: "fadeInDown 0.3s ease-out"
        }}>
          {toastMessage}
        </div>
      )}

      {/* Success Modal */}
      {foundHost && (
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 200,
          background: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(12px)",
          display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column"
        }}>
          <div className="glass-panel" style={{ padding: "48px 32px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "100%", height: "2px", background: "linear-gradient(90deg, transparent, rgba(34,211,238,0.5), transparent)" }}></div>
            
            <div style={{ 
              width: "80px", height: "80px", background: "linear-gradient(135deg, rgba(34, 211, 238, 0.2), rgba(14, 165, 233, 0.2))", 
              borderRadius: "24px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px",
              border: "1px solid rgba(34, 211, 238, 0.3)", boxShadow: "0 0 30px rgba(34, 211, 238, 0.2)"
            }}>
              <Video size={40} style={{ color: "var(--primary-cyan)" }} />
            </div>
            <h2 style={{ marginBottom: "8px", fontSize: "1.8rem" }}>Meeting Found!</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.2rem", marginBottom: "24px" }}>Hosted by: <strong style={{ color: "white" }}>{foundHost}</strong></p>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", justifyContent: "center", color: "var(--primary-cyan)" }}>
              <div style={{ width: "24px", height: "24px", border: "3px solid var(--primary-cyan)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
              Joining...
            </div>
          </div>
        </div>
      )}

      <div style={{ zIndex: 10, width: "100%", maxWidth: "480px", display: "flex", flexDirection: "column", gap: "24px" }} className="animate-fade-in">
        <div className="glass-panel" style={{ width: "100%", padding: "48px 40px", textAlign: "center" }}>
          
          <div 
            className="water-bubble"
            style={{ width: "110px", height: "110px", margin: "0 auto 36px", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="23 7 16 12 23 17 23 7"></polygon>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
            </svg>
          </div>

          <h1 style={{ fontSize: "3rem", fontWeight: "800", marginBottom: "8px", letterSpacing: "-0.03em", background: "linear-gradient(135deg, #fff 0%, #a5b4fc 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Zomee</h1>
          <p style={{ color: "var(--text-secondary)", marginBottom: "32px", fontSize: "1.1rem" }}>Experience fluid, real-time meetings.</p>

          {/* Horizontal Feature Badges */}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px", marginTop: "16px" }}>
            <div className="feature-pill">
              <Lock size={14} color="#22c55e" />
              <span>E2E Encrypted</span>
            </div>
            <div className="feature-pill">
              <Globe2 size={14} color="var(--primary-cyan)" />
              <span>Global Edge</span>
            </div>
            <div className="feature-pill">
              <Zap size={14} color="#facc15" />
              <span>Instant Join</span>
            </div>
          </div>

          <form onSubmit={joinMeeting} style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "32px", marginBottom: "28px" }}>
            <input 
              type="text" 
              className="glass-input" 
              placeholder="Enter meeting code..." 
              value={meetingCode}
              onChange={(e) => setMeetingCode(e.target.value)}
            />
            <button 
              type="submit" 
              className="btn-primary" 
              style={{ width: "100%", padding: "16px" }}
              disabled={!meetingCode.trim() || isVerifying}
            >
              {isVerifying ? "Verifying..." : "Join Anonymous Meeting"}
            </button>
          </form>

          <div style={{ display: "flex", alignItems: "center", margin: "28px 0", color: "var(--text-secondary)" }}>
            <div style={{ flex: 1, height: "1px", background: "var(--glass-border)" }}></div>
            <span style={{ margin: "0 16px", fontSize: "0.875rem", fontWeight: "600", letterSpacing: "0.05em" }}>OR</span>
            <div style={{ flex: 1, height: "1px", background: "var(--glass-border)" }}></div>
          </div>

          <button 
            onClick={handleCreateMeeting}
            className="btn-primary"
            style={{ 
              width: "100%", 
              padding: "16px",
              background: isHovering ? "var(--glass-bg)" : "transparent",
              border: "1px solid var(--primary-cyan)",
              color: "var(--primary-cyan)",
              boxShadow: isHovering ? "0 0 20px rgba(34, 211, 238, 0.2)" : "none"
            }}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            Create New Meeting
          </button>
        </div>

        {/* Footer Links & Support */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "16px" }}>
          <div style={{ textAlign: "center", lineHeight: "1.5", background: "rgba(255,255,255,0.03)", padding: "12px 24px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
            <span style={{ color: "white" }}>Created independently by <strong>Saeed Ansar</strong>.</span><br/>
            <span>To help keep Zomee's servers completely free, you can support via <strong>Botim: +971588346500</strong></span>
          </div>
          <div style={{ display: "flex", gap: "24px" }}>
            <a href="/privacy" className="footer-link">Privacy Policy</a>
            <a href="/terms" className="footer-link">Terms of Use</a>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes fadeInDown {
          0% { opacity: 0; transform: translate(-50%, -20px); }
          100% { opacity: 1; transform: translate(-50%, 0); }
        }

        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(20px); filter: blur(10px); }
          100% { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        
        .animate-fade-in {
          animation: fadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .bg-grid {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background-image: 
            linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 50px 50px;
          z-index: 0;
          pointer-events: none;
        }

        .feature-pill {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 8px 16px;
          border-radius: 100px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          color: var(--text-secondary);
          transition: all 0.3s ease;
          backdrop-filter: blur(8px);
        }
        
        .feature-pill:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(34,211,238,0.3);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }

        .footer-link {
          transition: color 0.2s;
        }
        .footer-link:hover {
          color: var(--primary-cyan);
        }
      `}</style>
    </main>
  );
}
