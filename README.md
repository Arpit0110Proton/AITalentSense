# AI Talent Sense 

AI-assisted candidate sourcing. Paste a job description, get editable search filters, and receive candidates scored 0–100 against your exact requirements — with the reasoning to back it up.

## Quick Start

### Prerequisites
- Node.js 18+
- pnpm 8+
- A Supabase project (free tier)
- Two Groq API keys (free tier)

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd ai-talent-sense
pnpm install
```

### 2. Set up Supabase
1. Create a new Supabase project
2. Run the schema: go to SQL Editor → paste `apps/backend/scripts/schema.sql` → Run
3. Copy the Project URL and `service_role` secret key

### 3. Configure Environment
```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
```

Fill in:
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in backend `.env`
- `GROQ_API_KEY_PARSE` and `GROQ_API_KEY_SCORE` in backend `.env`
- Optionally `CRUSTDATA_API_KEY` for live data mode

### 4. Seed Mock Data
```bash
pnpm --filter backend seed
```
This creates 750 deterministic synthetic profiles (10 role families × 75 each).

### 5. Run Locally
```bash
pnpm dev
```
- Frontend: http://localhost:3000
- Backend: http://localhost:8080
- Health check: http://localhost:8080/health

## Architecture

```
ai-talent-sense/
├── apps/
│   ├── backend/       Express + TypeScript, Groq AI, Supabase
│   └── frontend/      Next.js 14, Framer Motion, Tailwind
├── pnpm-workspace.yaml
└── render.yaml        Render deployment blueprint
```

## Data Modes

| Mode | Trigger | Source |
|------|---------|--------|
| Demo | `CRUSTDATA_API_KEY` is empty | 1500 synthetic profiles from Supabase |
| Live | `CRUSTDATA_API_KEY` is set | Real-time CrustData Person Search API |

The mode is determined once at server boot and never changes at runtime.

## Entry Modes

The `/search` page offers three entry paths:
- **Upload JD** (default) — drag-and-drop or file picker for PDF / DOCX / TXT files up to 5 MB. The backend extracts text and parses filters via AI.
- **Paste JD** — paste the job description text directly into a textarea and extract filters via AI.
- **Manual filters** — skip AI parsing entirely and build search filters by hand.

## Migrations

After running the initial `schema.sql`, apply the following migration in the **Supabase SQL Editor** to enable job-title-grouped history:

```sql
alter table search_history add column if not exists job_title text;
create index if not exists idx_history_job_title on search_history (job_title);
```

> **Note:** This is an additive-only migration. It adds a nullable column and an index — no existing data is affected.

## Deployment

### Frontend → Vercel
1. Push to GitHub
2. Import repo in Vercel
3. Set root directory to `apps/frontend`
4. Set `NEXT_PUBLIC_API_BASE_URL` to your Render backend URL

### Backend → Render
1. Push to GitHub
2. `render.yaml` auto-creates the web service
3. Set all env vars in Render dashboard

## Built With
- **Next.js 14** — frontend framework
- **Express.js** — backend API
- **Supabase** — Postgres + RLS
- **Groq** — LLM inference (openai/gpt-oss-120b)
- **CrustData** — People API (optional)
- **Framer Motion** — animations
- **Tailwind CSS** — styling
- **TypeScript** — end to end

## License
Internship assignment — not for redistribution.
