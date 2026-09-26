# Maxpro Academy

Official customer learning and product-training platform for **Maxpro Infotech**.

**Learn. Practice. Master.**

Maxpro Academy helps customers learn Maxpro software through structured courses, screenshot-led written guides, knowledge checks, progress tracking, and verifiable certificates.

Videos are optional — the Academy launches with real product screenshots and written walkthroughs.

## MVP v1 boundary

The first release proves one journey:

> Sign in → find your product → take a Fundamentals course → learn via screenshots/guides → pass a knowledge check → earn a certificate → verify it.

### In scope (build now)

| Area | MVP |
| --- | --- |
| Products | Visible: Rockey, Pharma, Order AI, Agro (Van, Pulse, Kingo, BI, RocketSales hidden for now) |
| Courses | Fundamentals courses for Rockey, Pharma, Agro first |
| Lessons | Written guides + screenshots (videos optional) |
| Quizzes | Course-end knowledge check (70% pass, retry allowed) |
| Certificates | Issue + public verify at `/verify/[certificate-id]` |
| Dashboard | Continue learning, My courses, Explore products, Certificates |
| Admin | Products, courses, modules, lessons, quizzes, certificates, basic content health |
| Search | Basic Cmd/Ctrl+K across products, courses, lessons |
| Auth | Sign up, sign in, password reset, profile (+ demo mode) |

### Out of scope for v1

- Videos (not required to launch)
- Interactive screenshot hotspots
- Organizations / team assignments / manager dashboards
- AI assistant or AI course generation
- Gamification, badges, leaderboards
- Bookmarks, recently viewed, learning paths
- Email automation, advanced analytics, semantic search
- Mobile app (responsive web only)

### After launch

**v1.1** — videos, resources, bookmarks, learning paths, better analytics  
**v2** — organizations, team training, assignments, compliance reporting

## Tech stack

- **Next.js 16** (App Router) + React 19 + TypeScript
- **Tailwind CSS v4**
- **Supabase** (Auth, PostgreSQL, Storage, RLS)
- **Lucide React** icons
- **Framer Motion** (subtle motion only)
- **Zod** validation
- **jsPDF** certificate generation
- **Vitest** tests

## Features

### Learners

- Email/password signup, login, password reset
- Lightweight onboarding (products + role)
- Product and course catalogs (MVP: 4 products)
- Course detail with module accordion
- Lesson workspace with written guides, screenshots, and progress
- Course-end knowledge checks
- Course completion and certificates (`/verify/[id]`)
- Simple dashboard and search (Cmd/Ctrl+K)
- Responsive mobile experience

### Admins

- CMS for products, courses, modules, lessons, quizzes
- **AI Course Builder** (local Ollama) — draft course titles, modules, walkthrough lessons, and quizzes
- User role management
- Certificates overview
- Basic analytics and content health
- Announcements

## Getting started

### 1. Install

```bash
npm install
```

### 2. Environment

Copy `.env.example` to `.env.local` and fill in values:

```bash
cp .env.example .env.local
```

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_APP_URL` | App base URL |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser-safe anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only service role (never expose to browser) |
| `VIDEO_PROVIDER` | `placeholder` \| `external` \| `youtube` \| `vimeo` \| `mux` \| `cloudflare` |
| `VIDEO_PROVIDER_API_KEY` | Optional provider API key |
| `CERTIFICATE_SIGNING_SECRET` | Used when issuing verification tokens |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | Support contact |
| `NEXT_PUBLIC_SUPPORT_URL` | Support page URL |
| `OLLAMA_BASE_URL` | Local AI endpoint (default `http://127.0.0.1:11434`) |
| `OLLAMA_MODEL` | Preferred model (e.g. `llama3.2`, `mistral`, `qwen2.5`) |
| `OLLAMA_TIMEOUT_MS` | Generation timeout (default 180000) |

### Local AI (Ollama)

1. Install [Ollama](https://ollama.com)
2. Pull a model: `ollama pull llama3.2`
3. Open Admin → **AI Course Builder**
4. Paste a **YouTube playlist** (or single video) + topic → **Generate draft**
5. Each playlist video becomes one lesson with the video embedded → review → **Save course**

If Ollama is offline, playlist mapping still works (videos are attached even without AI polish).

If Supabase env vars are not set, the app runs in **demo mode** with an in-memory catalog, cookie-based session, and no external database. Use this only for local evaluation—not for production.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Production build

```bash
npm run build
npm start
```

## Supabase setup

When `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set, the app uses **Supabase Auth** and the **Postgres database** (external learner invites, activation, and admin CMS persist correctly on Vercel).

### 1. Create a project

In [Supabase Dashboard](https://supabase.com/dashboard) → **New project** → name e.g. **MaxAcademy**, choose a region, set a strong database password.

Or with the CLI (after `npm run supabase:login`):

```bash
npx supabase projects create --name MaxAcademy --org-id <org-id> --db-password "<strong-password>" --region eu-central-1
npx supabase link --project-ref <project-ref>
```

### 2. Auth URLs (Dashboard → Authentication → URL configuration)

| Setting | Value |
|--------|--------|
| Site URL | `http://localhost:3000` (add `https://maxpro-academy.vercel.app` for production) |
| Redirect URLs | `http://localhost:3000/**`, `https://maxpro-academy.vercel.app/**` |

### 3. API keys → `.env.local`

From **Project Settings → API**, copy into `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only; required for CSV import / bootstrap)

From **Project Settings → Database → Connection string (URI)**, add:

- `SUPABASE_DB_URL` (used only for migrations)

### 4. Apply database schema

**Option A — CLI (linked project):**

```bash
npm run supabase:push
```

**Option B — migration script (URI in `.env.local`):**

```bash
npm run supabase:migrate
```

Migrations in `supabase/migrations/` (001–006): schema, RLS, product seed, indexes, `course_kind`, `profiles.phone`.

### 5. Create super admin (optional demo seed)

Create an admin user (use your own email and a strong password; never commit secrets):

```bash
npm run supabase:bootstrap-admin -- your-admin@example.com "YourSecurePassword12!"
```

To load sample products, courses, and progress data for development:

```bash
npm run supabase:seed-demo
```

Account credentials for seeded users are defined in your private environment or team runbook—not in this repository.

### 6. Vercel

Add the same Supabase env vars to the Vercel project (Settings → Environment Variables), then redeploy.

## Architecture

```text
src/
  app/                 # App Router pages (marketing, auth, learner, admin)
  actions/             # Server actions (auth, progress, admin, certificates)
  components/
    ui/                # Design system
    lesson/            # Player, sidebar, quiz, workspace
    course/            # Cards, accordion, certificates
    admin/             # CMS forms
    layout/            # Header, footer, shells
    marketing/         # Landing composition
  lib/
    supabase/          # Browser + server clients
    data/              # Demo store + query wrappers
    video/             # VideoProvider abstraction
    certificates/      # Certificate number + PDF generation
    progress/          # Progress calculation
    analytics/         # Event tracking abstraction
    ai/                # Future AI interfaces (no chatbot UI)
    validations/       # Zod schemas
  types/               # Shared TypeScript types
supabase/migrations/   # SQL migrations
```

## Video provider abstraction

Large videos are never stored in PostgreSQL.

```ts
interface VideoProvider {
  upload(): Promise<string>
  getPlaybackUrl(): Promise<string>
  delete(): Promise<void>
}
```

Current providers:

- `placeholder` — development fallback
- `external` — direct URL / mp4
- `youtube` — embed normalization

Mux or Cloudflare Stream can be added later behind the same interface without rewriting the lesson UI.

## Core learning flow

```text
Signup → Login → Onboarding → Dashboard
  → Product → Course → Lesson → Video progress
  → Mark complete → Quiz → Course complete → Certificate
```

## Admin flow

```text
Admin login → Products → Courses → Modules → Lessons
  → Video + written content + quiz → Publish → Learners see content
```

## Certificates

- Number format: `MAXPRO-ACADEMY-YYYY-000001`
- Public verification: `/certificates/verify/[token]`
- PDF generation via `src/lib/certificates/generate.ts` and `/api/certificates/[id]/pdf`

## Testing

```bash
npm test
```

Coverage includes:

- Progress calculation
- Role authorization
- Demo catalog / search
- Auth validation schemas
- Utility helpers

Extend tests for RLS and integration once a Supabase test project is configured.

## Design principles

- Light mode default, restrained dark mode
- Deep navy (`#0B1F3A`), white, near-black, restrained blue accents
- Editorial typography and whitespace
- Cards only when they communicate grouping
- No fake statistics, testimonials, or invented product capabilities
- Product content is data-driven from the CMS / database

## Seeded products

Public Maxpro portfolio included as editable CMS records:

- Rockey
- RocketSales
- RocketSales Pharma
- RocketVan
- RocketPulse
- RocketOrder
- Kingo
- RocketBI

Seed course: **Rockey Fundamentals** (7 modules, sample lessons, one quiz).

Lesson copy beyond public positioning is instructional scaffolding — replace with Maxpro-approved screenshots and procedures in Admin.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | ESLint |
| `npm test` | Run Vitest |
| `npm run format` | Prettier |

## Deployment

1. Deploy to Vercel (or any Node host supporting Next.js).
2. Set all environment variables in the host.
3. Apply Supabase migrations.
4. Confirm `NEXT_PUBLIC_APP_URL` matches the production domain (needed for certificate verification links).
5. Keep `SUPABASE_SERVICE_ROLE_KEY` server-only.

## Future integrations

Prepared but not required for launch:

- Mux / Cloudflare Stream providers
- Google OAuth
- Semantic search via pgvector / embeddings
- “Ask about this product” assistant (approved knowledge only)
- Transcript generation and quiz generation services

See `src/lib/ai/future.ts` and `src/lib/video/provider.ts`.

## Support

- Email: helpdesk@maxproinfotech.com
- Company: [maxproinfotech.com](https://maxproinfotech.com)

---

Built for Maxpro Infotech as a scalable product education platform — not a demo mockup.
