# SafeSignal — AI-Powered Emergency Response System

> A real-time crash detection and emergency SOS platform built for Indian roads. Detects accidents using device sensors, auto-notifies emergency contacts, shares live GPS location, and dispatches ambulance — all without any manual intervention.

**Live Demo:** [sos-beta-two.vercel.app](https://sos-beta-two.vercel.app)

---

## What It Does

SafeSignal runs silently in the background on your phone. The moment a crash is detected:

1. Screen flashes + loud alarm fires instantly
2. A 5–15 second countdown appears (adaptive based on crash severity)
3. If you don't tap "I'm OK" — SOS auto-triggers:
   - SMS sent to your emergency contact via Fast2SMS
   - WhatsApp message with GPS location + Medical QR sent to contact
   - Nearest hospital search opens automatically
   - 108 (ambulance) auto-dialed
   - Live location updates sent every 45 seconds

---

## Features

### Crash Detection
- Multi-sensor fusion using device accelerometer + gyroscope
- Noise floor filtering to eliminate false positives from bumps/potholes
- Low-pass filter for smooth signal processing
- Post-impact stillness analysis (2-second observation window)
- Adaptive countdown: 5s for high-speed crashes, 15s for low-speed impacts
- Speed tracking via GPS at time of impact

### Emergency Response
- Auto SMS via Fast2SMS API (server-side, no user tap needed)
- WhatsApp pre-filled with name, blood group, conditions, GPS link, Medical QR
- Hospital WhatsApp message with patient info for doctors
- Direct dial to 108 (Ambulance), 100 (Police), 112 (Emergency)
- Live GPS location updates every 45 seconds post-crash
- Flashlight burst + screen flash on impact detection

### Medical ID
- QR code containing blood group, medical conditions, emergency contacts
- Scannable by first responders even without internet
- Shareable link sent automatically during SOS

### Location & Rescue
- Real-time GPS tracking with reverse geocoding (OpenStreetMap)
- Live tracking mode with continuous position updates
- One-tap nearest hospital/ambulance search on Google Maps
- Copy/share location link

### Profile & SOS Contact
- Fully editable profile — name, phone, city, blood group, medical conditions
- Emergency contact management with inline editing
- Quick call/WhatsApp buttons for the SOS contact

### Authentication
- Email/password sign up and login
- Firebase Auth with session persistence
- Anonymous sign-in fallback

### Demo Mode
- Simulate High-Speed, Moderate, and Low-Speed crash scenarios
- See the full SOS response system without a real crash
- Available at `/demo`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Auth | Firebase Authentication |
| Database | Firebase Firestore |
| AI | Google Gemini via Genkit |
| SMS | Fast2SMS API |
| Charts | Recharts |
| QR Code | qrcode.react + QR Server API |
| Maps | Google Maps (links) + OpenStreetMap Nominatim |
| Sensors | DeviceMotion API, Geolocation API |
| Audio | Web Audio API |
| Torch | MediaDevices Camera Torch |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites
- Node.js 18+
- Firebase project
- Fast2SMS account (for SMS)
- Google Gemini API key

### Installation

```bash
git clone https://github.com/Spookyvegeta/guardianride.git
cd guardianride
npm install
```

### Environment Variables

Create a `.env` file:

```env
GEMINI_API_KEY=your_gemini_api_key
FAST2SMS_API_KEY=your_fast2sms_api_key
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002)

### Deploy to Vercel

```bash
vercel --prod
```

Add environment variables in Vercel dashboard → Project → Settings → Environment Variables.

---

## How Crash Detection Works

```
Device Motion Event (3000x/sec sampling)
        ↓
Noise Floor Gate (ignore < 0.15G linear, < 8°/s gyro)
        ↓
Low-Pass Filter (α = 0.15, smooths signal)
        ↓
Impact Threshold Check (> 5.8G linear OR > 8G total)
        ↓
2-Second Stillness Observation Window
        ↓
Verification: High rotation + post-impact stillness?
        ↓
Adaptive Countdown (5s / 8s / 15s based on severity)
        ↓
Auto SOS if no "I'm OK" response
```

### Adaptive Countdown Logic

| Condition | Countdown |
|---|---|
| High impact (>10G) + high speed (>50km/h) OR no movement | 5 seconds |
| High impact OR complete stillness | 8 seconds |
| Low-speed impact with some movement | 15 seconds |

---

## SOS Flow

```
Crash Confirmed
      ↓
GPS coordinates fetched
      ↓
┌─────────────────────────────────────┐
│  Simultaneous actions:              │
│  1. SMS → Emergency contact         │
│  2. WhatsApp → Emergency contact    │
│  3. Google Maps → Nearest hospital  │
│  4. WhatsApp → Hospital (pre-filled)│
│  5. Call 108 (Ambulance)            │
└─────────────────────────────────────┘
      ↓
Location update every 45s via WhatsApp
```

---

## Project Structure

```
src/
├── app/
│   ├── api/sos/          # Fast2SMS server-side SMS route
│   ├── dashboard/        # Main app dashboard
│   ├── demo/             # SOS demo simulation page
│   ├── login/            # Auth page
│   └── onboarding/       # User profile setup
├── components/
│   ├── AccidentMonitor   # Core crash detection + SOS UI
│   ├── AmbulanceFinder   # Nearest hospital/ambulance
│   ├── LocationTracker   # GPS tracking
│   ├── ProfileView       # Editable user profile
│   └── QRCard            # Medical ID QR code
├── lib/
│   ├── flashlight.ts     # Camera torch control
│   ├── hospital-sos.ts   # Hospital notification logic
│   ├── sos.ts            # WhatsApp + call triggers
│   ├── store.ts          # Firestore data hooks
│   └── types.ts          # TypeScript types
├── firebase/             # Firebase config + hooks
└── ai/                   # Genkit AI flows
```

---

## Limitations (Prototype)

- WhatsApp messages require user to tap Send (browser security restriction)
- Flashlight only works on Android Chrome over HTTPS
- SMS requires Fast2SMS account with ₹100+ balance
- Crash detection works best on mobile (requires motion sensors)
- iOS requires HTTPS for sensor + camera permissions

---

## License

MIT — built as a safety prototype for Indian roads.
