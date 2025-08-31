# Jarvis App 🕷️🧙‍♂️💰🎮

> A Marvel-inspired multi-module platform that brings together finance analytics, interactive gaming, real-time event alerts, and an intelligent spell library — all powered by modern web tech, AI, and real-time databases.

---

## 🚀 Quick Start

1. Clone the repository:

```bash
git clone <repo-url>
```

2. Navigate to the project directory:

```bash
cd infinity-web
```

3. Install dependencies:

```bash
npm install
```

4. Start the development server:

```bash
npm run dev
```

The app uses the Next.js 14 default folder structure, with modules organized under their respective organizational folders.

---

## 🌌 Overview

After Thanos snapped his fingers, all superheroes were wiped out… except four heroes left to rebuild civilization:

1. Spider-Man 🕷️ — Searches for survivors and manages real-time events.  
2. Iron Man (Stark) 🤖 — Oversees the finance module, rebuilding industry and Earth’s economy.  
3. Dr. Stephen Strange 🧙‍♂️ — Casts spells to reverse the snap and restore balance.  
4. Groot 🌱 — Guides users through an interactive game in a living, immersive environment.

Each hero’s abilities are reflected in their corresponding module.

---

## 🏗️ Module Breakdown

### 1. Groot GamePlay — Interactive Game 🎮

- Frontend: React + Tailwind  
- Gameplay: Combat monsters, earn XP & gold, buy upgrades in a store.  
- Leaderboard: Tracks global rankings in real-time.  
- Backend: Convex provides live updates, syncing player stats instantly.  
- Narrative: Dynamic storylines generated via OpenAI.  
- Assets: Images from Freepik, sound effects from Pixabay.

Screenshot / GIF Placeholder:

![Groot Gameplay Screenshot](./public/screenshots/groot_gameplay.png)

---

### 2. Starkledger — Financial AI Assistant 💰

- Purpose: Upload Excel sheets to gain AI-driven insights and forecasts.  
- Charts & Dashboard: Built with Shadcn UI and Recharts, featuring interactive filters.  
- AI Integration:  
  - Data cleaning with OpenAI (removes invalid rows)  
  - Predictive forecasting per department  
  - Risk assessment with confidence scoring  
- UX:  
  - Holographic-style cards, gradient backgrounds, premium typography  
  - Smooth animations with Framer Motion  
  - Export options using jspdf + html2canvas

Screenshot / GIF Placeholder:

![Starkledger Screenshot](./public/screenshots/starkledger.png)

---

### 3. Spydersense — Real-time Event Alerts 🗺️

- Map Integration: Google Maps displays daily incidents and locations.  
- Alerts: Popups with ringing notifications for urgent events.  
- Communication: Direct video calls via ZegoCloud for immediate action.  
- Backend: Convex real-time database for events and syncing.  
- Auth: Clerk authentication, syncing via webhooks to Convex.  
- Access Control: Restricts guests from sensitive actions.

Screenshot / GIF Placeholder:

![Spydersense Screenshot](./public/screenshots/spydersense.png)

---

### 4. Spell Library — Intelligent Knowledge Base 🧙‍♂️

- Upload & Storage: Doc/PDF spells stored in Convex.  
- Summarization: OpenAI generates concise summaries.  
- Chatbot Interface: Ask questions about spells dynamically.  
- Access Control: Level 3 spells restricted to authenticated users.  
- UI: Responsive, clean components using Shadcn.  
- Animations: Subtle motion effects to bring cards and badges to life.

Screenshot / GIF Placeholder:

![Spell Library Screenshot](./public/screenshots/spell_library.png)

---

## 🛠️ Tech Stack

- Frontend: Next.js 14 (App Router), React, TypeScript, Tailwind CSS, Shadcn UI  
- Charts: Recharts for dynamic analytics  
- State & Database: Convex (real-time)  
- AI: OpenAI (GPT-4/4o) for JSON-mode data cleaning, forecasting, and chatbot  
- Authentication: Clerk  
- Video: ZegoCloud for real-time calls  
- Animations: Framer Motion for smooth interactions  
- Exports: jspdf + html2canvas

---

## 🗂️ Folder Structure

```bash
infinity-web/
├── app/                   # Next.js App Router
│   ├── layout.tsx         # Main layout & navigation
│   ├── page.tsx           # Home page with cinematic intro
│   ├── game/              # Groot GamePlay module
│   ├── finance/           # Starkledger module
│   ├── spydersense/       # Real-time alerts
│   └── spells/            # Spell Library module
├── components/            # Reusable UI components
├── lib/                   # Utilities & AI integration
└── public/                # Static assets (images, audio, screenshots)
```

---

## 🎯 Summary

Jarvis App combines real-time, AI-driven, and interactive experiences under one cohesive, Marvel-themed UI. Each module leverages modern web technology to provide dynamic, engaging, and technically robust functionality, perfect for hackathons, demos, or learning projects.

Visual assets (screenshots and GIFs) give an instant feel of the cinematic and interactive experience.

---

If you want, I can also add an “Installation Video GIF” at the top showing cloning, npm install, and dev server startup — that usually impresses judges at hackathons.

Do you want me to do that?