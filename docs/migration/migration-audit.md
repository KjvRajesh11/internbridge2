# InternBridge: MERN Stack Re-Engineering & Migration Audit

## Executive Summary
This document records the architectural audit of the InternBridge codebase conducted prior to executing the full migration from Next.js 16 + PostgreSQL/Supabase to a pure MERN stack (MongoDB, Express.js, React 19 + Vite, Node.js + TypeScript).

---

## 1. Current State Inventory

### 1.1 Frontend
- **Framework:** Next.js 16.4.3 (App Router) with React 19.3.0
- **Routing:** File-system based App Router (`src/app/**/page.tsx`)
- **Navigation:** Next.js specific (`next/link`, `next/navigation`, `useRouter`, `usePathname`, `useSearchParams`)
- **Styling:** Tailwind CSS v4.3.3 (`@tailwindcss/postcss`), custom design tokens in `@theme`
- **Design System:** High-contrast Editorial Black, White and Brand Red (`#E42316`, `#080808`, `#FFFFFF`, `#F5F5F3`, `#0A0A0A`, `#DEDEDE`)
- **Pages (33 User-Facing Routes):**
  - **Public (10):** `/`, `/internships`, `/internships/:id`, `/features`, `/how-it-works`, `/login`, `/register/student`, `/register/recruiter`, `/privacy`, `/terms`
  - **Student (10):** `/student/dashboard`, `/student/applications`, `/student/applications/:id`, `/student/agents`, `/student/interviews`, `/student/interviews/:id/prep`, `/student/profile`, `/student/portfolio`, `/student/notifications`, `/student/settings`
  - **Recruiter (13):** `/recruiter/dashboard`, `/recruiter/internships`, `/recruiter/internships/new`, `/recruiter/internships/:id/edit`, `/recruiter/applicants`, `/recruiter/applicants/:id`, `/recruiter/applicants/:id/evaluate`, `/recruiter/pipeline`, `/recruiter/interviews`, `/recruiter/analytics`, `/recruiter/company`, `/recruiter/notifications`, `/recruiter/settings`
- **Shared Components (5):**
  - `Navbar.tsx`
  - `Footer.tsx`
  - `DemoSwitcher.tsx`
  - `StatusBadge.tsx`
  - `ApplyModal.tsx`

### 1.2 Backend & API
- **Framework:** Next.js Route Handlers (`src/app/api/**/route.ts`)
- **Endpoints (11 Route Handlers):**
  - `/api/auth/me` (GET)
  - `/api/auth/switch-user` (POST)
  - `/api/internships` (GET, POST)
  - `/api/internships/[id]` (GET, PATCH, DELETE)
  - `/api/applications` (GET)
  - `/api/applications/apply` (POST)
  - `/api/applications/[id]/status` (PATCH)
  - `/api/interviews/slots` (GET, POST)
  - `/api/interviews/schedule` (POST)
  - `/api/interviews/feedback` (POST)
  - `/api/agents/status` (GET)
  - `/api/agents/hunter` (POST)
  - `/api/agents/personalize` (POST)
  - `/api/agents/auto-apply` (POST)
  - `/api/agents/evaluate-mock` (POST)
  - `/api/agents/prep` (POST)

### 1.3 Persistence & Storage
- **MemoryDatabase (`src/lib/storage/db.ts`):** In-memory Map-based singleton holding initial seed data for 17 entity collections.
- **Supabase SSR Helpers (`src/lib/supabase/*`):** Browser and Server client helpers (conditional on environment variables).
- **PostgreSQL Schema (`supabase/migrations/20261029000000_initial_schema.sql`):** 18 relational tables with composite unique index `CONSTRAINT unique_student_internship UNIQUE (student_id, internship_id)`.
- **Runtime Reality:** The running Next.js app primarily operates against `MemoryDatabase` with Supabase client helpers as an optional fallback.

### 1.4 AI Agents (`src/services/agents/*`)
1. **Agent 1: Hunter (`hunter-agent.ts`):** 5-factor weighted opportunity matching (40% required, 20% preferred, 15% role, 10% academic/GPA, 10% location/mode, 5% availability).
2. **Agent 2: Personalization (`personalization-agent.ts`):** Bounded cover letter and screening answer generation referencing only real projects and verified skills.
3. **Agent 3: Execution (`execution-agent.ts`):** Assisted application submission and authorized auto-apply with weekly caps and threshold sliders.
4. **Agent 4: Eligibility & Integrity Guard (`guard-agent.ts`):** Deterministic validator for single-application constraint, active deadlines, GPA thresholds, and cohort eligibility.
5. **Agent 5: Career Operations (`career-ops-agent.ts`):** Stage dwell time tracking, follow-up letter generation, and STAR-method mock interview evaluation.
6. **Orchestrator & Provider (`agent-orchestrator.ts`, `ai-provider.ts`):** Central agent registry and multi-provider abstraction supporting Google Gemini 1.5 Flash, OpenAI GPT-4o-mini, and deterministic intelligent offline fallback.

---

## 2. Technical Migration Matrix

| Architectural Area | Current (Next.js 16 + Postgres/MemoryDB) | Target (MERN Monorepo) | Migration Strategy |
|:---|:---|:---|:---|
| **Repository Structure** | Next.js Single Root App (`src/app/`, `src/lib/`) | Monorepo (`client/`, `server/`, `shared/`) | Clean separation of concerns with shared TypeScript definitions |
| **Frontend Framework** | Next.js 16.4.3 (App Router) | React 19 + Vite 6 | Migrate React components to Vite SPA with React Router DOM |
| **Client Routing** | Next.js App Router file-system routing | React Router DOM v7 (BrowserRouter, Routes, Route) | Map all 33 routes 1:1, preserving exact paths and URL params |
| **Client Navigation** | `next/link`, `useRouter`, `usePathname`, `useSearchParams` | `Link`, `useNavigate`, `useLocation`, `useSearchParams` | Global conversion to React Router standard hooks |
| **Client Styling** | Tailwind CSS v4 in `globals.css` | Tailwind CSS v4 with Vite PostCSS plugin | Preserve identical design tokens, fonts, and `@theme` definitions |
| **Backend Framework** | Next.js Route Handlers (`NextRequest`, `NextResponse`) | Node.js + Express.js 4/5 (TypeScript) | REST controllers under `/api/v1/` with routing modules |
| **Database & ODM** | PostgreSQL (Supabase) + MemoryDatabase | MongoDB 7+ with Mongoose 8+ | 17 Mongoose schemas, compound unique indexes, and seed scripts |
| **Uniqueness Rule** | `UNIQUE (student_id, internship_id)` in SQL | Compound unique index `{ student_id: 1, internship_id: 1 }` | Handled at DB index level + E11000 duplicate key error translation to HTTP 409 |
| **Authentication** | Demo cookie switcher + Supabase SSR | JWT Access/Refresh tokens + bcrypt + demo persona fast-switch | Production JWT security with dev demo persona switching retained |
| **AI Agents** | Node services in `src/services/agents/` | Express services in `server/src/services/agents/` | 100% preservation of 5 agents, formulas, prompt boundaries, and MongoDB persistence |
| **Testing** | Vitest testing in-memory DB | Vitest + Supertest testing Express API & Mongoose models | Preserve all 9 core tests + add API and model tests |

---

## 3. Migration Safety Checklist
- [x] Verified working state of existing Next.js app on `main` branch.
- [x] Dedicated Git branch `mern-migration` created and active.
- [x] Original source code intact for reference and systematic porting.
- [x] No secrets committed to git.
- [x] Comprehensive test suite baseline recorded: 9/9 passing tests.
