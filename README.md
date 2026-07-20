# Cordoba Training Center — LMS + ERP

A custom training-management platform for a Bahrain **Tamkeen-registered** training provider.
Built with React, TypeScript and Tailwind CSS.

> Replaces a Moodle deployment that could not meet Tamkeen compliance requirements
> (signed attendance registers, exact training-hour tracking, corporate batch billing).

---

## Roles

| Role | Capabilities |
|---|---|
| **Admin** | Master course inventory, bulk CSV learner import, batch creation, Batch Health dashboard |
| **Trainer** | Own batches, daily attendance (grid + QR check-in), rubric grading, return-for-redo |
| **Learner** | Today view, sequential module unlocking, submissions, grades, course evaluation |
| **Auditor / QA** | Read-only compliance verification, timestamped audit trail, report bundles |
| **Company** | Corporate sponsor view of enrolled employees |

## Key features

- **Batches** with auto-generated codes (`CTC-CCNA-2601`), schedules and contracted hours
- **Attendance** with five states — `P` · `L1` (5 min) · `L2` (10 min) · `L3` (15 min) · `A` — and weighted points
- **Batch Health** dashboard: attendance %, grades, progress, last activity
- **Rubric grading** with criteria-based scoring
- **Audit trail** — every change timestamped with a reason
- Bahrain-specific fields (CPR number, corporate sponsors)

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19 · TypeScript · Vite |
| Styling | Tailwind CSS v4 (custom enterprise design system) |
| Routing | React Router |
| Icons | Lucide |
| Planned backend | Supabase (Postgres + Auth + Row Level Security) |
| Planned storage | Cloudflare R2 |

## Getting started

```bash
cd app
npm install
npm run dev
```

Then open <http://localhost:5173/>.

On the sign-in screen pick any role — each opens a different application.

## Project status

- ✅ **Phase 1** — UI complete, running on mock data
- ⬜ **Phase 2** — Supabase schema, auth and row-level security
- ⬜ **Phase 3** — Tamkeen report generation (signed registers, compliance bundles)

See [`PROJECT_PLAN.md`](PROJECT_PLAN.md) for the full roadmap.

---

## Security note

No credentials, client data or third-party course material are stored in this repository.
