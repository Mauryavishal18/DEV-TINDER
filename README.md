# 🚀 DevTinder v2.0 — Unite. Code. Build the Future.
**Built by Vishal Maurya** — Production-level developer collaboration platform

---

## 📁 Structure
```
devtinder-v2/
├── frontend/   ← React + Vite + Tailwind (Midnight Green Matrix UI)
└── backend/    ← Node.js + Express + MongoDB + Socket.io
```

---

## ⚙️ Setup in VS Code

### Step 1 — Backend
```bash
cd backend
npm install
```
Create `.env` in backend folder:
```
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/devtinder
JWT_SECRET=Vishal_Maurya_DevTinder_v2_2024_Secret
PORT=3000
FRONTEND_URL=http://localhost:5173
```
```bash
npm run dev
```
✅ Shows: `🚀 DevTinder Server v2 — Port 3000`

### Step 2 — Frontend (New Terminal)
```bash
cd frontend
npm install
npm run dev
```
✅ Shows: `Local: http://localhost:5173`

### Step 3 — Get Groq API Key (Free AI)
1. Go to https://console.groq.com
2. Sign up free → Create API Key
3. Open `frontend/src/utils/constants.js`
4. Replace `gsk_YOUR_GROQ_KEY_HERE` with your key

---

## ✨ Features

| Feature | Status |
|---------|--------|
| Matrix Green UI + animations | ✅ |
| Signup / Login | ✅ |
| Developer feed (swipe) | ✅ |
| Pass / Connect with match animation | ✅ |
| Real-time chat (Socket.io) | ✅ |
| Profile with skills | ✅ |
| Photo upload + 12 Avatar options | ✅ |
| GitHub real stats (repos, stars, language) | ✅ |
| LeetCode real stats (solved, rank) | ✅ |
| LinkedIn/GFG profile link | ✅ |
| Platform data saved to MongoDB | ✅ |
| Real GitHub contribution graph | ✅ |
| Real endorsements (from connections) | ✅ |
| Groq AI assistant (llama-3, free) | ✅ |
| Connection requests (accept/reject) | ✅ |
| Toast notifications | ✅ |
| About/Landing page | ✅ |
| 404 page | ✅ |
| Rate limiting + Helmet security | ✅ |
| Page refresh — session preserved | ✅ |

---

## 🤖 Groq AI Setup
Get free key: https://console.groq.com
- Free: 14,400 requests/day, no credit card
- Model: llama-3.1-8b-instant (super fast)

© 2024 DevTinder · Built by Vishal Maurya
