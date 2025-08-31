# Jarvis App

> A Marvel-inspired multi-module platform featuring an AI-powered finance dashboard (Starkledger), an interactive game (Groot GamePlay), real-time event alerts (Spydersense), and an intelligent spell library — all built with Next.js 14, TypeScript, Shadcn UI, Convex, and OpenAI.

---

## Table of Contents
- [Overview](#overview)
- [Features](#features)
  - [Starkledger — Financial AI Assistant](#starkledger--financial-ai-assistant)
  - [Groot GamePlay — Interactive Game](#groot-gameplay--interactive-game)
  - [Spydersense — Real-time Event Alerts](#spydersense--real-time-event-alerts)
  - [Spell Library — Intelligent Knowledge Base](#spell-library--intelligent-knowledge-base)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Run the App](#run-the-app)
- [Usage Guide](#usage-guide)
  - [Finance Data Processing API](#finance-data-processing-api)
- [Design System](#design-system)
- [Security & Access Control](#security--access-control)
- [Exporting & Reports](#exporting--reports)
- [Contributing](#contributing)
- [License & Attribution](#license--attribution)

---

## Overview
**Jarvis App** brings together four complementary modules under one cohesive UI:

1. **Starkledger** — Upload an Excel file and get real-time dashboards, AI data cleaning, forecasting, and risk signals.
2. **Groot GamePlay** — Combat monsters, earn XP and gold, use a store for upgrades, and compete on a global leaderboard.
3. **Spydersense** — Display daily incidents on Google Maps with ringing alerts and instant ZegoCloud video calls.
4. **Spell Library** — Upload spells (doc/pdf), automatically summarize them with OpenAI, and query them via a chatbot.

All modules share a **modern, responsive Shadcn UI** with a Marvel-inspired aesthetic.

---

## Features

### Starkledger — Financial AI Assistant
#### 🎨 Aesthetic
- Dark mode by default with **Arc Reactor blue** accents
- Holographic-style **cards**, subtle **glows**, gradient backgrounds
- Premium typography and breathing space

#### 📊 Advanced Analytics
- **Recharts** for interactive charts
- Real-time processing of your **Excel** dataset
- **AI insights** (OpenAI) and forecasting
- Responsive across all screen sizes

#### 🤖 AI Integration
- AI **data cleaning** (invalid rows removed)
- Predictive **forecasts** per department
- **Risk assessment** with confidence levels
- Natural-language **insights & recommendations**

#### ⚡ Performance
- Smooth **Framer Motion** animations
- Optimized file uploads with progress tracking
- Robust error handling & efficient data shaping
- **Export** to PDF/PNG via `jspdf` + `html2canvas`

#### 🎯 How to Use
- **Upload Excel**: drag & drop your file
- **View Dashboard**: `/dashboard` for KPIs
- **Explore Analytics**: `/analytics` for AI forecasts
- **Monitor Alerts**: budget overruns & risk flags
- **Export Reports**: generate board-ready PDFs

---

### Groot GamePlay — Interactive Game
- **Objective**: Defeat monsters to gain **XP** and **gold**
- **Combat**: **Attack**, **Block**, or **Runaway** (running costs HP)
- **Store**: Buy upgrades, weapons, health potions
- **Leaderboard**: Global ranking to foster competition
- **Real-time backend**: **Convex** for live updates
- **Narrative text**: Generated with ChatGPT
- **Assets**: Images from Freepik; audio from Pixabay

---

### Spydersense — Real-time Event Alerts
- **Map UI**: Daily events and locations on **Google Maps**
- **Ringing Alerts**: Instant popup for urgent incidents
- **Video Calls**: **ZegoCloud** integration for immediate help
- **Backend**: **Convex** real-time storage & sync
- **Auth**: **Clerk** (with Convex webhook syncing)
- **Access Control**: Guests restricted from sensitive actions

---

### Spell Library — Intelligent Knowledge Base
- **Upload & Store**: Spells in **doc/pdf** saved in Convex
- **Summaries**: Auto-summarized via **OpenAI**
- **Chatbot**: Ask questions about your spells
- **Access Control**: Level 3 and certain summaries gated to authenticated users
- **UI**: Clean, responsive **Shadcn** components

---

## Tech Stack
- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS, Shadcn UI
- **Charts**: Recharts
- **State/Data**: Convex (real-time database)
- **AI**: OpenAI (GPT-4/4o/4o-mini for JSON-mode cleaning & forecasts)
- **Auth**: Clerk
- **Video**: ZegoCloud
- **Animations**: Framer Motion
- **Exports**: `jspdf` + `html2canvas`

---

## Project Structure

```txt
starkledger-dashboard/
├── app/                    # Next.js 14 App Router
│   ├── layout.tsx         # Main app wrapper
│   ├── page.tsx           # Home page (redirects to dashboard)
│   ├── dashboard/page.tsx # Main dashboard view (Starkledger)
│   ├── analytics/page.tsx # AI forecasting page (Starkledger)
│   └── api/               # Backend API endpoints (e.g., process-data)
├── components/            # Reusable UI components
├── lib/                   # Utilities and business logic
└── public/                # Static assets
