# 5 Day Challenge - Whop App

A countdown timer and RSVP tracking app for the Whop University 5-day challenge.

## Features

- ⏱️ **Countdown Timer** - Real-time countdown to January 26, 2026 at 4:00 PM EST
- 📝 **RSVP Tracking** - Track total RSVPs with localStorage persistence
- 🎨 **Beautiful UI** - Dark theme with orange accents, glassmorphism effects, and smooth animations
- 🔤 **Custom Font** - FFF-AcidGrotesk font family
- 🚀 **Whop App** - Integrated with Whop platform

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- Framer Motion
- @whop/react

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Whop App ID

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Edit .env.local with your Whop App ID
NEXT_PUBLIC_WHOP_APP_ID=your-app-id-here
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Deployment to Vercel

1. Push this repository to GitHub
2. Import the project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_WHOP_APP_ID` - Your Whop App ID (get it from https://whop.com/apps)
4. Deploy!

### Environment Variables Required

- `NEXT_PUBLIC_WHOP_APP_ID` - Your Whop App ID (required for Whop app integration)
- `WHOP_API_KEY` - Your Whop API Key (optional, for server-side operations if needed)

## Project Structure

```
5day-challenge/
├── app/
│   ├── layout.tsx          # Root layout with Whop wrapper
│   ├── page.tsx            # Main challenge page
│   └── whop-app-wrapper.tsx # Whop app wrapper component
├── components/
│   ├── CountdownTimer.tsx  # Countdown timer component
│   └── RSVPButton.tsx      # RSVP button with counter
└── public/
    └── fonts/              # FFF-AcidGrotesk font files
```

## License

MIT
