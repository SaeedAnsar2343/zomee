# Zomee - Modern Video Conferencing 🚀

Zomee is a blazing-fast, beautiful, and fully functional video conferencing application built independently by **Saeed Ansar**. Powered by Next.js and LiveKit, Zomee offers a state-of-the-art "Glassmorphism" design and real-time low-latency video streaming.

## ✨ Features
- **HD Video & Audio**: Crystal clear real-time streaming using LiveKit.
- **Modern Glassmorphism UI**: A stunning, animated, and responsive user interface with blurred backgrounds and fluid transitions.
- **Smart Control Bar**: YouTube-style auto-hiding control bar that collapses after 3 seconds of inactivity to give you an edge-to-edge video experience.
- **Persistent Chat History**: Late joiners automatically sync the entire chat history in the background via hidden data channels.
- **Advanced Chat UI**: Beautiful chat interface with read receipts, unread message badges, circular avatars, and customized gradients.
- **Meeting Timer**: A fully persistent 60-minute countdown timer tied to the unique room ID. It glows green and pulses red when time is running out.
- **Screen Sharing & Recording**: Built-in screen sharing and one-click local screen recording.
- **Interactive Reactions**: Float animated emojis across the screen for everyone in the room to see!
- **Host Controls**: The Host has ultimate power to mute mics, stop videos, disable chat, and end the meeting for everyone.

## 🛠️ Tech Stack
- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **WebRTC Engine**: [LiveKit](https://livekit.io/) 
- **Styling**: Vanilla CSS with modern Glassmorphism principles
- **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Create a `.env.local` file in the root directory and add your LiveKit credentials:
```env
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
NEXT_PUBLIC_LIVEKIT_URL=your_livekit_wss_url
```

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the app in action!

## 🤝 Support
Zomee is completely free to use. If you'd like to support the server costs, you can send help money to Saeed via **Botim: +971588346500**.
