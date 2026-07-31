import { NextRequest, NextResponse } from "next/server";
import { RoomServiceClient } from "livekit-server-sdk";

export async function GET(req: NextRequest) {
  const roomName = req.nextUrl.searchParams.get("room");

  if (!roomName) {
    return NextResponse.json({ error: "Missing room parameter" }, { status: 400 });
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  if (!apiKey || !apiSecret || !wsUrl) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  // Use http URL for the room service client if ws is provided
  const httpUrl = wsUrl.replace("wss://", "https://").replace("ws://", "http://");
  
  const roomService = new RoomServiceClient(httpUrl, apiKey, apiSecret);

  try {
    const participants = await roomService.listParticipants(roomName);
    
    if (!participants || participants.length === 0) {
      return NextResponse.json({ error: "Room is empty or not found" }, { status: 404 });
    }

    let hostName = "Unknown Host";
    for (const p of participants) {
      try {
        if (p.metadata) {
          const meta = JSON.parse(p.metadata);
          if (meta.isHost) {
            hostName = p.name || p.identity;
            break;
          }
        }
      } catch (e) {
        // Ignore metadata parse errors
      }
    }

    return NextResponse.json({ status: "success", hostName });
  } catch (error: any) {
    // If room doesn't exist, LiveKit throws an error
    return NextResponse.json({ error: "Room not found or host hasn't joined yet" }, { status: 404 });
  }
}
