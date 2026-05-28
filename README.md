# ai-assessment-creator

ai-assessment-creator is a small web app that uses AI to generate printable assessment papers from a short prompt and optional uploaded material. It provides a guided create flow, live generation progress, a review/preview screen with graph support, and PDF-style export.

Detailed features
-----------------
- **AI generation**: Submit a short title, question-type distribution and optional instructions; the backend queues a Groq job which returns a structured paper (sections, questions, options, answers, marks). The system validates distribution and marks to match the requested layout.
- **Upload source material**: Attach a short filename and data URL for optional uploaded material; the worker can include this as source context when prompting the model so questions can be tailored to the provided material.
- **Live progress & resilience**: A background worker performs Groq calls and emits progress over Socket.IO. The frontend shows simulated progress when updates are sparse and recovers gracefully if the worker restarts or the socket reconnects.
- **Graph & visual rendering**: Questions can include visual metadata; the preview supports both Recharts (static charts) and Desmos (interactive function plots) to render graphs and diagrams inside the paper preview and exported PDF.
- **Preview, paginate & export**: The review screen renders a paginated A4-like preview and includes print-friendly rules to produce a stable PDF export. Questions are prevented from splitting across pages where possible to avoid empty pages.
- **Save & revisit**: Generated assignments are persisted into MongoDB. You can re-open past assignments, re-run generation, or save final papers for later download.


Tech stack 
------------------
- Frontend
  - Next.js (App Router) — routing, SSR/SSG where applicable
  - React 19 + TypeScript — UI and types
  - Tailwind CSS — utility-first styling
  - Zustand — lightweight state management for form and generation state
  - Framer Motion — animations for transitions between loading and review
  - Recharts & Desmos — visual/chart rendering in questions

- Backend
  - Express + TypeScript — API server
  - Mongoose — MongoDB models and persistence
  - BullMQ + Redis — reliable background job queue for AI generation
  - Groq SDK — LLM interaction for structured output
  - Socket.IO — real-time progress/events from worker to frontend

Prerequisites
-------------
- Node.js 18+ and npm
- A running MongoDB instance (connection URI)
- A running Redis instance (for BullMQ)
- GROQ API key and model name
- Google OAuth client id (for sign in)

Setup & installation
--------------------
1. Clone the repository:

```bash
git clone <repo-url>
cd ai-assessment-creator
```

2. Install dependencies for each workspace:

```bash
cd backend
npm install

cd ../frontend
npm install
```

3. Create environment files (see Environment variables below) and start services in development:

```bash
# Backend (api + worker)
cd backend
npm run dev
npm run worker

# Frontend
cd ../frontend
npm run dev
```

Development scripts
-------------------
- Frontend (package.json):
  - `dev` — starts Next.js in development
  - `build` — builds the production bundle
  - `start` — starts the production server
  - `lint` — runs ESLint
- Backend (package.json):
  - `dev` — runs the API server with automatic TypeScript reloading
  - `worker` — runs the generation worker in watch mode
  - `build` — TypeScript compile
  - `start` — run compiled server
  - `start:worker` — run compiled worker

Project structure 
-----------------------------
- `backend/` — Express API, worker, Groq prompts and parser, Mongoose models, queues
  - `src/controllers` — API route handlers
  - `src/services` — AI generation and helper services
  - `src/queues` — BullMQ queue setup
  - `src/workers` — background worker that runs Groq generation
- `frontend/` — Next.js app (App Router), UI components, stores, types
  - `src/components` — UI building blocks and output review components
  - `src/views` — pages (create, dashboard, output)
  - `src/store` — Zustand stores for form + generation state
  - `src/lib` — API client and socket helpers

API endpoints
-------------
All API endpoints are prefixed with `/api` and expect an authenticated user where noted.

- `POST /api/auth/google` — exchange Google credential for session token
- `GET /api/auth/me` — (auth) fetch current user session

- `POST /api/assignments` — create a new assignment record and queue generation
- `POST /api/assignments/generate` — update or create assignment and queue generation (accepts optional `assignmentId`)
- `POST /api/assignments/generate/cancel` — cancel an in-flight generation job
- `GET /api/assignments/:assignmentId` — fetch a single assignment (including generated paper when ready)
- `POST /api/assignments/:assignmentId/save` — mark an assignment as saved
- `DELETE /api/assignments/:assignmentId` — delete an assignment
- `GET /api/assignments` — list assignments for the authenticated user

Environment variables
---------------------

Frontend environment variables (create `.env.local` in `frontend/`):

- `NEXT_PUBLIC_API_URL` — backend API origin (e.g. `http://localhost:4000`) (optional, defaults to `http://localhost:4000`)
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — Google OAuth client id used for client-side sign-in (optional but required for the Google button to initialize)

Backend environment variables (create `.env` in `backend/`):

- `NODE_ENV` — `development` | `production` (default: `development`)
- `PORT` — port for backend server (default: `4000`)
- `FRONTEND_URL` — frontend origin (e.g. `http://localhost:3000`)
- `MONGODB_URI` — MongoDB connection string (required)
- `REDIS_URL` — Redis connection string for BullMQ (required)
- `JWT_SECRET` — secret used to sign JWTs (min 24 chars) (required)
- `JWT_EXPIRES_IN` — JWT expiry string (default: `6h`)
- `GOOGLE_CLIENT_ID` — OAuth client id for server-side verification (used when exchanging tokens)
- `GROQ_API_KEY` — Groq API key (required)
- `GROQ_MODEL` — model name (default configured in code)
- `GROQ_TIMEOUT_MS` — request timeout for Groq in ms (default configured in code)


