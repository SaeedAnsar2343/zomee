"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { LiveKitRoom } from "@livekit/components-react";
import { VideoPresets } from "livekit-client";
import "@livekit/components-styles";
import CustomRoomLayout from "@/components/CustomRoomLayout";
import { Copy, Check } from "lucide-react";

export default function RoomPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const isHost = searchParams.get("host") === "true";

  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  
  // PreJoin States
  const [hasJoined, setHasJoined] = useState(false);
  const [username, setUsername] = useState("");
  const [isGettingToken, setIsGettingToken] = useState(false);
  const [copied, setCopied] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Setup camera preview
  useEffect(() => {
    if (!hasJoined) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          setMediaStream(stream);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => console.error("Error accessing media devices.", err));
    } else if (mediaStream) {
      // Stop preview tracks when joining so LiveKit can take over
      mediaStream.getTracks().forEach(track => track.stop());
    }
  }, [hasJoined]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsGettingToken(true);
    try {
      const res = await fetch(`/api/get-participant-token?room=${roomId}&username=${encodeURIComponent(username)}&isHost=${isHost}`);
      if (!res.ok) {
        throw new Error("Failed to get token");
      }
      const data = await res.json();
      setToken(data.token);
      setHasJoined(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGettingToken(false);
    }
  };

  if (error) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <h2 style={{ color: "var(--danger)" }}>Error joining room</h2>
        <p>{error}</p>
        <button className="btn-primary" style={{ marginTop: "20px" }} onClick={() => router.push("/")}>Go Back</button>
      </div>
    );
  }

  // Render Pre-Join Lobby
  if (!hasJoined || !token) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
        <div className="glass-panel" style={{ width: "100%", maxWidth: "800px", padding: "40px", display: "flex", flexWrap: "wrap", gap: "32px" }}>
          
          {/* Camera Preview */}
          <div style={{ flex: "1 1 300px", background: "black", borderRadius: "16px", overflow: "hidden", position: "relative", aspectRatio: "16/9" }}>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }}
            />
            <div style={{ position: "absolute", bottom: "16px", left: "16px", background: "rgba(0,0,0,0.5)", padding: "4px 12px", borderRadius: "20px", fontSize: "0.875rem" }}>
              Camera Preview
            </div>
          </div>

          {/* Join Form */}
          <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative" }}>
            
            {/* Background animated water bubble for decoration */}
            <div className="water-bubble" style={{ position: "absolute", top: "-20%", right: "-10%", width: "150px", height: "150px", opacity: 0.1, zIndex: 0 }}></div>

            <div style={{ position: "relative", zIndex: 10 }}>
              <h1 style={{ fontSize: "2.5rem", fontWeight: "800", marginBottom: "12px", letterSpacing: "-0.02em" }}>
                {isHost ? "Ready to create?" : "Ready to join?"}
              </h1>
              
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px", background: "rgba(0,0,0,0.2)", padding: "12px 16px", borderRadius: "12px", border: "1px solid var(--glass-border)" }}>
                <div>
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem", display: "block", marginBottom: "4px" }}>Room Code</span>
                  <span style={{ color: "var(--primary-cyan)", fontWeight: "600", fontSize: "1.1rem", letterSpacing: "1px" }}>{roomId}</span>
                </div>
                <button 
                  onClick={handleCopyCode}
                  style={{ marginLeft: "auto", background: copied ? "rgba(34, 211, 238, 0.2)" : "rgba(255,255,255,0.1)", border: "none", color: copied ? "var(--primary-cyan)" : "white", padding: "8px", borderRadius: "8px", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  <span style={{ fontSize: "0.875rem", fontWeight: "500" }}>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>

              <form onSubmit={handleJoin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "0.875rem", color: "var(--text-secondary)" }}>Your Display Name</label>
                  <input 
                    type="text" 
                    className="glass-input" 
                    placeholder="e.g. John Doe" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoFocus
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="btn-primary" 
                  style={{ padding: "16px", marginTop: "8px", position: "relative", overflow: "hidden" }}
                  disabled={!username.trim() || isGettingToken}
                >
                  {isGettingToken ? "Connecting..." : (isHost ? "Create Meeting" : "Join Meeting")}
                </button>
              </form>
            </div>
          </div>

        </div>
      </main>
    );
  }

  // Render LiveKit Room
  return (
    <LiveKitRoom
      video={true}
      audio={true}
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      data-lk-theme="default"
      style={{ height: "100vh", display: "flex", flexDirection: "column" }}
      onDisconnected={() => router.push("/")}
      videoCaptureDefaults={{ resolution: VideoPresets.h1080.resolution }}
      screenShareDefaults={{ resolution: VideoPresets.h1080.resolution }}
    >
      <CustomRoomLayout />
    </LiveKitRoom>
  );
}
