"use client";

import { useTracks, GridLayout, ParticipantTile, RoomAudioRenderer, ControlBar, Chat, useParticipants, useDataChannel, useLocalParticipant, useRoomContext } from "@livekit/components-react";
import { Track, RoomEvent } from "livekit-client";
import { useState, useCallback, useEffect } from "react";
import Recorder from "./Recorder";
import { MessageSquare, X, Users, Link as LinkIcon, Smile, MicOff, VideoOff, MessageSquareOff, MessageSquare as MessageSquareOn, Hand, Mic, Video, LogOut, Crown } from "lucide-react";

const REACTIONS = ["❤️", "👍", "👏", "🎉", "😂", "😮", "🔥", "🙌", "💯", "🤔"];

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
  const [isEmojiMenuOpen, setIsEmojiMenuOpen] = useState(false);
  const [isChatMuted, setIsChatMuted] = useState(false);
  const [raisedHands, setRaisedHands] = useState<Set<string>>(new Set());
  // Host-side tracking of which participants currently have chat disabled.
  const [chatDisabledFor, setChatDisabledFor] = useState<Set<string>>(new Set());
  const [incomingRequest, setIncomingRequest] = useState<{ hostIdentity: string, type: 'mic' | 'video' } | null>(null);
  const [showEndMeetingModal, setShowEndMeetingModal] = useState(false);
  const [meetingEndedMessage, setMeetingEndedMessage] = useState("");
  const room = useRoomContext();

  const showToast = useCallback((msg: string, duration = 4000) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), duration);
  }, []);

  // Listen for participant departures
  useEffect(() => {
    const handleParticipantDisconnected = (participant: any) => {
      // Clean up any state we were tracking for this participant.
      setRaisedHands(prev => { const n = new Set(prev); n.delete(participant.identity); return n; });
      setChatDisabledFor(prev => { const n = new Set(prev); n.delete(participant.identity); return n; });
      if (isHost) {
        showToast(`${participant.name || participant.identity} left the meeting.`);
      }
    };
    room.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
    return () => { room.off(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected); };
  }, [room, isHost, showToast]);

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
        setMeetingEndedMessage("This meeting was ended by the host.");
        setTimeout(() => { room.disconnect(); }, 3000);
        return;
      }

      // Targeted commands
      if (localParticipant && command.target === localParticipant.identity) {
        if (command.action === "mute-mic") {
          localParticipant.setMicrophoneEnabled(false);
          showToast("The host muted your microphone.");
        } else if (command.action === "mute-video") {
          localParticipant.setCameraEnabled(false);
          showToast("The host turned off your camera.");
        } else if (command.action === "mute-chat") {
          setIsChatMuted(true);
          showToast("The host disabled your chat.");
        } else if (command.action === "enable-chat") {
          setIsChatMuted(false);
          showToast("The host re-enabled your chat.");
        } else if (command.action === "request-unmute-mic") {
          setIncomingRequest({ hostIdentity: command.sender, type: 'mic' });
        } else if (command.action === "request-unmute-video") {
          setIncomingRequest({ hostIdentity: command.sender, type: 'video' });
        } else if (command.action === "request-rejected") {
          showToast(`Participant declined your ${command.type} request.`);
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
      showToast(`Request sent.`, 2000);
    }
  };

  // Toggle a participant's chat on/off (host only). This is the fix for the
  // previously broken re-enable: we track who is disabled and send the matching
  // enable-chat / mute-chat command, then update the host's local view.
  const toggleParticipantChat = (identity: string) => {
    const currentlyDisabled = chatDisabledFor.has(identity);
    executeHostCommand(identity, currentlyDisabled ? "enable-chat" : "mute-chat");
    setChatDisabledFor(prev => {
      const n = new Set(prev);
      if (currentlyDisabled) n.delete(identity);
      else n.add(identity);
      return n;
    });
    showToast(currentlyDisabled ? "Chat enabled for participant." : "Chat disabled for participant.", 2000);
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
    if (!isRaised) showToast("You raised your hand ✋", 2000);
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
    if (isHost) setShowEndMeetingModal(true);
    else room.disconnect();
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
    const newEmoji = { id: Date.now() + Math.random(), emoji, left: 8 + Math.random() * 84 };
    setFloatingEmojis((prev) => [...prev, newEmoji]);
    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((e) => e.id !== newEmoji.id));
    }, 4000);
  }, []);

  const handleReaction = (emoji: string) => {
    triggerLocalReaction(emoji);
    const encoder = new TextEncoder();
    send(encoder.encode(emoji), { reliable: true });
    setIsEmojiMenuOpen(false);
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast("Invite link copied!", 3000);
    setIsInviteMenuOpen(false);
  };

  const copyInviteCode = () => {
    const parts = window.location.pathname.split('/');
    const roomId = parts[parts.length - 1];
    navigator.clipboard.writeText(roomId);
    showToast("Room code copied!", 3000);
    setIsInviteMenuOpen(false);
  };

  const closeMenus = () => {
    setIsInviteMenuOpen(false);
    setIsEmojiMenuOpen(false);
  };

  const screenShareTracks = tracks.filter((t) => t.source === Track.Source.ScreenShare);
  const cameraTracks = tracks.filter((t) => t.source === Track.Source.Camera);
  const handRaised = !!(localParticipant && raisedHands.has(localParticipant.identity));

  return (
    <div className="room-shell">

      {/* Toast */}
      {toastMsg && <div className="room-toast">{toastMsg}</div>}

      {/* Unmute Request Modal */}
      {incomingRequest && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ borderColor: "var(--primary-cyan)" }}>
            <div className="modal-icon cyan">
              {incomingRequest.type === 'mic' ? <Mic size={28} /> : <Video size={28} />}
            </div>
            <h2 className="modal-title">Unmute request</h2>
            <p className="modal-text">The host is asking you to turn on your {incomingRequest.type === 'mic' ? 'microphone' : 'camera'}. Allow?</p>
            <div className="modal-actions-row">
              <button className="btn-ghost danger" onClick={() => handleRequestResponse(false)}>Decline</button>
              <button className="btn-primary" onClick={() => handleRequestResponse(true)}>Accept</button>
            </div>
          </div>
        </div>
      )}

      {/* Host End Meeting Modal */}
      {showEndMeetingModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ borderColor: "var(--danger)" }}>
            <div className="modal-icon danger"><LogOut size={28} /></div>
            <h2 className="modal-title">Leave meeting</h2>
            <p className="modal-text">You are the host. Leave the meeting on your own, or end it for everyone?</p>
            <div className="modal-actions-col">
              <button className="btn-solid-danger" onClick={endMeetingForAll}>End meeting for all</button>
              <button className="btn-ghost" onClick={() => room.disconnect()}>Just leave</button>
              <button className="btn-ghost subtle" onClick={() => setShowEndMeetingModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Meeting Ended Alert (Guest) */}
      {meetingEndedMessage && (
        <div className="modal-overlay strong">
          <div className="modal-card">
            <div className="modal-icon cyan large"><LogOut size={34} /></div>
            <h1 className="modal-title" style={{ fontSize: "1.8rem" }}>Meeting ended</h1>
            <p className="modal-text">{meetingEndedMessage}</p>
          </div>
        </div>
      )}

      {/* Floating Emojis */}
      <div className="reaction-layer">
        {floatingEmojis.map(item => (
          <div key={item.id} className="floating-emoji" style={{ left: `${item.left}%` }}>
            {item.emoji}
          </div>
        ))}
      </div>

      {/* Main Video Area */}
      <div className="room-main">

        {/* Video Area (Grid or PiP) */}
        <div className="video-stage">
          {screenShareTracks.length > 0 ? (
            <div style={{ width: "100%", height: "100%", position: "relative" }}>
              <div style={{ width: "100%", height: "100%" }}>
                <ParticipantTile trackRef={screenShareTracks[0]} />
              </div>
              <div className="pip-overlay">
                <GridLayout tracks={cameraTracks} style={{ width: "100%", height: `${Math.max(180, cameraTracks.length * 140)}px` }}>
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

        {/* Control Dock */}
        <div className="control-dock glass-panel">

          <div className="dock-group">
            <ControlBar variation="minimal" controls={{ camera: true, microphone: true, screenShare: true, leave: false, chat: false }} />
          </div>

          <span className="dock-divider" />

          <div className="dock-group">
            <Recorder />

            {/* Reactions */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => { const next = !isEmojiMenuOpen; closeMenus(); setIsEmojiMenuOpen(next); }}
                className={`ctrl-btn ${isEmojiMenuOpen ? 'active' : ''}`}
                title="Send a reaction"
                aria-label="Send a reaction"
              >
                <Smile size={20} />
              </button>
              {isEmojiMenuOpen && (
                <div className="popover">
                  <div className="emoji-grid">
                    {REACTIONS.map(e => (
                      <button key={e} className="emoji-btn" onClick={() => handleReaction(e)} aria-label={`Send ${e}`}>{e}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Raise hand */}
            <button
              onClick={toggleHand}
              className={`ctrl-btn warn ${handRaised ? 'active' : ''}`}
              title={handRaised ? "Lower hand" : "Raise hand"}
              aria-label={handRaised ? "Lower hand" : "Raise hand"}
              aria-pressed={handRaised}
            >
              <Hand size={20} />
            </button>

            {/* Invite */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => { const next = !isInviteMenuOpen; closeMenus(); setIsInviteMenuOpen(next); }}
                className={`ctrl-btn ${isInviteMenuOpen ? 'active' : ''}`}
                title="Invite"
                aria-label="Invite options"
              >
                <LinkIcon size={20} />
              </button>
              {isInviteMenuOpen && (
                <div className="popover">
                  <button onClick={copyInviteLink} className="menu-item">Copy meeting link</button>
                  <button onClick={copyInviteCode} className="menu-item">Copy room code</button>
                </div>
              )}
            </div>
          </div>

          <span className="dock-divider" />

          <div className="dock-group">
            <button
              onClick={() => setSidebarTab(sidebarTab === "participants" ? null : "participants")}
              className={`ctrl-btn ctrl-pill ${sidebarTab === "participants" ? 'active' : ''}`}
              title="Participants"
              aria-label="Toggle participants panel"
            >
              <Users size={20} />
              <span className="ctrl-count">{participants.length}</span>
            </button>

            <button
              onClick={() => setSidebarTab(sidebarTab === "chat" ? null : "chat")}
              className={`ctrl-btn ${sidebarTab === "chat" ? 'active' : ''}`}
              title="Chat"
              aria-label="Toggle chat panel"
            >
              <MessageSquare size={20} />
            </button>

            <button onClick={handleLeaveButtonClick} className="ctrl-btn danger" title="Leave meeting" aria-label="Leave meeting">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div
        className="chat-sidebar"
        style={{
          width: sidebarTab ? "340px" : "0px",
          transition: "width 0.3s ease",
          overflow: "hidden",
          borderLeft: sidebarTab ? "1px solid var(--glass-border)" : "none",
          background: "rgba(10, 16, 30, 0.72)",
          backdropFilter: "blur(18px)",
        }}
      >
        <div className="side-panel" style={{ width: "340px" }}>
          <div className="side-head">
            <h3 className="side-title">
              {sidebarTab === "chat" ? "Meeting chat" : `Participants (${participants.length})`}
            </h3>
            <button className="icon-btn" onClick={() => setSidebarTab(null)} aria-label="Close panel">
              <X size={20} />
            </button>
          </div>
          <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
            {sidebarTab === "chat" ? (
              <>
                {isChatMuted && (
                  <div className="chat-blocked">
                    <div className="modal-icon danger"><MessageSquareOff size={26} /></div>
                    <h4 style={{ margin: "4px 0" }}>Chat disabled</h4>
                    <p style={{ color: "var(--text-secondary)", fontSize: "14px", maxWidth: "220px" }}>The host has turned off your ability to send messages.</p>
                  </div>
                )}
                <Chat />
              </>
            ) : (
              <div className="pt-list">
                {participants.map(p => {
                  const pIsHost = (() => { try { return JSON.parse(p.metadata || "{}").isHost; } catch { return false; } })();
                  const isSelf = localParticipant?.identity === p.identity;
                  const chatOff = chatDisabledFor.has(p.identity);
                  return (
                    <div key={p.identity} className="pt-row">
                      <div className="pt-left">
                        <div className="pt-avatar">{p.name ? p.name[0].toUpperCase() : "?"}</div>
                        <div className="pt-meta">
                          <div className="pt-name">
                            <span className="pt-name-text">{p.name || p.identity}{isSelf && " (You)"}</span>
                            {pIsHost && <Crown size={13} color="#facc15" />}
                            {raisedHands.has(p.identity) && <Hand size={13} color="#facc15" />}
                          </div>
                          <div className="pt-status" style={{ color: p.isMicrophoneEnabled ? "var(--success)" : "var(--danger)" }}>
                            {p.isMicrophoneEnabled ? "Mic on" : "Muted"}
                          </div>
                        </div>
                      </div>

                      {/* Host Moderation Controls */}
                      {isHost && !isSelf && (
                        <div className="pt-actions">
                          {p.isMicrophoneEnabled ? (
                            <button onClick={() => executeHostCommand(p.identity, "mute-mic")} className="mod-btn danger" title="Mute mic"><MicOff size={14} /></button>
                          ) : (
                            <button onClick={() => executeHostCommand(p.identity, "request-unmute-mic")} className="mod-btn cyan" title="Ask to unmute"><Mic size={14} /></button>
                          )}
                          {p.isCameraEnabled ? (
                            <button onClick={() => executeHostCommand(p.identity, "mute-video")} className="mod-btn danger" title="Stop video"><VideoOff size={14} /></button>
                          ) : (
                            <button onClick={() => executeHostCommand(p.identity, "request-unmute-video")} className="mod-btn cyan" title="Ask for video"><Video size={14} /></button>
                          )}
                          <button
                            onClick={() => toggleParticipantChat(p.identity)}
                            className={`mod-btn ${chatOff ? 'cyan' : 'danger'}`}
                            title={chatOff ? "Enable chat" : "Disable chat"}
                          >
                            {chatOff ? <MessageSquareOn size={14} /> : <MessageSquareOff size={14} />}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click-away backdrop for popovers */}
      {(isInviteMenuOpen || isEmojiMenuOpen) && (
        <div onClick={closeMenus} style={{ position: "fixed", inset: 0, zIndex: 90 }} />
      )}

      <RoomAudioRenderer />

      <style jsx global>{`
        .lk-control-bar { background: transparent !important; border: none !important; box-shadow: none !important; padding: 0 !important; gap: 10px !important; }
        .lk-button {
          background: var(--glass-bg) !important;
          border: 1px solid var(--glass-border) !important;
          border-radius: 14px !important;
          color: white !important;
          width: 46px; height: 46px;
          transition: all 0.2s ease !important;
        }
        .lk-button:hover { background: rgba(255,255,255,0.12) !important; transform: translateY(-2px); }
        .lk-button[aria-pressed="true"] { background: var(--danger) !important; border-color: transparent !important; }
        .lk-chat { background: transparent !important; height: 100% !important; }
        .lk-chat-form { border-top: 1px solid var(--glass-border) !important; background: rgba(0,0,0,0.2) !important; }
        .lk-chat-form-input { background: rgba(255,255,255,0.05) !important; color: white !important; border-radius: 12px !important; border: 1px solid var(--glass-border) !important; }
        .lk-chat-message { color: white !important; }
        .lk-participant-tile { border-radius: 18px !important; overflow: hidden !important; box-shadow: inset 0 0 24px rgba(0,0,0,0.45) !important; }

        @keyframes floatUp {
          0% { transform: translateY(0) scale(0.8); opacity: 0; }
          15% { opacity: 1; transform: translateY(-20px) scale(1); }
          100% { transform: translateY(-240px) scale(1.4); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
