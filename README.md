# TournMate Web

React + TypeScript web app for [TournMate](https://tournmate.com) — account creation, profile setup, and app download for Android/desktop users. Built with Vite, Firebase Auth, and Firebase Hosting.

## Structure

```
src/
  components/     Reusable UI components (Navbar, Footer, auth forms)
  pages/          Route-level pages (Landing, Login, ProfileSetup, Dashboard)
  services/       Firebase init, auth wrappers, API client
  hooks/          React context/hooks (useAuth, useScrollReveal)
  App.tsx          Router + auth gate
  main.tsx        Entry point
  index.css       Global styles (ported from original marketing site)
public/
  assets/         Static assets (app icon, screenshots, badges)
```

## Prerequisites

- Node.js 20+
- Firebase CLI (`npm install -g firebase-tools`)
- Firebase project credentials in `.env.development` and `.env.production`

## Local Development

```bash
npm install
npm run dev          # Starts Vite dev server at http://localhost:5173
```

## Environment

| File               | Firebase Project  | URL                     |
|--------------------|-------------------|-------------------------|
| `.env.development` | `tournmate-dev`   | `dev.tournmate.com`     |
| `.env.production`  | `tournmate-prod`  | `www.tournmate.com`     |

Copy the Firebase web config values from the Firebase console into each `.env.*` file.

## Build & Deploy

```bash
# Dev
npm run build -- --mode development
firebase deploy --only hosting -P dev

# Production
npm run build
firebase deploy --only hosting -P prod
```

## Features

- Marketing landing page with scroll-driven animations
- Firebase Auth (Email/Password, Google, Apple Sign-In)
- Profile creation (name, gender, avatar, home region)
- QR code for iOS App Store download
- Protected routes with auth gate
- Terms & Conditions and Privacy Policy pages

## License

Copyright 2026 s2aglobalLLC. All rights reserved.
