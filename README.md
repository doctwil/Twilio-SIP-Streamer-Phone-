# Twilio-SIP-Streamer-Phone-
Say goodbye to the "nest of wires." A serverless, AI-powered phone system for live streamers. Features real-time caller screening via OpenAI Whisper, a web-based producer dashboard, and parallel audio routing for OBS Studio. Go from zero to dial-in in 5 minutes.

# Zero to Dial-In: Pro-Grade Twitch Phone Lines

This project replaces traditional hardware mixers with a 100% cloud-based SIP solution for live streamers.

### 🚀 Key Features
* **AI Gatekeeper:** Screen callers' names and topics before you pick up.
* **Real-time Transcription:** See what callers are saying inside your dashboard.
* **Parallel Routing:** Send clean audio to OBS and your headphones simultaneously.

### 🛠️ Prerequisites
* Twilio Account + Phone Number
* OpenAI API Key
* [BlackHole](https://github.com/ExistentialAudio/BlackHole) (for macOS audio routing)
* Twilio CLI installed (`npm install -g twilio-cli`)

### 📦 Setup
1. Clone the repo: `git clone [your-url]`
2. Rename `.env.example` to `.env` and add your credentials.
3. Deploy: `twilio serverless:deploy`


