"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { auth, googleProvider, isFirebaseConfigured } from "@/lib/firebase";
import { signInWithPopup, onAuthStateChanged, User } from "firebase/auth";

export default function Home() {
  const router = useRouter();
  const [meetingCode, setMeetingCode] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [toastMessage, setToastMessage] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    if (!auth) {
      // Firebase not configured — skip auth entirely.
      setIsCheckingAuth(false);
      return;
    }
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
    if (!user) {
      if (!isFirebaseConfigured || !auth) {
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

  const features = [
    {
      title: "Crystal-clear video",
      desc: "Adaptive HD streams that stay smooth on any connection.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="23 7 16 12 23 17 23 7" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
      ),
    },
    {
      title: "Instant, no installs",
      desc: "Share a link and meet in the browser in seconds.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      ),
    },
    {
      title: "Private by default",
      desc: "Encrypted rooms with anonymous join options.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
    },
  ];

  return (
    <main className="landing">
      {/* Toast Notification */}
      <div className="toast" data-visible={toastMessage ? "true" : "false"} role="status" aria-live="polite">
        {toastMessage}
      </div>

      <nav className="landing-nav">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </span>
          <span className="brand-name">Zomee</span>
        </div>
        {user && <span className="nav-user">Hi, {user.displayName?.split(" ")[0] ?? "there"}</span>}
      </nav>

      <div className="landing-grid">
        {/* Hero copy */}
        <section className="hero">
          <span className="hero-pill">
            <span className="hero-dot" aria-hidden="true" />
            Real-time meetings, reimagined
          </span>
          <h1 className="hero-title text-balance">
            Fluid video calls that just <span className="hero-accent">flow</span>.
          </h1>
          <p className="hero-sub text-pretty">
            Zomee makes it effortless to start or join high-quality meetings from any device. No downloads, no
            friction, just a link and you&apos;re in.
          </p>

          <ul className="feature-list">
            {features.map((f) => (
              <li key={f.title} className="feature-item">
                <span className="feature-icon" aria-hidden="true">
                  {f.icon}
                </span>
                <div>
                  <p className="feature-title">{f.title}</p>
                  <p className="feature-desc">{f.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Action card */}
        <section className="glass-panel action-card" aria-label="Start or join a meeting">
          <div className="water-bubble action-bubble" aria-hidden="true">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </div>

          <h2 className="card-title">Get started</h2>
          <p className="card-sub">Join with a code or spin up a brand-new room.</p>

          <form onSubmit={joinMeeting} className="join-form">
            <input
              type="text"
              className="glass-input"
              placeholder="Enter meeting code..."
              value={meetingCode}
              onChange={(e) => setMeetingCode(e.target.value)}
              aria-label="Meeting code"
            />
            <button type="submit" className="btn-primary btn-block" disabled={!meetingCode.trim()}>
              Join Meeting
            </button>
          </form>

          <div className="divider">
            <span className="divider-line" />
            <span className="divider-text">OR</span>
            <span className="divider-line" />
          </div>

          <button onClick={handleCreateMeeting} className="btn-outline btn-block" disabled={isCheckingAuth}>
            {isCheckingAuth ? "Loading..." : user ? "Create New Meeting" : "Login & Create Meeting"}
          </button>

          {user && <p className="card-user">Logged in as {user.displayName}</p>}
        </section>
      </div>

      <footer className="landing-footer">
        <a href="/privacy" target="_blank" className="footer-link">
          Privacy Policy
        </a>
        <span className="footer-sep" aria-hidden="true">
          •
        </span>
        <a href="/terms" target="_blank" className="footer-link">
          Terms of Use
        </a>
      </footer>
    </main>
  );
}
