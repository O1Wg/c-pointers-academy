# C & Pointers Academy

An interactive learning website that teaches students the C language with a deep focus on pointers and memory — lessons, annotated code, step-through memory diagrams, worked examples, quizzes, and curated resources.

## Run & Operate

- Frontend workflow: `artifacts/c-pointers-academy: web` (served at `/`)
- `pnpm --filter @workspace/c-pointers-academy run typecheck` — typecheck the frontend
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-server run dev` — API server (exists but unused by the academy so far)
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec (only needed if a backend is added)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind v4, shadcn/ui, wouter, framer-motion
- API (unused for now): Express 5, PostgreSQL + Drizzle ORM, Zod, Orval codegen

## Where things live

- `artifacts/c-pointers-academy/` — the learning site (the only user-facing artifact)
  - `src/content/` — all course content as typed data (modules, lessons, worked examples, visualizer presets, resources)
  - `src/components/` — memory diagram, code block, quiz, and shared UI
  - `src/pages/` — one file per route
  - `src/index.css` — theme tokens (light + dark)
- `artifacts/api-server/` — shared Express API (health check only)
- `lib/api-spec/openapi.yaml` — API contract (health check only)

## Architecture decisions

- Frontend-only on purpose: course content is static and authored in code; student progress is stored in `localStorage`. No accounts, no database. Add a backend only if the user asks for accounts, cross-device sync, or editable content.
- Memory diagrams are step-based data (stack frames, heap blocks, pointer arrows per step) rendered by one shared component reused in lessons, worked examples, and the visualizer.

## Product

- Curriculum: 16 lessons in 4 modules (C Foundations → Memory Model → Pointers → Mastery), each with prose, annotated code, memory diagrams, key takeaways, and a quiz.
- Worked examples with step-by-step reasoning and memory state.
- Interactive memory visualizer with preset programs.
- Curated external resources (books, docs, videos, tools).
- Progress page (completed lessons, quiz scores, examples viewed).

## User preferences

- Student-facing: content should include resources, worked examples, diagrams ("graphs"), and explanatory text.

## Gotchas

- Content correctness matters: any new lesson or example should be checked for valid C semantics before shipping.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
