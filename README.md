# JobCrawler — Personal Job Aggregator

A full-stack job aggregator that pulls listings from multiple portals, displays them on a unified dashboard, and lets you track your applications.

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| State | Zustand + React Query |
| Backend | Node.js, Express, TypeScript |
| ORM | Prisma |
| Database | SQLite (local dev) |
| Auth | JWT + bcryptjs |
| File Uploads | Multer + pdf-parse + mammoth |

## Project Structure

```
job-crawler/
├── client/          # React frontend (Vite)
├── server/          # Express backend
│   ├── src/
│   │   ├── routes/  # API route handlers
│   │   ├── middleware/ # Auth + upload middleware
│   │   └── lib/     # Prisma client, crypto utils
│   └── prisma/      # Schema + seed
└── shared/          # Shared TypeScript types
```

## Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### 1. Install all dependencies

```bash
# From the root directory
npm install
npm install --prefix server
npm install --prefix client
```

### 2. Set up the database

```bash
cd server
npx prisma db push
tsx prisma/seed.ts
```

Or from root:

```bash
npm run db:push
npm run db:seed
```

### 3. Start development servers

```bash
# From root — starts both server (port 3001) and client (port 5173)
npm run dev
```

Or separately:
```bash
npm run dev:server   # Express API on http://localhost:3001
npm run dev:client   # Vite dev server on http://localhost:5173
```

### 4. Open the app

Navigate to **http://localhost:5173**, create an account, and complete onboarding.

## Environment Variables

Copy `.env.example` to `server/.env` and update values:

```env
PORT=3001
JWT_SECRET=your_long_random_secret
ENCRYPTION_KEY=32_character_key_for_aes_256
DATABASE_URL="file:./prisma/dev.db"
```

## Features

### Onboarding Flow
- **Step 1** — Profile: name, role, experience, job type preferences, locations, salary range
- **Step 2** — Resume: upload PDF/DOCX, auto-extract skills with editable tags
- **Step 3** — Completion summary → go to Dashboard

### Credential Manager (`/settings`)
- Add credentials for LinkedIn, Naukri, Indeed, Internshala, Wellfound
- Passwords encrypted with AES-256-GCM
- Test Connection button (mock simulation)
- Status badges: Connected / Failed / Pending

### Job Dashboard (`/`)
- 26 seeded mock jobs across all portals
- Search by title, company, or description
- Sidebar filters: portal, job type, location, date posted
- Manual Refresh button (simulates portal scraping)
- Save/unsave jobs with bookmark icon
- Paginated grid view

### Job Detail (`/jobs/:id`)
- Full description, company info, skills tags
- Save/unsave toggle
- "Track Application" button adds to tracker
- "Apply Now" opens original job URL

### Applications Tracker (`/tracker`)
- **Table view**: sortable with inline notes editing, status dropdown
- **Kanban view**: columns per status, move cards forward
- Filter by status
- Add manual entries (jobs applied outside the app)
- Delete with confirmation

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| GET/PUT | `/api/profile` | User profile |
| POST/GET | `/api/resume` | Upload/get resume |
| PUT | `/api/resume/:id/skills` | Update skills |
| GET/POST | `/api/credentials` | List/add credentials |
| PUT/DELETE | `/api/credentials/:id` | Update/delete credential |
| POST | `/api/credentials/:id/test` | Test connection |
| GET | `/api/jobs` | List jobs (with filters) |
| GET | `/api/jobs/:id` | Get job detail |
| POST | `/api/jobs/refresh` | Trigger refresh |
| POST/DELETE | `/api/jobs/save/:id` | Save/unsave job |
| GET | `/api/jobs/saved` | Get saved jobs |
| GET/POST | `/api/applications` | List/add applications |
| PUT/DELETE | `/api/applications/:id` | Update/delete application |
