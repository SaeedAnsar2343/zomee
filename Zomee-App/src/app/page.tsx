"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup, onAuthStateChanged, User } from "firebase/auth";

export default function Home() {
  const router = useRouter();
  const [meetingCode, setMeetingCode] = useState("");
  const [isHovering, setIsHovering] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [toastMessage, setToastMessage] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setIsCheckingAuth(false);
      });
      return () => unsubscribe();
    } catch (err) {
      // Firebase might not be configured properly
      setIsCheckingAuth(false);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 5000);
  };

  const handleCreateMeeting = async () => {
    // Check if Firebase is actually configured
    const isFirebaseConfigured = process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== "your_firebase_api_key";

    if (!user) {
      if (!isFirebaseConfigured) {
        showToast("Firebase not configured. Creating a test meeting anyway!");
        setTimeout(() => {
          const newRoomId = uuidv4();
          router.push(`/room/${newRoomId}?host=true`);
        }, 1500);
        return;
      }

      try {
        await signInWithPopup(auth, googleProvider);
        const newRoomId = uuidv4();
        router.push(`/room/${newRoomId}?host=true`);
      } catch (error: any) {
        console.error("Login failed", error);
        showToast("Login failed. Check console or API keys.");
      }
    } else {
      const newRoomId = uuidv4();
      router.push(`/room/${newRoomId}?host=true`);
    }
  };

  const joinMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (meetingCode.trim()) {
      router.push(`/room/${meetingCode}`);
    }
  };

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", position: "relative" }}>
      
      {/* Toast Notification */}
      <div style={{
        position: "absolute",
        top: toastMessage ? "32px" : "-100px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(15, 23, 42, 0.8)",
        backdropFilter: "blur(12px)",
        border: "1px solid var(--primary-cyan)",
        color: "white",
        padding: "12px 24px",
        borderRadius: "100px",
        transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        zIndex: 50,
        boxShadow: "0 10px 30px rgba(34, 211, 238, 0.2)",
        fontWeight: "500"
      }}>
        {toastMessage}
      </div>

      <div 
        className="glass-panel" 
        style={{ width: "100%", maxWidth: "480px", padding: "48px 40px", textAlign: "center", zIndex: 10, position: "relative" }}
      >
        <div 
          className="water-bubble"
          style={{ width: "110px", height: "110px", margin: "0 auto 36px", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="23 7 16 12 23 17 23 7"></polygon>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
          </svg>
        </div>

        <h1 style={{ fontSize: "2.5rem", fontWeight: "800", marginBottom: "8px", letterSpacing: "-0.02em" }}>Zomee</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "40px", fontSize: "1.1rem" }}>Experience fluid, real-time meetings.</p>

        <form onSubmit={joinMeeting} style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "28px" }}>
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
            disabled={!meetingCode.trim()}
          >
            Join Anonymous Meeting
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
          {isCheckingAuth ? "Loading..." : user ? "Create New Meeting" : "Login & Create Meeting"}
        </button>

        {user && (
          <p style={{ marginTop: "20px", fontSize: "0.875rem", color: "var(--primary-cyan)" }}>
            Logged in as {user.displayName}
          </p>
        )}
      </div>

      <div style={{ position: "absolute", bottom: "20px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "24px", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
        <a href="/privacy" target="_blank" style={{ color: "var(--text-secondary)", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--primary-cyan)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-secondary)"}>Privacy Policy</a>
        <a href="/terms" target="_blank" style={{ color: "var(--text-secondary)", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--primary-cyan)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-secondary)"}>Terms of Use</a>
      </div>
    </main>
  );
}
