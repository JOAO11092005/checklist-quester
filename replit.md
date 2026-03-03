# Code Evolution - Course Platform

A React + Vite course/learning platform ("Code Evolution") with Firebase backend integration.

## Tech Stack

- **Frontend**: React 18, Vite 5
- **Routing**: React Router DOM v6
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Styling**: CSS Modules, React Toastify, custom CSS
- **Charts**: Recharts
- **Media**: React Player, HLS.js
- **Animations**: tsParticles, canvas-confetti
- **Icons**: Lucide React, React Icons

## Project Structure

- `src/` - Main React source code
  - `App.jsx` - Root component with routing
  - `main.jsx` - Entry point
  - `components/` - Reusable UI components (auth, chat, course, layout, etc.)
  - `context/` - React Context (AuthContext)
  - `firebase/` - Firebase config
  - `pages/` - Page-level components
  - `services/` - Firebase service layer
  - `styles/` - Global CSS
  - `utils/` - Utility helpers
- `public/` - Static HTML files (admin, login, cadastro)
- `functions/` - Firebase Cloud Functions
- `bot/` - Discord bot (bot.cjs)

## Dev Server

- Host: `0.0.0.0`, Port: `5000`
- Command: `npm run dev`
- `allowedHosts: true` for Replit proxy compatibility

## Deployment

- Target: Static site
- Build: `npm run build`
- Output: `dist/`
