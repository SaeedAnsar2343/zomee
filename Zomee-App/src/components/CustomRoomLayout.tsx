"use client";

import { useTracks, GridLayout, ParticipantTile, RoomAudioRenderer, ControlBar, useParticipants, useDataChannel, useLocalParticipant, useRoomContext, useChat } from "@livekit/components-react";
import { Track, RoomEvent, ConnectionQuality, Participant, Room } from "livekit-client";
import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Recorder from "./Recorder";
import { MessageSquare, X, Users, Link as LinkIcon, Smile, MicOff, VideoOff, MessageSquareOff, Hand, Mic, Video, LogOut, FlipHorizontal, MonitorUp, MoreVertical, ShieldCheck, CheckCircle2 } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const HandOverlay = ({ participant, trackRef, raisedHands }: { participant?: any, trackRef?: any, raisedHands: Set<string> }) => {
  // trackRef can contain participant either directly or inside trackRef.participant
  const p = participant || trackRef?.participant;
  if (!p || !raisedHands.has(p.identity)) return null;
  return (
    <div style={{ position: "absolute", top: "16px", right: "16px", zIndex: 9999, background: "rgba(250, 204, 21, 0.2)", padding: "12px", borderRadius: "50%", border: "2px solid rgba(250, 204, 21, 0.5)", boxShadow: "0 0 20px rgba(250, 204, 21, 0.6)", animation: "pulseHand 1.5s infinite" }}>
      <Hand size={32} color="#facc15" />
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomGridTile = ({ trackRef, raisedHands, ...props }: any) => {
  return (
    <div {...props} style={{ ...props.style, position: "relative", borderRadius: "16px", overflow: "hidden" }}>
      <ParticipantTile trackRef={trackRef} style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }} />
      <HandOverlay participant={trackRef?.participant} trackRef={trackRef} raisedHands={raisedHands} />
    </div>
  );
};

export default function CustomRoomLayout() {
  const cameraTracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: true }],
    { onlySubscribed: false }
  );

  const screenShareTracks = useTracks(
    [{ source: Track.Source.ScreenShare, withPlaceholder: false }],
    { onlySubscribed: false }
  );

  const [currentPage, setCurrentPage] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [shuffledTracks, setShuffledTracks] = useState<any[]>([]);

  useEffect(() => {
    const updateShuffled = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isTrackHost = (trackRef: any) => {
        try {
           return JSON.parse(trackRef.participant?.metadata || "{}").isHost;
        } catch { return false; }
      };

      const hostTracks = cameraTracks.filter(isTrackHost);
      const guestTracks = cameraTracks.filter((t) => !isTrackHost(t));
      
      for (let i = guestTracks.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [guestTracks[i], guestTracks[j]] = [guestTracks[j], guestTracks[i]];
      }

      setShuffledTracks([...hostTracks, ...guestTracks]);
    };

    updateShuffled();
    const intervalId = setInterval(updateShuffled, 60000);
    return () => clearInterval(intervalId);
  }, [cameraTracks]);

  const ITEMS_PER_PAGE = 4;
  const totalPages = Math.ceil(shuffledTracks.length / ITEMS_PER_PAGE);
  const paginatedTracks = shuffledTracks.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE);

  // Ensure current page is valid if participants leave
  useEffect(() => {
    if (currentPage >= totalPages && totalPages > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentPage(totalPages - 1);
    }
  }, [totalPages, currentPage]);

  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();
  const router = useRouter();
  
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
  const [mutedChats, setMutedChats] = useState<Set<string>>(new Set());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNoiseSuppressionEnabled, setIsNoiseSuppressionEnabled] = useState(true);
  const [isHDVideoEnabled, setIsHDVideoEnabled] = useState(true);
  const [isMirrorVideoEnabled, setIsMirrorVideoEnabled] = useState(false);
  const [isDataSaverEnabled, setIsDataSaverEnabled] = useState(false);
  const [incomingRequest, setIncomingRequest] = useState<{ hostIdentity: string, type: 'mic' | 'video' } | null>(null);
  const [showEndMeetingModal, setShowEndMeetingModal] = useState(false);
  const [showGuestLeaveModal, setShowGuestLeaveModal] = useState(false);
  const [meetingEndedDuration, setMeetingEndedDuration] = useState("");
  const [meetingStartTime, setMeetingStartTime] = useState<number>(() => Date.now());
  const [timeRemaining, setTimeRemaining] = useState<number>(3600); // 60 minutes
  const [isControlBarOpen, setIsControlBarOpen] = useState(true);
  const [lastReadCount, setLastReadCount] = useState(0);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  const resetHideTimer = useCallback(() => {
    setIsControlBarOpen(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setIsControlBarOpen(false);
    }, 3000);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    resetHideTimer();
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [resetHideTimer]);

  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(""), 2000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  const room = useRoomContext();
  const { chatMessages, send: sendChatMessage } = useChat();
  const [chatInput, setChatInput] = useState("");
  const [systemMessages, setSystemMessages] = useState<{id: string, timestamp: number, message: string}[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [syncedHistory, setSyncedHistory] = useState<any[]>([]);

  const addSystemMessage = useCallback((msg: string) => {
    setSystemMessages(prev => [...prev, { id: Math.random().toString(), timestamp: Date.now(), message: msg }]);
  }, []);

  const allMessages = [
    ...syncedHistory,
    ...chatMessages.map(m => ({ id: m.id, timestamp: m.timestamp, message: m.message, sender: m.from?.name || m.from?.identity, isSystem: false, isSelf: m.from?.identity === localParticipant?.identity })),
    ...systemMessages.map(m => ({ ...m, isSystem: true, isSelf: false, sender: "System" }))
  ];

  // Deduplicate by ID and sort
  const combinedMessages = Array.from(new Map(allMessages.map(m => [m.id, m])).values())
    .sort((a, b) => a.timestamp - b.timestamp);

  useEffect(() => {
    if (sidebarTab === "chat") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLastReadCount(combinedMessages.length);
    }
  }, [sidebarTab, combinedMessages.length]);

  const unreadCount = sidebarTab === "chat" ? 0 : Math.max(0, combinedMessages.length - lastReadCount);

  // Camera Switcher Logic
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);

  useEffect(() => {
    const getDevices = async () => {
      try {
        const devices = await Room.getLocalDevices('videoinput');
        setVideoDevices(devices);
      } catch (e) {
        console.error("Error fetching video devices", e);
      }
    };
    getDevices();
  }, [room]);

  const switchCamera = async () => {
    if (videoDevices.length > 1) {
      const nextIndex = (currentCameraIndex + 1) % videoDevices.length;
      setCurrentCameraIndex(nextIndex);
      await room.switchActiveDevice('videoinput', videoDevices[nextIndex].deviceId);
    }
  };

  // Data channel for Host Commands
  const { send: sendHostCommand } = useDataChannel("host-commands", (msg) => {
    const decoder = new TextDecoder();
    try {
      const command = JSON.parse(decoder.decode(msg.payload));
      
      // Global commands
      if (command.action === "raise-hand") {
        setRaisedHands(prev => { const n = new Set(prev); n.add(command.identity); return n; });
        addSystemMessage(`${command.senderName || command.identity} raised their hand! ✋`);
        if (isHost && command.identity !== localParticipant?.identity) {
          setToastMsg(`${command.senderName || command.identity} raised their hand! ✋`);
          setTimeout(() => setToastMsg(""), 4000);
        }
        return;
      }
      if (command.action === "lower-hand") {
        setRaisedHands(prev => { const n = new Set(prev); n.delete(command.identity); return n; });
        return;
      } else if (command.action === "meeting-ended") {
        const duration = Math.floor((Date.now() - meetingStartTime) / 1000);
        const m = Math.floor(duration / 60);
        const s = duration % 60;
        setMeetingEndedDuration(`${m}m ${s}s`);
        setTimeout(() => {
          room.disconnect();
          router.push("/");
        }, 4000);
        return;
      } else if (command.action === "sync-timer") {
        if (!isHost && command.startTime) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setMeetingStartTime(command.startTime);
        }
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
        } else if (command.action === "unmute-chat") {
          setIsChatMuted(false);
          setToastMsg("The Host has enabled your chat.");
          setTimeout(() => setToastMsg(""), 4000);
        } else if (command.action === "request-unmute-mic") {
          setIncomingRequest({ hostIdentity: command.sender, type: 'mic' });
        } else if (command.action === "request-unmute-video") {
          setIncomingRequest({ hostIdentity: command.sender, type: 'video' });
        } else if (command.action === "request-rejected") {
          setToastMsg(`Participant declined your ${command.type} request.`);
          setTimeout(() => setToastMsg(""), 4000);
        } else if (command.action === "sync-history" && command.history) {
          // New joiner receives history from Host
          setSyncedHistory(prev => {
            const merged = [...prev, ...command.history];
            return Array.from(new Map(merged.map(m => [(m as {id:string}).id, m])).values());
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
  });
  const handleConfirmEndMeeting = () => {
    const duration = Math.floor((Date.now() - meetingStartTime) / 1000);
    const m = Math.floor(duration / 60);
    const s = duration % 60;
    setMeetingEndedDuration(`${m}m ${s}s`);
    setShowEndMeetingModal(false);
    
    const encoder = new TextEncoder();
    sendHostCommand(encoder.encode(JSON.stringify({ action: "meeting-ended" })), { reliable: true });
    
    setTimeout(() => {
      room.disconnect();
      router.push("/");
    }, 4000);
  };

  const executeHostCommand = (targetIdentity: string | null, action: string, type?: string) => {
    const encoder = new TextEncoder();
    sendHostCommand(encoder.encode(JSON.stringify({ 
      sender: localParticipant?.identity, 
      senderName: localParticipant?.name || localParticipant?.identity,
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


  // Timer logic & Persistence
  useEffect(() => {
    if (isHost && typeof window !== "undefined") {
      const roomId = window.location.pathname.split('/').pop();
      if (roomId) {
        const storedTime = localStorage.getItem(`zomee_start_${roomId}`);
        if (storedTime) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setMeetingStartTime(parseInt(storedTime, 10));
        } else {
          localStorage.setItem(`zomee_start_${roomId}`, meetingStartTime.toString());
        }
      }
    }
  }, [isHost]); // Run once when host status is determined

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = 3600 - Math.floor((Date.now() - meetingStartTime) / 1000);
      if (remaining <= 0) {
        setTimeRemaining(0);
        if (isHost) handleConfirmEndMeeting();
      } else {
        setTimeRemaining(remaining);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [meetingStartTime, isHost]);

  // Listen for participant departures, arrivals, and network quality
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleParticipantConnected = (participant: any) => {
      addSystemMessage(`${participant.name || participant.identity} joined the meeting.`);
      if (isHost) {
        const encoder = new TextEncoder();
        sendHostCommand(encoder.encode(JSON.stringify({ 
          action: "sync-timer", 
          startTime: meetingStartTime 
        })), { reliable: true });

        // Send full chat history to the new joiner
        sendHostCommand(encoder.encode(JSON.stringify({
          action: "sync-history",
          target: participant.identity,
          history: combinedMessages
        })), { reliable: true });
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleParticipantDisconnected = (participant: any) => {
      addSystemMessage(`${participant.name || participant.identity} left the meeting.`);
      if (isHost) {
        setToastMsg(`${participant.name || participant.identity} left the meeting.`);
        setTimeout(() => setToastMsg(""), 4000);
      }
    };
    const handleConnectionQuality = (quality: ConnectionQuality, participant: Participant) => {
      if (participant.identity === localParticipant?.identity) {
        if (quality === ConnectionQuality.Poor || quality === ConnectionQuality.Lost) {
          setToastMsg("⚠️ Weak network signal detected. Video quality may drop.");
          setTimeout(() => setToastMsg(""), 5000);
        }
      }
    };

    room.on(RoomEvent.ParticipantConnected, handleParticipantConnected);
    room.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
    room.on(RoomEvent.ConnectionQualityChanged, handleConnectionQuality);

    return () => { 
      room.off(RoomEvent.ParticipantConnected, handleParticipantConnected);
      room.off(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected); 
      room.off(RoomEvent.ConnectionQualityChanged, handleConnectionQuality);
    };
  }, [room, isHost, localParticipant, addSystemMessage]);


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

  const toggleChatMute = (participantId: string) => {
    const isMuted = mutedChats.has(participantId);
    executeHostCommand(participantId, isMuted ? "unmute-chat" : "mute-chat");
    setMutedChats(prev => {
      const next = new Set(prev);
      if (isMuted) next.delete(participantId);
      else next.add(participantId);
      return next;
    });
  };

  const handleLeaveButtonClick = () => {
    if (isHost) {
      setShowEndMeetingModal(true);
    } else {
      setShowGuestLeaveModal(true);
    }
  };

  const triggerLocalReaction = useCallback((emoji: string) => {
    const newEmoji = { id: Date.now() + Math.random(), emoji, left: 10 + Math.random() * 80 };
    setFloatingEmojis((prev) => [...prev, newEmoji]);
    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((e) => e.id !== newEmoji.id));
    }, 4000);
  }, []);

  const { send } = useDataChannel("reactions", (msg) => {
    const decoder = new TextDecoder();
    const emoji = decoder.decode(msg.payload);
    triggerLocalReaction(emoji);
  });

  const COMMON_EMOJIS = ["👍", "👏", "😂", "🎉", "💖"];

  const handleReaction = (emoji: string) => {
    triggerLocalReaction(emoji);
    const encoder = new TextEncoder();
    send(encoder.encode(emoji), { reliable: true });
    setIsEmojiMenuOpen(false);
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


  return (
    <div 
      onMouseMove={resetHideTimer}
      style={{ display: "flex", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, height: "100dvh", width: "100vw", overflow: "hidden" }}
    >
      
      {/* Toast */}
      {toastMsg && (
        <div style={{
          position: "absolute", top: "32px", left: "50%",
          background: "rgba(15, 23, 42, 0.9)", backdropFilter: "blur(16px)", border: "1px solid var(--primary-cyan)",
          color: "white", padding: "12px 20px", borderRadius: "12px", zIndex: 9999,
          boxShadow: "0 10px 30px rgba(34, 211, 238, 0.3)", fontWeight: "500",
          display: "flex", alignItems: "flex-start", gap: "10px",
          width: "max-content", maxWidth: "85%",
          animation: "toastSlideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards"
        }}>
          <CheckCircle2 size={18} color="#34d399" style={{ flexShrink: 0, marginTop: "2px" }} />
          <span style={{ lineHeight: "1.4", fontSize: "14px", textAlign: "left" }}>{toastMsg}</span>
        </div>
      )}

      {/* Unmute Request Modal */}
      {incomingRequest && (
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 200,
          background: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div className="glass-panel" style={{ padding: "32px", textAlign: "center", maxWidth: "400px", width: "90%", border: "1px solid var(--primary-cyan)" }}>
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
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 9999,
          background: "rgba(15, 23, 42, 0.85)", backdropFilter: "blur(12px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          animation: "fadeIn 0.2s ease-out"
        }}>
          <div className="glass-panel" style={{ 
            padding: "32px", textAlign: "center", maxWidth: "400px", width: "90%", 
            border: "1px solid rgba(239, 68, 68, 0.4)", borderRadius: "24px",
            boxShadow: "0 25px 50px -12px rgba(239, 68, 68, 0.25)",
            animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
          }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(239, 68, 68, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <LogOut size={32} style={{ color: "#ef4444" }} />
            </div>
            <h2 style={{ marginBottom: "12px", fontSize: "1.5rem", fontWeight: "700" }}>End Meeting</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "28px", fontSize: "0.95rem", lineHeight: "1.5" }}>
              You are the host. You can leave the meeting open for others, or end it for everyone.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <button 
                onClick={handleConfirmEndMeeting}
                style={{ 
                  background: "#ef4444", color: "white", border: "none", padding: "16px", 
                  borderRadius: "14px", fontSize: "1rem", fontWeight: "600", cursor: "pointer",
                  transition: "background 0.2s"
                }}
                onMouseOver={(e) => e.currentTarget.style.background = "#dc2626"}
                onMouseOut={(e) => e.currentTarget.style.background = "#ef4444"}
              >
                End Meeting for All
              </button>
              <button 
                onClick={async () => {
                  setShowEndMeetingModal(false);
                  await room.disconnect();
                }}
                style={{ 
                  background: "rgba(255,255,255,0.1)", color: "white", border: "1px solid rgba(255,255,255,0.2)", 
                  padding: "16px", borderRadius: "14px", fontSize: "1rem", fontWeight: "600", cursor: "pointer",
                  transition: "background 0.2s"
                }}
                onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
                onMouseOut={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
              >
                Just Leave
              </button>
              <button 
                onClick={() => setShowEndMeetingModal(false)}
                style={{ 
                  background: "transparent", color: "var(--text-secondary)", border: "none", 
                  padding: "12px", borderRadius: "14px", fontSize: "0.95rem", fontWeight: "500", cursor: "pointer",
                  marginTop: "4px"
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Meeting Alert (Guest) */}
      {showGuestLeaveModal && (
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 9999,
          background: "rgba(15, 23, 42, 0.85)", backdropFilter: "blur(12px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          animation: "fadeIn 0.2s ease-out"
        }}>
          <div className="glass-panel" style={{ 
            padding: "32px", textAlign: "center", maxWidth: "400px", width: "90%", 
            border: "1px solid rgba(239, 68, 68, 0.4)", borderRadius: "24px",
            boxShadow: "0 25px 50px -12px rgba(239, 68, 68, 0.25)",
            animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
          }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(239, 68, 68, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <LogOut size={32} style={{ color: "#ef4444" }} />
            </div>
            <h2 style={{ marginBottom: "12px", fontSize: "1.5rem", fontWeight: "700" }}>Leave Meeting?</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "28px", fontSize: "0.95rem", lineHeight: "1.5" }}>
              Are you sure you want to leave this meeting?
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <button 
                onClick={async () => { 
                  setShowGuestLeaveModal(false); 
                  await room.disconnect(); 
                  router.push("/");
                }}
                style={{ 
                  background: "#ef4444", color: "white", border: "none", padding: "16px", 
                  borderRadius: "14px", fontSize: "1rem", fontWeight: "600", cursor: "pointer",
                  transition: "background 0.2s"
                }}
                onMouseOver={(e) => e.currentTarget.style.background = "#dc2626"}
                onMouseOut={(e) => e.currentTarget.style.background = "#ef4444"}
              >
                Leave Meeting
              </button>
              <button 
                onClick={() => setShowGuestLeaveModal(false)}
                style={{ 
                  background: "rgba(255,255,255,0.1)", color: "white", border: "1px solid rgba(255,255,255,0.2)", 
                  padding: "16px", borderRadius: "14px", fontSize: "1rem", fontWeight: "600", cursor: "pointer",
                  transition: "background 0.2s"
                }}
                onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
                onMouseOut={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Meeting Ended Alert (Guest) */}
      {meetingEndedDuration && (
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(15, 23, 42, 0.95)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(20px)" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "rgba(239, 68, 68, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <LogOut size={40} color="#ef4444" />
            </div>
            <h2 style={{ fontSize: "2rem", marginBottom: "16px", color: "white" }}>Meeting Ended</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.2rem", marginBottom: "16px" }}>The Host has ended this meeting.</p>
            <div style={{ display: "inline-block", background: "rgba(255,255,255,0.1)", padding: "12px 24px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.2)", color: "var(--primary-cyan)", fontWeight: "600", fontSize: "1.2rem" }}>
              Total Duration: {meetingEndedDuration}
            </div>
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
      <div className="main-video-area" style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", padding: "16px", overflow: "hidden" }}>
        
        {/* Top Floating Timer */}
        <div className="floating-timer-badge" style={{ 
          position: "absolute", top: "16px", left: "50%", transform: "translateX(-50%)", zIndex: 50, 
          background: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(16px)", padding: "6px 20px", 
          borderRadius: "100px", border: timeRemaining < 300 ? "1px solid rgba(239, 68, 68, 0.5)" : "1px solid rgba(255,255,255,0.1)", 
          color: timeRemaining < 300 ? "#ef4444" : "white", fontWeight: "600", fontSize: "14px",
          boxShadow: timeRemaining < 300 ? "0 0 20px rgba(239, 68, 68, 0.3)" : "0 4px 20px rgba(0,0,0,0.3)",
          display: "flex", alignItems: "center", gap: "8px",
          animation: timeRemaining < 300 ? "pulseError 2s infinite" : "none"
        }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: timeRemaining < 300 ? "#ef4444" : "#22c55e", boxShadow: timeRemaining < 300 ? "0 0 10px #ef4444" : "0 0 10px #22c55e" }}></div>
          {Math.floor(timeRemaining / 60).toString().padStart(2, '0')}:{ (timeRemaining % 60).toString().padStart(2, '0') }
        </div>

        {/* Video Area (Grid or PiP) */}
        <div style={{ flex: 1, borderRadius: "24px", overflow: "hidden", position: "relative", background: "black" }} className="glass-panel">
          {screenShareTracks.length > 0 ? (
            <div style={{ width: "100%", height: "100%", position: "relative" }}>
              {/* Screen Share Background */}
              <div style={{ width: "100%", height: "100%" }}>
                <CustomGridTile trackRef={screenShareTracks[0]} raisedHands={raisedHands} style={{ width: "100%", height: "100%" }} />
              </div>
              
              {/* Floating Camera PiP Overlay */}
              <div style={{
                position: "absolute", top: "16px", right: "16px", width: "320px", maxHeight: "calc(100% - 32px)",
                background: "var(--glass-bg)", backdropFilter: "blur(16px)", borderRadius: "20px",
                border: "1px solid var(--glass-border)", boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
                padding: "8px", overflowY: "auto", zIndex: 20
              }}>
                <GridLayout tracks={paginatedTracks} style={{ width: "100%", height: `${Math.max(200, paginatedTracks.length * 150)}px` }}>
                  <CustomGridTile raisedHands={raisedHands} />
                </GridLayout>
              </div>
            </div>
          ) : (
            <GridLayout tracks={paginatedTracks} style={{ height: "100%", width: "100%" }}>
              <CustomGridTile raisedHands={raisedHands} />
            </GridLayout>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ position: "absolute", bottom: "100px", left: "50%", transform: "translateX(-50%)", zIndex: 60, display: "flex", gap: "16px", background: "rgba(15, 23, 42, 0.7)", padding: "8px 16px", borderRadius: "100px", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0} className="btn-glass" style={{ opacity: currentPage === 0 ? 0.5 : 1, padding: "6px 12px", minWidth: "auto", height: "auto" }}>Prev</button>
              <span style={{ color: "white", alignSelf: "center", fontWeight: "bold", fontSize: "14px" }}>{currentPage + 1} / {totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage === totalPages - 1} className="btn-glass" style={{ opacity: currentPage === totalPages - 1 ? 0.5 : 1, padding: "6px 12px", minWidth: "auto", height: "auto" }}>Next</button>
            </div>
          )}
        </div>

        {/* Side Controls (Always visible, floating on sides, fades with control bar) */}
        <div className="side-controls" style={{ 
          opacity: isControlBarOpen ? 1 : 0, 
          pointerEvents: isControlBarOpen ? "auto" : "none", 
          transition: "opacity 0.3s ease" 
        }}>
          <button 
            onClick={() => setSidebarTab(sidebarTab === "participants" ? null : "participants")}
            className={`btn-glass ${sidebarTab === "participants" ? 'active' : ''}`}
            title="Participants"
            style={{ position: "absolute", top: "16px", left: "16px", zIndex: 80, background: sidebarTab === "participants" ? "var(--primary-cyan)" : "" }}
          >
            <Users size={20} />
            <span style={{ marginLeft: "4px", fontSize: "12px", fontWeight: "bold" }}>{participants.length}</span>
          </button>

          <div style={{ position: "absolute", top: "70px", left: "16px", zIndex: 80 }}>
            <button 
              onClick={() => setIsInviteMenuOpen(!isInviteMenuOpen)} 
              className={`btn-glass ${isInviteMenuOpen ? 'active' : ''}`} 
              title="Invite Options"
            >
              <LinkIcon size={20} />
            </button>
            {isInviteMenuOpen && (
              <div style={{
                position: "absolute", top: "0px", left: "50px",
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

          {videoDevices.length > 1 && (
            <button 
              onClick={switchCamera} 
              className="btn-glass mobile-only-btn" 
              title="Switch Camera"
              style={{ position: "absolute", top: "124px", left: "16px", zIndex: 80 }}
            >
              <FlipHorizontal size={20} />
            </button>
          )}

          {/* Settings Menu (3-dots) */}
          <div style={{ position: "absolute", top: "16px", right: "16px", zIndex: 80 }}>
            <button 
              onClick={() => setIsSettingsOpen(!isSettingsOpen)} 
              className={`btn-glass ${isSettingsOpen ? 'active' : ''}`} 
              title="More Options"
            >
              <MoreVertical size={20} />
            </button>
            
            {isSettingsOpen && (
              <div style={{
                position: "absolute", top: "0px", right: "56px",
                background: "var(--glass-bg)", backdropFilter: "blur(24px)",
                border: "1px solid var(--glass-border)", borderRadius: "16px",
                padding: "16px", display: "flex", flexDirection: "column", gap: "12px",
                minWidth: "240px", zIndex: 100, boxShadow: "0 10px 40px rgba(0,0,0,0.5)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "12px", marginBottom: "4px" }}>
                  <ShieldCheck size={18} color="#34d399" />
                  <span style={{ color: "#34d399", fontSize: "13px", fontWeight: "600" }}>End-to-End Encrypted</span>
                </div>
                
                <h4 style={{ fontSize: "12px", textTransform: "uppercase", color: "var(--text-secondary)", letterSpacing: "1px", margin: "4px 0" }}>Audio & Video</h4>
                
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 0" }}>
                  <span style={{ fontSize: "14px", color: "white", fontWeight: "500" }}>Noise Suppression</span>
                  <button 
                    onClick={() => {
                      setIsNoiseSuppressionEnabled(!isNoiseSuppressionEnabled);
                      setToastMsg(isNoiseSuppressionEnabled ? "Noise suppression disabled" : "Noise suppression enabled");
                    }}
                    style={{
                      width: "44px", height: "24px", borderRadius: "100px", background: isNoiseSuppressionEnabled ? "var(--primary-cyan)" : "rgba(255,255,255,0.2)",
                      position: "relative", border: "none", cursor: "pointer", transition: "all 0.3s"
                    }}
                  >
                    <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: "white", position: "absolute", top: "3px", left: isNoiseSuppressionEnabled ? "23px" : "3px", transition: "all 0.3s", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}></div>
                  </button>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 0" }}>
                  <span style={{ fontSize: "14px", color: "white", fontWeight: "500" }}>HD Video</span>
                  <button 
                    onClick={() => {
                      setIsHDVideoEnabled(!isHDVideoEnabled);
                      setToastMsg(isHDVideoEnabled ? "Switched to standard definition" : "HD video enabled");
                    }}
                    style={{
                      width: "44px", height: "24px", borderRadius: "100px", background: isHDVideoEnabled ? "var(--primary-cyan)" : "rgba(255,255,255,0.2)",
                      position: "relative", border: "none", cursor: "pointer", transition: "all 0.3s"
                    }}
                  >
                    <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: "white", position: "absolute", top: "3px", left: isHDVideoEnabled ? "23px" : "3px", transition: "all 0.3s", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}></div>
                  </button>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 0" }}>
                  <span style={{ fontSize: "14px", color: "white", fontWeight: "500" }}>Mirror My Video</span>
                  <button 
                    onClick={() => {
                      setIsMirrorVideoEnabled(!isMirrorVideoEnabled);
                      setToastMsg(isMirrorVideoEnabled ? "Mirror video disabled" : "Mirror video enabled");
                    }}
                    style={{
                      width: "44px", height: "24px", borderRadius: "100px", background: isMirrorVideoEnabled ? "var(--primary-cyan)" : "rgba(255,255,255,0.2)",
                      position: "relative", border: "none", cursor: "pointer", transition: "all 0.3s"
                    }}
                  >
                    <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: "white", position: "absolute", top: "3px", left: isMirrorVideoEnabled ? "23px" : "3px", transition: "all 0.3s", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}></div>
                  </button>
                </div>

                <h4 style={{ fontSize: "12px", textTransform: "uppercase", color: "var(--text-secondary)", letterSpacing: "1px", margin: "12px 0 4px" }}>General</h4>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 0" }}>
                  <span style={{ fontSize: "14px", color: "white", fontWeight: "500" }}>Data Saver Mode</span>
                  <button 
                    onClick={() => {
                      setIsDataSaverEnabled(!isDataSaverEnabled);
                      setToastMsg(isDataSaverEnabled ? "Data saver disabled" : "Data saver enabled");
                    }}
                    style={{
                      width: "44px", height: "24px", borderRadius: "100px", background: isDataSaverEnabled ? "#fbbf24" : "rgba(255,255,255,0.2)",
                      position: "relative", border: "none", cursor: "pointer", transition: "all 0.3s"
                    }}
                  >
                    <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: "white", position: "absolute", top: "3px", left: isDataSaverEnabled ? "23px" : "3px", transition: "all 0.3s", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}></div>
                  </button>
                </div>
                
                <button 
                  className="invite-option-btn" 
                  onClick={() => {
                    setToastMsg("System diagnostics sent successfully.");
                    setIsSettingsOpen(false);
                  }} 
                  style={{ marginTop: "4px", color: "var(--text-secondary)" }}
                >
                  Report an Issue
                </button>
                
                <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.1)", textAlign: "center" }}>
                  <span style={{ background: "rgba(255,255,255,0.1)", padding: "6px 14px", borderRadius: "100px", fontSize: "11px", color: "var(--text-secondary)", fontWeight: "600", display: "inline-block" }}>
                    App Version 1.0.0
                  </span>
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={() => setSidebarTab(sidebarTab === "chat" ? null : "chat")}
            className={`btn-glass ${sidebarTab === "chat" ? 'active' : ''}`}
            title="Toggle Chat"
            style={{ position: "absolute", top: "70px", right: "16px", zIndex: 80, background: sidebarTab === "chat" ? "var(--primary-cyan)" : "" }}
          >
            <MessageSquare size={20} />
            {unreadCount > 0 && (
              <span style={{ position: "absolute", top: "-4px", right: "-4px", background: "var(--danger)", color: "white", fontSize: "10px", fontWeight: "bold", padding: "2px 6px", borderRadius: "100px", border: "2px solid var(--glass-bg)" }}>
                {unreadCount}
              </span>
            )}
          </button>

          <div style={{ position: "absolute", top: "124px", right: "16px", zIndex: 80 }}>
            <button 
              onClick={() => setIsEmojiMenuOpen(!isEmojiMenuOpen)} 
              className={`btn-glass ${isEmojiMenuOpen ? 'active' : ''}`} 
              title="React"
            >
              <Smile size={20} />
            </button>
            {isEmojiMenuOpen && (
              <div style={{
                position: "absolute", top: "0px", right: "56px",
                background: "var(--glass-bg)", backdropFilter: "blur(20px)",
                border: "1px solid var(--glass-border)", borderRadius: "12px",
                padding: "8px", display: "flex", gap: "8px", flexDirection: "row", flexWrap: "wrap", width: "140px",
                zIndex: 100, boxShadow: "0 10px 40px rgba(0,0,0,0.5)"
              }}>
                {COMMON_EMOJIS.map(emoji => (
                  <button key={emoji} onClick={() => handleReaction(emoji)} className="emoji-btn">
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button 
            onClick={toggleHand} 
            className={`btn-glass ${localParticipant && raisedHands.has(localParticipant.identity) ? 'active' : ''}`} 
            title="Raise Hand"
            style={{ position: "absolute", top: "178px", right: "16px", zIndex: 80, background: localParticipant && raisedHands.has(localParticipant.identity) ? "rgba(250, 204, 21, 0.2)" : "", color: localParticipant && raisedHands.has(localParticipant.identity) ? "#facc15" : "" }}
          >
            <Hand size={20} />
          </button>
        </div>

        {/* Custom Control Bar */}
        <div 
          onMouseEnter={() => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current); setIsControlBarOpen(true); }}
          onMouseLeave={resetHideTimer}
          style={{ 
          position: "absolute", bottom: "24px", left: "50%",
          transform: `translateX(-50%) translateY(${isControlBarOpen ? "0px" : "120px"})`,
          opacity: isControlBarOpen ? 1 : 0,
          pointerEvents: isControlBarOpen ? "auto" : "none",
          transition: "transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease",
          padding: "16px 24px", display: "flex", justifyContent: "center", alignItems: "center", gap: "16px",
          zIndex: 90, borderRadius: "100px", boxShadow: "0 10px 40px rgba(0,0,0,0.5)"
        }} className="glass-panel control-bar-container">
          
          <ControlBar variation="minimal" controls={{ camera: true, microphone: true, screenShare: true, leave: false, chat: false }} />
          
          <button onClick={handleLeaveButtonClick} className="btn-glass" style={{ background: "rgba(255, 0, 0, 0.2)", color: "#ff6b6b", height: "40px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }} title="Leave Meeting">
            <LogOut size={20} />
          </button>
          
          <button 
            onClick={async () => {
              try {
                if (localParticipant) {
                  await localParticipant.setScreenShareEnabled(!localParticipant.isScreenShareEnabled);
                }
              } catch (e) {
                setToastMsg("Screen sharing not supported on this browser.");
              }
            }}
            className={`btn-glass ${localParticipant?.isScreenShareEnabled ? 'active' : ''}`}
            title="Toggle Screen Share"
            style={{ background: localParticipant?.isScreenShareEnabled ? "var(--primary-cyan)" : "" }}
          >
            <MonitorUp size={20} />
          </button>

          <Recorder />

        </div>
      </div>

      {/* Sidebar */}
      <div 
        className={`chat-sidebar ${sidebarTab ? 'open' : ''}`}
        style={{ 
        width: sidebarTab ? "320px" : "0px", 
        transition: "width 0.3s ease, transform 0.3s ease", 
        overflow: "hidden",
        borderLeft: sidebarTab ? "1px solid var(--glass-border)" : "none",
        background: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(16px)",
        zIndex: 100
      }}>
        <div className="sidebar-inner" style={{ width: "320px", height: "100%", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--glass-border)" }}>
            <h3 style={{ margin: 0, fontWeight: "600" }}>
              {sidebarTab === "chat" ? "Meeting Chat" : "Participants"}
            </h3>
            <button onClick={() => setSidebarTab(null)} style={{ color: "var(--text-secondary)" }}>
              <X size={20} />
            </button>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
            {sidebarTab === "chat" ? (
              <>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "16px", position: "relative", gap: "12px", overflowY: "auto" }}>
                  {isChatMuted && !isHost ? (
                    <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(15, 23, 42, 0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, backdropFilter: "blur(4px)" }}>
                      <div style={{ textAlign: "center", color: "var(--text-secondary)" }}>
                        <MessageSquareOff size={32} style={{ margin: "0 auto 8px", opacity: 0.5 }} />
                        <p>Chat disabled by Host</p>
                      </div>
                    </div>
                  ) : null}
                  
                  {combinedMessages.length === 0 && <div style={{ color: "var(--text-secondary)", textAlign: "center", marginTop: "auto", marginBottom: "auto" }}>No messages yet.</div>}
                  
                  {combinedMessages.map(msg => {
                    const timeString = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    return (
                      <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: msg.isSystem ? "center" : (msg.isSelf ? "flex-end" : "flex-start"), marginBottom: "4px" }}>
                        {msg.isSystem ? (
                          <div style={{ background: "rgba(255,255,255,0.1)", padding: "6px 14px", borderRadius: "100px", fontSize: "11px", color: "var(--primary-cyan)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            {msg.message}
                          </div>
                        ) : (
                          <div style={{ display: "flex", gap: "8px", flexDirection: msg.isSelf ? "row-reverse" : "row", alignItems: "flex-end", maxWidth: "90%" }}>
                            {/* Avatar */}
                            {!msg.isSelf && (
                              <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--primary-cyan)", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold", flexShrink: 0 }}>
                                {msg.sender ? msg.sender[0].toUpperCase() : "?"}
                              </div>
                            )}
                            
                            <div style={{ display: "flex", flexDirection: "column", alignItems: msg.isSelf ? "flex-end" : "flex-start" }}>
                              {/* Sender Name & Time */}
                              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px", padding: "0 4px" }}>
                                <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: "600" }}>{msg.isSelf ? "You" : msg.sender}</span>
                                <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)" }}>{timeString}</span>
                              </div>
                              
                              {/* Message Bubble */}
                              <div style={{ 
                                background: msg.isSelf ? "linear-gradient(135deg, var(--primary-cyan), #0ea5e9)" : "rgba(255,255,255,0.08)", 
                                color: msg.isSelf ? "#000" : "#fff", 
                                padding: "10px 14px", 
                                borderRadius: "16px", 
                                borderBottomRightRadius: msg.isSelf ? "4px" : "16px", 
                                borderBottomLeftRadius: msg.isSelf ? "16px" : "4px", 
                                fontSize: "13px",
                                lineHeight: "1.4",
                                wordWrap: "break-word",
                                boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                                border: msg.isSelf ? "none" : "1px solid rgba(255,255,255,0.1)"
                              }}>
                                {msg.message}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div style={{ padding: "16px", borderTop: "1px solid var(--glass-border)" }}>
                  <form onSubmit={(e) => { e.preventDefault(); if (chatInput.trim()) { sendChatMessage(chatInput.trim()); setChatInput(""); } }} style={{ display: "flex", gap: "8px" }}>
                    <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Type a message..." style={{ flex: 1, background: "rgba(0,0,0,0.3)", border: "1px solid var(--glass-border)", padding: "10px", borderRadius: "8px", color: "white", outline: "none" }} disabled={isChatMuted && !isHost} />
                    <button type="submit" className="btn-primary" style={{ padding: "10px 16px" }} disabled={(isChatMuted && !isHost) || !chatInput.trim()}>Send</button>
                  </form>
                </div>
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
                          {raisedHands.has(p.identity) && (
                            <div style={{ background: "rgba(250, 204, 21, 0.2)", padding: "4px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(250, 204, 21, 0.5)", boxShadow: "0 0 10px rgba(250, 204, 21, 0.3)", marginLeft: "4px" }}>
                              <Hand size={14} color="#facc15" />
                            </div>
                          )}
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
                        
                        {mutedChats.has(p.identity) ? (
                          <button onClick={() => toggleChatMute(p.identity)} className="host-request-btn" title="Enable Chat" style={{ color: "#22c55e", borderColor: "rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.1)" }}>
                            <MessageSquare size={14} />
                          </button>
                        ) : (
                          <button onClick={() => toggleChatMute(p.identity)} className="host-action-btn" title="Disable Chat">
                            <MessageSquareOff size={14} />
                          </button>
                        )}
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
        .lk-button[data-lk-source="camera"][aria-pressed="false"],
        .lk-button[data-lk-source="microphone"][aria-pressed="false"] {
          background: var(--danger) !important;
          border-color: rgba(255,0,0,0.5) !important;
        }
        .lk-disconnect-button {
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
        
        /* Floating Emojis */
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

        /* Buttons & Popups */
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
        .host-action-btn, .host-request-btn {
          border-radius: 6px;
          padding: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .host-action-btn {
          background: rgba(255,0,0,0.1);
          border: 1px solid rgba(255,0,0,0.3);
          color: #ff6b6b;
        }
        .host-action-btn:hover {
          background: rgba(255,0,0,0.3);
        }
        .host-request-btn {
          background: rgba(34, 211, 238, 0.1);
          border: 1px solid rgba(34, 211, 238, 0.3);
          color: var(--primary-cyan);
        }
        .host-request-btn:hover {
          background: rgba(34, 211, 238, 0.3);
          box-shadow: 0 0 10px rgba(34, 211, 238, 0.2);
        }
        .emoji-btn {
          background: transparent;
          border: none;
          font-size: 24px;
          cursor: pointer;
          transition: transform 0.2s;
          padding: 4px;
        }
        .emoji-btn:hover {
          transform: scale(1.3);
        }

        /* Animations */
        @keyframes pulseHand {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(250, 204, 21, 0.7); }
          70% { transform: scale(1.2); box-shadow: 0 0 0 20px rgba(250, 204, 21, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(250, 204, 21, 0); }
        }
        @keyframes pulseError {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        @keyframes toastSlideDown {
          from { transform: translate(-50%, -30px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        ${isMirrorVideoEnabled ? '' : `
        .lk-participant-tile[data-lk-local-participant="true"] video {
          transform: none !important;
        }
        `}

        /* Desktop only elements (default shown, hidden on mobile) */
        
        .side-controls .btn-glass {
          min-width: 48px;
          width: 48px;
          height: 48px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
          border-radius: 50%;
          color: white;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .side-controls .btn-glass:hover {
          background: rgba(255,255,255,0.15);
          transform: scale(1.1);
          border-color: rgba(255,255,255,0.3);
        }

        /* Mobile specific overrides */
        @media (max-width: 768px) {
          .desktop-only {
            display: none !important;
          }
          .mobile-only-btn {
            display: flex !important;
          }


          .main-video-area {
            padding: 4px !important;
          }
          .control-bar-container {
            width: 95vw !important;
            padding: 12px 16px !important;
            gap: 12px !important;
            flex-wrap: wrap !important;
            overflow: visible !important;
            justify-content: center !important;
            border-radius: 24px !important;
            bottom: 16px !important;
          }
          .btn-glass, .lk-button {
            min-width: 44px !important;
            width: 44px !important;
            height: 44px !important;
            flex-shrink: 0 !important;
            padding: 0 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          /* Fix layout for LiveKit default buttons inside */
          .lk-control-bar {
            display: flex !important;
            gap: 10px !important;
          }
          /* Hide dropdown menus on mobile to save space */
          .lk-button-group-menu {
            display: none !important;
          }
          .chat-sidebar {
            position: absolute !important;
            right: 0 !important;
            top: 0 !important;
            height: 100% !important;
            width: 100% !important;
            z-index: 300 !important;
            transform: translateX(100%);
            transition: transform 0.3s ease !important;
            background: rgba(15, 23, 42, 0.95) !important;
          }
          .chat-sidebar.open {
            transform: translateX(0);
          }
          .sidebar-inner {
            width: 100% !important;
          }
          .floating-timer-badge {
            top: 10px !important;
            padding: 4px 12px !important;
            font-size: 12px !important;
          }
        }
      `}</style>
    </div>
  );
}
