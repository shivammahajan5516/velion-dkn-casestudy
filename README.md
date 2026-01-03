# Velion Digital Knowledge Network (DKN) — Offline-First Web Prototype

This repository contains a **full-stack knowledge management prototype** developed for the **MWCD (Web & Cloud Development)** module at the **University of West London**, directly aligned to the **Velion Dynamics Digital Knowledge Network (DKN) case study**. The system focuses on data integrity, contributor motivation, governance-controlled verification, and offline reliability for geographically distributed teams.

---

## System Overview

The prototype implements:
- **Open authentication** (any contributor can Sign Up / Sign In)
- **Knowledge Asset Repository** using URL or TEXT as knowledge source
- **SHA-256 hashing** to prevent duplicate submissions
- **Regional data sovereignty flagging** (EU vs Global residency demo)
- **Governance approval gate** using a protected **Governance ID (`VELION-2026`)**
- **Points awarded only after verification**
- **Leaderboard ranked by points**
- **Offline-First queue system** using **IndexedDB**, enabled as a **Progressive Web App (PWA)**

---

## Architecture

React (Vite) Frontend
↓ (Fetch API — no Axios)
Express.js REST API Backend
↓ (Mongoose ODM)
MongoDB Repository (Local or Atlas Cloud)


---

## Implemented Core Rules

| Rule | Implementation |
|------|---------------|
| Uniqueness | `SHA-256(title + sourceType + sourceValue)` stored as unique `hash` field |
| Visibility | Assets remain `PRIVATE` until `VERIFIED` |
| Governance | Approval endpoints only accessible with `govId=VELION-2026` |
| Points | Awarded only after governance approval |
| Offline Sync | Submissions stored in IndexedDB queue when offline, auto-sync when online |

---

## Tech Stack

- **Frontend:** React, Vite, Fetch API, PWA (Service Worker + Cache)
- **Backend:** Node.js, Express.js, JWT, bcrypt, CORS, Mongoose
- **Database:** MongoDB (local or Atlas)
- **Hosting:** Vercel (Frontend), Render (Backend), MongoDB Atlas (DB)
- **Monitoring (future scope):** PWA offline cache + IndexedDB queue sync

---

## Local Setup (PowerShell)

```powershell
# Clone the repo
git clone <YOUR_GITHUB_REPO_URL>
cd velion-dkn

# Backend setup
cd backend
npm install
npm run dev

# Frontend setup (new terminal)
cd ../frontend
npm install
npm run build   # for production preview
npm run dev


**## API ENDPOINTS**

# Authentication
POST /api/auth/signup
POST /api/auth/signin
GET  /api/auth/me

# Knowledge Assets
POST /api/assets
GET  /api/assets?query=

# Governance Approval (protected via ID gate)
GET  /api/governance/pending?govId=VELION-2026
POST /api/governance/approve/:id?govId=VELION-2026
POST /api/governance/reject/:id?govId=VELION-2026

# Leaderboard
GET /api/leaderboard



---

You can now push this file to GitHub using:

```powershell
cd $HOME\velion-dkn
git add .
git commit -m "Updated README single page"
git push
