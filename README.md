# Smart Study — AI-Powered Student Companion

Smart Study is a full-stack web application that helps students learn more effectively using AI. It transforms raw notes and study materials into interactive summaries, quizzes, and personalised study plans — all in one place.

---

## What It Does

Students upload their notes (PDFs, images, or plain text) and the app uses AI to generate:

- **Instant summaries** — short, detailed, or key-point formats, written the way a tutor would explain them
- **Adaptive quizzes** — auto-generated multiple-choice questions with scoring and a 30-second timer per question
- **24/7 AI chat tutor** — ask any question and get clear answers with examples and follow-up suggestions
- **Voice note recording** — speak during a lecture and have your words transcribed and saved as a note automatically
- **Study planner** — drag-and-drop weekly schedule with a built-in Pomodoro timer
- **Progress analytics** — XP points, streaks, heatmaps, and badges that make studying feel like a game

---

## How It Helps Students

| Problem | What Smart Study Does |
|---|---|
| Long, dense lecture notes | Generates concise summaries in seconds |
| Not knowing what to study | Creates targeted quizzes from your own material |
| Studying alone with no one to ask | Provides an AI tutor available at any time |
| Forgetting content from lectures | Lets you record and transcribe class audio on the spot |
| Poor time management | Offers a visual planner with Pomodoro focus sessions |
| Lack of motivation | Tracks streaks, XP, and rewards progress with badges |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [TanStack Start](https://tanstack.com/start) (React 19) |
| Routing | TanStack Router (file-based) |
| Data fetching | TanStack Query v5 |
| Styling | Tailwind CSS v4 + Radix UI primitives |
| Animations | Framer Motion |
| Forms | React Hook Form + Zod |
| HTTP client | Axios |
| Notifications | Sonner |
| Build tool | Vite 7 |
| Language | TypeScript 5 (strict mode) |
| Backend | Express API (separate repo, runs on port 5000) |

---

## Project Structure

```
src/
├── routes/              # File-based pages (TanStack Router)
│   ├── index.tsx        # Public landing page
│   ├── login.tsx
│   ├── register.tsx
│   ├── forgot-password.tsx
│   └── app/             # Protected routes (requires login)
│       ├── route.tsx    # Auth guard + app shell
│       ├── index.tsx    # Dashboard
│       ├── notes.tsx    # Upload & manage notes
│       ├── summary.tsx  # AI-generated summaries
│       ├── quiz.tsx     # Quiz with timer and scoring
│       ├── chat.tsx     # AI tutor chat
│       ├── planner.tsx  # Study planner + Pomodoro
│       ├── analytics.tsx
│       ├── settings.tsx
│       └── record.tsx   # Voice note recording
├── services/            # API call functions
├── components/          # Shared UI components
├── context/             # Auth context
├── lib/                 # Axios instance, utilities, mock data
├── hooks/
└── types/               # Global TypeScript declarations
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A running backend API server (see backend repo) on port 5000

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd Student-buddy

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

Edit `.env` and set the backend URL:

```env
VITE_API_URL=http://localhost:5000
```

### Running the app

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Base URL of the backend API | `http://localhost:5000` |

---

## Backend API

The frontend expects a REST API with these endpoints:

| Endpoint | Purpose |
|---|---|
| `POST /api/auth/login` | Authenticate user |
| `POST /api/auth/register` | Register new user |
| `POST /api/notes/upload` | Upload a note file |
| `GET /api/notes` | List all notes |
| `DELETE /api/notes/:id` | Delete a note |
| `GET /api/ai/summarize/:noteId` | Generate AI summary |
| `POST /api/ai/quiz/:noteId` | Generate quiz questions |
| `POST /api/ai/chat` | Send message to AI tutor |
| `POST /api/ai/explain` | Explain a concept |
| `GET /api/quiz` | List saved quizzes |
| `POST /api/quiz/:id/attempt` | Submit quiz attempt |
| `GET /api/planner` | Get planner tasks |
| `POST /api/planner` | Create planner task |
| `GET /api/dashboard/stats` | Get dashboard statistics |

---

## Key Features in Detail

### Note Upload & Management
Upload PDFs, images, or text files. Notes are listed with metadata and can be sent directly to the AI for summarisation or quiz generation.

### AI Summaries
Choose between a short summary, a detailed breakdown, or a key-points list. Summaries are cached so repeated requests are instant.

### Quizzes
Select a note or type a topic, and the AI generates 5 multiple-choice questions. Each question has a 30-second countdown. Final score is saved and tracked over time.

### AI Chat Tutor
A persistent chat interface. Pre-built prompt suggestions help students get started quickly. Supports follow-up questions and concept explanations.

### Voice Recording
Uses the Web Speech API (Chrome/Edge) to transcribe speech in real time during class. The transcript is saved as a note and can immediately be summarised or turned into a quiz.

### Study Planner
A weekly grid (Mon–Sun, 8 AM–7 PM) for scheduling study sessions. Drag to reorder tasks. Built-in Pomodoro timer (25-minute focus + 5-minute break) with visual controls.

### Analytics
Tracks daily study streaks, total XP earned, quiz scores over time, a GitHub-style activity heatmap, and achievement badges.

---

## Development Notes

- All routes under `/app` require authentication. Unauthenticated users are redirected to `/login`.
- Auth tokens are stored in `localStorage` and attached to every API request via an Axios interceptor.
- The app supports light and dark mode, persisted to `localStorage`.
- Voice recording requires a secure context (HTTPS or localhost) and a Chromium-based browser.
- Run `npm run lint` to check for ESLint issues and `npx tsc --noEmit` for type errors.
