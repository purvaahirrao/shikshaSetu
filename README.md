# ShikshaSetu v2 — AI Learning App (Premium UI)

A **production-grade MVP** with Next.js + Tailwind CSS frontend and FastAPI backend.
Duolingo-inspired design: clean cards, rounded buttons, smooth animations, green/blue palette.

---

## 📁 Project Structure

```
shikhasetu/
├── client/                        ← Next.js frontend
│   ├── pages/
│   │   ├── _app.jsx               ← Auth context wrapper
│   │   ├── index.jsx              ← Login (Google + Manual)
│   │   ├── home.jsx               ← Dashboard
│   │   ├── scan.jsx               ← Camera / upload
│   │   ├── result.jsx             ← Answer + explanation + TTS
│   │   ├── chat.jsx               ← AI chat interface
│   │   └── progress.jsx           ← Stats, badges, streaks
│   ├── components/
│   │   ├── ui/                    ← Button, Card, Badge, Spinner, Toast, Avatar, ProgressBar
│   │   └── layout/                ← AppShell (topbar + bottom nav)
│   ├── hooks/
│   │   └── useAuth.js             ← Firebase + manual auth context
│   ├── services/
│   │   ├── firebase.js            ← Firebase config + auth helpers
│   │   └── api.js                 ← Backend API calls
│   ├── styles/
│   │   └── globals.css            ← Tailwind + Google Fonts + component classes
│   ├── tailwind.config.js
│   ├── next.config.js
│   └── .env.local.example
│
└── server/                        ← FastAPI backend
    ├── main.py                    ← Routes: /ocr /solve /chat
    ├── ocr.py                     ← EasyOCR → Tesseract fallback
    ├── ai.py                      ← Subject detection + mock knowledge base
    ├── cache.py                   ← In-memory cache with 24h TTL
    └── requirements.txt
```

---

## 🚀 Quick Start

### Backend

```bash
cd server
python -m venv venv && source venv/bin/activate    # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
# API running at http://localhost:8000
```

### Frontend

```bash
cd client
npm install
cp .env.local.example .env.local   # Fill in your Firebase keys (or skip for manual auth)
npm run dev
# App running at http://localhost:3000
```

---

## 🔑 Firebase Google Auth Setup

### Step 1 — Create Firebase project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → give it a name → Continue
3. Disable Google Analytics (optional) → **Create project**

### Step 2 — Enable Google Sign-In

1. In the left sidebar: **Authentication** → **Sign-in method**
2. Click **Google** → Enable → Add your support email → **Save**

### Step 3 — Register your web app

1. In Project Overview, click the **</>** (Web) icon
2. Register the app with a nickname (e.g. "shikhasetu-web")
3. Copy the `firebaseConfig` object shown

### Step 4 — Add authorised domains

1. **Authentication** → **Settings** → **Authorised domains**
2. Add `localhost` (already there by default)
3. For production, add your deployed domain

### Step 5 — Fill in .env.local

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123...:web:abc...
NEXT_PUBLIC_API_URL=http://localhost:8000
```

> **No Firebase?** Just use the **Manual Login** tab on the login screen — no setup needed.

---

## 🌐 API Reference

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET    | `/`      | —    | `{ status, app }` |
| POST   | `/ocr`   | `image` (multipart) | `{ text, chars }` |
| POST   | `/solve` | `{ question, language }` | `{ answer, steps, tip, subject, labels, cached }` |
| POST   | `/chat`  | `{ message, language }` | `{ answer, steps, tip, subject, labels }` |

### Example

```bash
curl -X POST http://localhost:8000/solve \
  -H "Content-Type: application/json" \
  -d '{"question":"What is photosynthesis?","language":"english"}'
```

---

## 🔧 Upgrade to Real LLM

Replace `generate_answer()` in `server/ai.py`:

```python
import anthropic

client = anthropic.Anthropic(api_key="YOUR_KEY")

def generate_answer(question, language="english", chat_mode=False):
    prompt = f"""You are a friendly teacher for Indian school students (Class 1-10).
Answer in {language}. Format your response as JSON:
{{"answer":"...","steps":["...","..."],"tip":"...","subject":"math|science|english|social_science|general"}}

Question: {question}"""

    msg = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=1024,
        messages=[{"role":"user","content":prompt}]
    )
    import json
    data = json.loads(msg.content[0].text)
    data["language"] = language
    data["labels"]   = LABELS.get(language, LABELS["english"])
    return data
```

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Primary green | `#22c55e` (brand-500) |
| Dark green | `#16a34a` (brand-600) |
| Slate background | `#f8fafc` |
| Card background | `#ffffff` |
| Display font | Nunito (700–900) |
| Body font | DM Sans (400–600) |
| Border radius | `1rem` (2xl) – `2rem` (4xl) |
| Shadow | `0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.06)` |

---

## 📱 Features Checklist

- [x] Google Sign-In (Firebase)
- [x] Manual login fallback (name + class + language)
- [x] Home dashboard with streak banner + quick stats
- [x] Scan page with camera capture + drag-and-drop upload
- [x] OCR extraction (EasyOCR → Tesseract)
- [x] Editable extracted text on Result page
- [x] Answer + numbered step-by-step explanation
- [x] Text-to-Speech (browser SpeechSynthesis)
- [x] Language switcher (English / हिंदी / मराठी)
- [x] Chat UI with typing indicator + suggestion chips
- [x] Progress page: stats, weekly calendar, subject bars, badges
- [x] In-memory cache (24h TTL) to avoid duplicate AI calls
- [x] Fully responsive, mobile-first layout
- [x] Bottom navigation with active state
- [x] Staggered entrance animations (Tailwind keyframes)

---

## 🛠 Troubleshooting

| Problem | Fix |
|---------|-----|
| Google sign-in popup blocked | Allow popups for localhost in browser |
| `easyocr` install fails | `pip install easyocr --timeout 120` (large model download) |
| CORS error | Confirm backend is on port 8000 and CORS allows `*` |
| Speech not working | Use Chrome/Edge; iOS Safari needs a user gesture first |
| Firebase auth error | Check that `localhost` is in authorised domains |
