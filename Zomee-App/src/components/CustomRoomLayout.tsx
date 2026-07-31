"use client";

import { useTracks, GridLayout, ParticipantTile, RoomAudioRenderer, ControlBar, Chat, useParticipants, useDataChannel, useLocalParticipant, useRoomContext } from "@livekit/components-react";
import { Track, RoomEvent } from "livekit-client";
import { useState, useCallback, useEffect } from "react";
import Recorder from "./Recorder";
import { MessageSquare, X, Users, Link as LinkIcon, Smile, MicOff, VideoOff, MessageSquareOff, Hand, Mic, Video, LogOut } from "lucide-react";

export default function CustomRoomLayout() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();
  
  // Parse isHost from metadata
  const isHost = localParticipant?.metadata ? (() => {
    try { return JSON.parse(localParticipant.metadata).isHost; } catch { return false; }
  })() : false;

  const [sidebarTab, setSidebarTab] = useState<"chat" | "participants" | null>(null);
  const [toastMsg, setToastMsg] = useState("");
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: number, emoji: string, left: number }[]>([]);
  const [isInviteMenuOpen, setIsInviteMenuOpen] = useState(false);
  const [isChatMuted, setIsChatMuted] = useState(false);
  const [raisedHands, setRaisedHands] = useState<Set<string>>(new Set());
  const [incomingRequest, setIncomingRequest] = useState<{ hostIdentity: string, type: 'mic' | 'video' } | null>(null);
  const [showEndMeetingModal, setShowEndMeetingModal] = useState(false);
  const [meetingEndedMessage, setMeetingEndedMessage] = useState("");
  const room = useRoomContext();

  // Listen for participant departures
  useEffect(() => {
    const handleParticipantDisconnected = (participant: any) => {
      if (isHost) {
        setToastMsg(`${participant.name || participant.identity} left the meeting.`);
        setTimeout(() => setToastMsg(""), 4000);
      }
    };
    room.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
    return () => { room.off(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected); };
  }, [room, isHost]);

  // Data channel for Host Commands
  const { send: sendHostCommand } = useDataChannel("host-commands", (msg) => {
    const decoder = new TextDecoder();
    try {
      const command = JSON.parse(decoder.decode(msg.payload));
      
      // Global commands
      if (command.action === "raise-hand") {
        setRaisedHands(prev => { const n = new Set(prev); n.add(command.identity); return n; });
        return;
      }
      if (command.action === "lower-hand") {
        setRaisedHands(prev => { const n = new Set(prev); n.delete(command.identity); return n; });
        return;
      }
      if (command.action === "end-meeting") {
        setMeetingEndedMessage("This meeting was disbanded by the host.");
        setTimeout(() => {
          room.disconnect();
        }, 3000);
        return;
      }

      // Targeted commands
      if (localParticipant && command.target === localParticipant.identity) {
        if (command.action === "mute-mic") {
          localParticipant.setMicrophoneEnabled(false);
          setToastMsg("The Host has muted your microphone.");
          setTimeout(() => setToastMsg(""), 4000);
        } else if (command.action === "mute-video") {
          localParticipant.setCameraEnabled(false);
          setToastMsg("The Host has disabled your video.");
          setTimeout(() => setToastMsg(""), 4000);
        } else if (command.action === "mute-chat") {
          setIsChatMuted(true);
          setToastMsg("The Host has disabled your chat.");
          setTimeout(() => setToastMsg(""), 4000);
        } else if (command.action === "request-unmute-mic") {
          setIncomingRequest({ hostIdentity: command.sender, type: 'mic' });
        } else if (command.action === "request-unmute-video") {
          setIncomingRequest({ hostIdentity: command.sender, type: 'video' });
        } else if (command.action === "request-rejected") {
          setToastMsg(`Participant declined your ${command.type} request.`);
          setTimeout(() => setToastMsg(""), 4000);
        }
      }
    } catch (e) {
      console.error(e);
    }
  });

  const executeHostCommand = (targetIdentity: string | null, action: string, type?: string) => {
    const encoder = new TextEncoder();
    sendHostCommand(encoder.encode(JSON.stringify({ 
      sender: localParticipant?.identity, 
      identity: localParticipant?.identity, 
      target: targetIdentity, 
      action, 
      type 
    })), { reliable: true });
    
    if (action.startsWith("request")) {
      setToastMsg(`Request sent.`);
      setTimeout(() => setToastMsg(""), 2000);
    } else if (action === "end-meeting") {
      // no local toast needed, we are ending it
    } else if (targetIdentity) {
      setToastMsg(`Action sent to participant.`);
      setTimeout(() => setToastMsg(""), 2000);
    }
  };

  const toggleHand = () => {
    if (!localParticipant) return;
    const isRaised = raisedHands.has(localParticipant.identity);
    executeHostCommand(null, isRaised ? "lower-hand" : "raise-hand");
    // Optimistic UI
    setRaisedHands(prev => {
      const n = new Set(prev);
      if (isRaised) n.delete(localParticipant.identity);
      else n.add(localParticipant.identity);
      return n;
    });
  };

  const handleRequestResponse = (accept: boolean) => {
    if (!incomingRequest || !localParticipant) return;
    if (accept) {
      if (incomingRequest.type === 'mic') localParticipant.setMicrophoneEnabled(true);
      if (incomingRequest.type === 'video') localParticipant.setCameraEnabled(true);
    } else {
      executeHostCommand(incomingRequest.hostIdentity, "request-rejected", incomingRequest.type);
    }
    setIncomingRequest(null);
  };

  const handleLeaveButtonClick = () => {
    if (isHost) {
      setShowEndMeetingModal(true);
    } else {
      room.disconnect();
    }
  };

  const endMeetingForAll = () => {
    executeHostCommand(null, "end-meeting");
    setShowEndMeetingModal(false);
    room.disconnect();
  };

  const { send } = useDataChannel("reactions", (msg) => {
    const decoder = new TextDecoder();
    const emoji = decoder.decode(msg.payload);
    triggerLocalReaction(emoji);
  });

  const triggerLocalReaction = useCallback((emoji: string) => {
    const newEmoji = { id: Date.now() + Math.random(), emoji, left: 10 + Math.random() * 80 };
    setFloatingEmojis((prev) => [...prev, newEmoji]);
    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((e) => e.id !== newEmoji.id));
    }, 4000);
  }, []);

  const handleReaction = (emoji: string) => {
    triggerLocalReaction(emoji);
    const encoder = new TextEncoder();
    send(encoder.encode(emoji), { reliable: true });
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setToastMsg("Invite link copied!");
    setIsInviteMenuOpen(false);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const copyInviteCode = () => {
    // The roomId is the last part of the URL
    const parts = window.location.pathname.split('/');
    const roomId = parts[parts.length - 1];
    navigator.clipboard.writeText(roomId);
    setToastMsg("Invite code copied!");
    setIsInviteMenuOpen(false);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const screenShareTracks = tracks.filter((t) => t.source === Track.Source.ScreenShare);
  const cameraTracks = tracks.filter((t) => t.source === Track.Source.Camera);

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden", position: "relative" }}>
      
      {/* Toast */}
      {toastMsg && (
        <div style={{
          position: "absolute", top: "32px", left: "50%", transform: "translateX(-50%)",
          background: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(12px)", border: "1px solid var(--primary-cyan)",
          color: "white", padding: "12px 24px", borderRadius: "100px", zIndex: 100,
          boxShadow: "0 10px 30px rgba(34, 211, 238, 0.2)", fontWeight: "500"
        }}>
          {toastMsg}
        </div>
      )}

      {/* Unmute Request Modal */}
      {incomingRequest && (
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 200,
          background: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div className="glass-panel" style={{ padding: "32px", textAlign: "center", maxWidth: "400px", border: "1px solid var(--primary-cyan)" }}>
            {incomingRequest.type === 'mic' ? <Mic size={48} style={{ color: "var(--primary-cyan)", marginBottom: "16px" }} /> : <Video size={48} style={{ color: "var(--primary-cyan)", marginBottom: "16px" }} />}
            <h2 style={{ marginBottom: "8px" }}>The Host is requesting you to unmute your {incomingRequest.type === 'mic' ? 'microphone' : 'video'}.</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>Do you want to allow this?</p>
            <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
              <button className="btn-glass" onClick={() => handleRequestResponse(false)} style={{ color: "var(--danger)", border: "1px solid var(--danger)" }}>Decline</button>
              <button className="btn-primary" onClick={() => handleRequestResponse(true)}>Accept</button>
            </div>
          </div>
        </div>
      )}

      {/* Host End Meeting Modal */}
      {showEndMeetingModal && (
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 200,
          background: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div className="glass-panel" style={{ padding: "32px", textAlign: "center", maxWidth: "400px", border: "1px solid var(--danger)" }}>
            <LogOut size={48} style={{ color: "var(--danger)", marginBottom: "16px" }} />
            <h2 style={{ marginBottom: "8px" }}>Leave Meeting</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>You are the host. Do you want to leave the meeting, or end it for everyone?</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <button className="btn-primary" style={{ background: "var(--danger)", color: "white", border: "none" }} onClick={endMeetingForAll}>End Meeting for All</button>
              <button className="btn-glass" onClick={() => room.disconnect()}>Just Leave</button>
              <button className="btn-glass" style={{ border: "none", marginTop: "8px" }} onClick={() => setShowEndMeetingModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Meeting Ended Alert (Guest) */}
      {meetingEndedMessage && (
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 300,
          background: "rgba(15, 23, 42, 0.9)", backdropFilter: "blur(12px)",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div className="glass-panel" style={{ padding: "40px", textAlign: "center" }}>
            <LogOut size={64} style={{ color: "var(--primary-cyan)", marginBottom: "16px" }} />
            <h1 style={{ marginBottom: "8px" }}>Meeting Ended</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>{meetingEndedMessage}</p>
          </div>
        </div>
      )}

      {/* Floating Emojis */}
      <div style={{ position: "absolute", bottom: "100px", left: 0, width: "100%", height: "50%", pointerEvents: "none", zIndex: 40, overflow: "hidden" }}>
        {floatingEmojis.map(item => (
          <div key={item.id} className="floating-emoji" style={{ left: `${item.left}%` }}>
            {item.emoji}
          </div>
        ))}
      </div>

      {/* Main Video Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", padding: "16px", overflow: "hidden" }}>
        
        {/* Video Area (Grid or PiP) */}
        <div style={{ flex: 1, borderRadius: "24px", overflow: "hidden", position: "relative", background: "black" }} className="glass-panel">
          {screenShareTracks.length > 0 ? (
            <div style={{ width: "100%", height: "100%", position: "relative" }}>
              {/* Screen Share Background */}
              <div style={{ width: "100%", height: "100%" }}>
                <ParticipantTile trackRef={screenShareTracks[0]} />
              </div>
              
              {/* Floating Camera PiP Overlay */}
              <div style={{
                position: "absolute", top: "16px", right: "16px", width: "320px", maxHeight: "calc(100% - 32px)",
                background: "var(--glass-bg)", backdropFilter: "blur(16px)", borderRadius: "20px",
                border: "1px solid var(--glass-border)", boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
                padding: "8px", overflowY: "auto", zIndex: 20
              }}>
                <GridLayout tracks={cameraTracks} style={{ width: "100%", height: `${Math.max(200, cameraTracks.length * 150)}px` }}>
                  <ParticipantTile />
                </GridLayout>
              </div>
            </div>
          ) : (
            <GridLayout tracks={cameraTracks} style={{ height: "100%", width: "100%" }}>
              <ParticipantTile />
            </GridLayout>
          )}
        </div>

        {/* Custom Control Bar */}
        <div style={{ 
          marginTop: "16px", padding: "16px", display: "flex", justifyContent: "center", alignItems: "center", gap: "16px" 
        }} className="glass-panel control-bar-container">
          
          <ControlBar variation="minimal" controls={{ camera: true, microphone: true, screenShare: true, leave: false, chat: false }} />
          
          <button onClick={handleLeaveButtonClick} className="btn-glass" style={{ background: "rgba(255, 0, 0, 0.2)", color: "#ff6b6b", height: "40px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }} title="Leave Meeting">
            <LogOut size={20} />
          </button>
          
          <div style={{ width: "1px", height: "32px", background: "var(--glass-border)", margin: "0 8px" }}></div>
          
          <Recorder />

          {/* Invite Menu */}
          <div style={{ position: "relative" }}>
            <button 
              onClick={() => setIsInviteMenuOpen(!isInviteMenuOpen)} 
              className={`btn-glass ${isInviteMenuOpen ? 'active' : ''}`} 
              title="Invite Options"
            >
              <LinkIcon size={20} />
            </button>
            
            {isInviteMenuOpen && (
              <div style={{
                position: "absolute", bottom: "60px", left: "50%", transform: "translateX(-50%)",
                background: "var(--glass-bg)", backdropFilter: "blur(20px)",
                border: "1px solid var(--glass-border)", borderRadius: "12px",
                padding: "8px", display: "flex", flexDirection: "column", gap: "8px",
                minWidth: "160px", zIndex: 100, boxShadow: "0 10px 40px rgba(0,0,0,0.5)"
              }}>
                <button onClick={copyInviteLink} className="invite-option-btn">Copy Link (URL)</button>
                <button onClick={copyInviteCode} className="invite-option-btn">Copy Room Code</button>
              </div>
            )}
          </div>

          <button onClick={() => handleReaction("💖")} className="btn-glass" title="Send Heart">
            <Smile size={20} />
          </button>
          
          <button 
            onClick={toggleHand} 
            className={`btn-glass ${localParticipant && raisedHands.has(localParticipant.identity) ? 'active' : ''}`} 
            title="Raise Hand"
            style={{ background: localParticipant && raisedHands.has(localParticipant.identity) ? "rgba(250, 204, 21, 0.2)" : "", color: localParticipant && raisedHands.has(localParticipant.identity) ? "#facc15" : "" }}
          >
            <Hand size={20} />
          </button>
          
          <button 
            onClick={() => setSidebarTab(sidebarTab === "participants" ? null : "participants")}
            className={`btn-glass ${sidebarTab === "participants" ? 'active' : ''}`}
            title="Participants"
            style={{ background: sidebarTab === "participants" ? "var(--primary-cyan)" : "" }}
          >
            <Users size={20} />
            <span style={{ marginLeft: "8px", fontSize: "14px", fontWeight: "bold" }}>{participants.length}</span>
          </button>

          <button 
            onClick={() => setSidebarTab(sidebarTab === "chat" ? null : "chat")}
            className={`btn-glass ${sidebarTab === "chat" ? 'active' : ''}`}
            title="Toggle Chat"
            style={{ background: sidebarTab === "chat" ? "var(--primary-cyan)" : "" }}
          >
            <MessageSquare size={20} />
          </button>

        </div>
      </div>

      {/* Sidebar */}
      <div 
        className="chat-sidebar"
        style={{ 
        width: sidebarTab ? "320px" : "0px", 
        transition: "width 0.3s ease, right 0.3s ease", 
        overflow: "hidden",
        borderLeft: sidebarTab ? "1px solid var(--glass-border)" : "none",
        background: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(16px)"
      }}>
        <div style={{ width: "320px", height: "100%", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--glass-border)" }}>
            <h3 style={{ margin: 0, fontWeight: "600" }}>
              {sidebarTab === "chat" ? "Meeting Chat" : "Participants"}
            </h3>
            <button onClick={() => setSidebarTab(null)} style={{ color: "var(--text-secondary)" }}>
              <X size={20} />
            </button>
          </div>
          <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
            {sidebarTab === "chat" ? (
              <>
                {isChatMuted && (
                  <div style={{
                    position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
                    background: "rgba(15, 23, 42, 0.9)", backdropFilter: "blur(4px)", zIndex: 50,
                    display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column",
                    padding: "24px", textAlign: "center"
                  }}>
                    <MessageSquareOff size={48} style={{ color: "var(--danger)", marginBottom: "16px" }} />
                    <h4 style={{ margin: 0, marginBottom: "8px" }}>Chat Disabled</h4>
                    <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>The host has disabled your ability to send messages.</p>
                  </div>
                )}
                <Chat />
              </>
            ) : (
              <div style={{ padding: "16px", overflowY: "auto", height: "100%" }}>
                {participants.map(p => (
                  <div key={p.identity} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", background: "rgba(255,255,255,0.05)", borderRadius: "12px", marginBottom: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--primary-cyan)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", marginRight: "12px" }}>
                        {p.name ? p.name[0].toUpperCase() : "?"}
                      </div>
                      <div>
                        <div style={{ fontWeight: "600", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                          {p.name || p.identity}
                          {localParticipant?.identity === p.identity && " (You)"}
                          {(() => {
                            try { return JSON.parse(p.metadata || "{}").isHost ? " 👑" : ""; } catch { return ""; }
                          })()}
                          {raisedHands.has(p.identity) && <Hand size={14} color="#facc15" />}
                        </div>
                        <div style={{ fontSize: "12px", color: p.isMicrophoneEnabled ? "var(--primary-cyan)" : "var(--danger)" }}>
                          {p.isMicrophoneEnabled ? "Mic On" : "Muted"}
                        </div>
                      </div>
                    </div>
                    
                    {/* Host Moderation Controls */}
                    {isHost && localParticipant?.identity !== p.identity && (
                      <div style={{ display: "flex", gap: "4px" }}>
                        {p.isMicrophoneEnabled ? (
                          <button onClick={() => executeHostCommand(p.identity, "mute-mic")} className="host-action-btn" title="Mute Mic">
                            <MicOff size={14} />
                          </button>
                        ) : (
                          <button onClick={() => executeHostCommand(p.identity, "request-unmute-mic")} className="host-request-btn" title="Request Unmute Mic">
                            <Mic size={14} />
                          </button>
                        )}
                        
                        {p.isCameraEnabled ? (
                          <button onClick={() => executeHostCommand(p.identity, "mute-video")} className="host-action-btn" title="Stop Video">
                            <VideoOff size={14} />
                          </button>
                        ) : (
                          <button onClick={() => executeHostCommand(p.identity, "request-unmute-video")} className="host-request-btn" title="Request Video">
                            <Video size={14} />
                          </button>
                        )}
                        
                        <button onClick={() => executeHostCommand(p.identity, "mute-chat")} className="host-action-btn" title="Disable Chat">
                          <MessageSquareOff size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <RoomAudioRenderer />

      <style jsx global>{`
        /* Override LiveKit default styles to match our Water UI */
        .lk-control-bar {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .lk-button {
          background: var(--glass-bg) !important;
          border: 1px solid var(--glass-border) !important;
          border-radius: 50% !important;
          color: white !important;
          transition: all 0.3s ease !important;
        }
        .lk-button:hover {
          background: rgba(255,255,255,0.15) !important;
          transform: scale(1.05);
        }
        .lk-button[aria-pressed="true"] {
          background: var(--danger) !important;
        }
        .lk-chat {
          background: transparent !important;
          height: 100% !important;
        }
        .lk-chat-form {
          border-top: 1px solid var(--glass-border) !important;
          background: rgba(0,0,0,0.2) !important;
        }
        .lk-chat-form-input {
          background: rgba(255,255,255,0.05) !important;
          color: white !important;
          border-radius: 12px !important;
        }
        .lk-chat-message {
          color: white !important;
        }
        .lk-participant-tile {
          border-radius: 16px !important;
          overflow: hidden !important;
          box-shadow: inset 0 0 20px rgba(0,0,0,0.5) !important;
        }
        
        @keyframes floatUp {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-200px) scale(1.5); opacity: 0; }
        }
        .floating-emoji {
          position: absolute;
          bottom: 0;
          font-size: 32px;
          animation: floatUp 4s ease-out forwards;
        }
        .invite-option-btn {
          background: transparent;
          border: none;
          color: white;
          padding: 10px 12px;
          border-radius: 8px;
          text-align: left;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .invite-option-btn:hover {
          background: rgba(255,255,255,0.1);
        }
        .host-action-btn {
          background: rgba(255,0,0,0.1);
          border: 1px solid rgba(255,0,0,0.3);
          color: #ff6b6b;
          border-radius: 6px;
          padding: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .host-action-btn:hover {
          background: rgba(255,0,0,0.3);
        }
        .host-request-btn {
          background: rgba(34, 211, 238, 0.1);
          border: 1px solid rgba(34, 211, 238, 0.3);
          color: var(--primary-cyan);
          border-radius: 6px;
          padding: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .host-request-btn:hover {
          background: rgba(34, 211, 238, 0.3);
          box-shadow: 0 0 10px rgba(34, 211, 238, 0.2);
        }
      `}</style>
    </div>
  );
}
