"use client";

import { useState, useRef } from "react";
import { Square, CircleDot } from "lucide-react";

export default function Recorder() {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => null);

      const tracks = [...displayStream.getTracks()];
      if (audioStream) {
        tracks.push(...audioStream.getTracks());
      }
      
      const combinedStream = new MediaStream(tracks);
      
      const mediaRecorder = new MediaRecorder(combinedStream, { mimeType: "video/webm" });
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `ZoomClone_Recording_${new Date().toISOString()}.webm`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        chunksRef.current = []; // Reset chunks

        // Stop all tracks
        combinedStream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Listen for the user stopping sharing via the browser UI
      displayStream.getVideoTracks()[0].onended = () => {
        if (mediaRecorder.state === "recording") {
          mediaRecorder.stop();
          setIsRecording(false);
        }
      };

    } catch (err) {
      console.error("Error starting recording:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <button 
      onClick={isRecording ? stopRecording : startRecording}
      className={`btn-glass ${isRecording ? 'btn-danger' : ''}`}
      title={isRecording ? "Stop Recording" : "Record Screen"}
      style={{
        animation: isRecording ? "pulse 2s infinite" : "none",
      }}
    >
      {isRecording ? <Square size={20} fill="currentColor" /> : <CircleDot size={20} color="#ef4444" />}
      {isRecording && <span style={{ marginLeft: "8px", fontSize: "14px" }}>REC</span>}
      <style jsx>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>
    </button>
  );
}
