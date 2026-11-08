# C & Pointers Academy

An interactive website that helps students learn C and pointers: lessons, annotated code, step-through memory diagrams, worked examples, quizzes, and curated resources.

Created by Ahmed Alharbi ([@O1Wg](https://github.com/O1Wg)).

## What is inside

- **16 lessons in 4 modules**: C Foundations, The Memory Model, Pointers, Mastery. Each lesson has explanations, annotated code, key takeaways, and a quiz.
- **Memory diagrams**: step through code line by line and watch stack frames, heap blocks, addresses, and pointer arrows change.
- **11 worked examples** with numbered reasoning, full solutions, and common mistakes.
- **Memory visualizer** with 6 preset programs.
- **19 curated resources** (books, docs, videos, tools).
- **Progress tracking** saved in the browser (localStorage), plus dark mode.

## Run it locally

Requires Node.js 20+ and pnpm.

```bash
pnpm install
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/c-pointers-academy run dev
```

Then open http://localhost:5173.

## Project layout

- `artifacts/c-pointers-academy/` - the website (React, Vite, Tailwind)
  - `src/content/` - all lessons, examples, visualizer programs, and resources
  - `src/components/` - memory diagram, code block, quiz, layout
  - `src/pages/` - one file per route
- `artifacts/api-server/`, `lib/` - shared workspace packages (the site itself does not need a backend)
