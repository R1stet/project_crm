# Repository Guidelines

## Project Structure & Module Organization
This CRM uses the Next.js App Router. Routes live in `app/`; `app/layout.tsx` shares layout and `app/globals.css` holds Tailwind primitives. Reusable UI primitives stay in `components/ui`, while feature widgets such as `customer-table` and `dashboard` remain in `components/`. Shared hooks and Supabase helpers belong in `hooks/` and `lib/`, TypeScript contracts in `types/`, and static assets in `public/`. Rate limiting and session logic live in `middleware.ts` and `lib`. Co-locate new feature code.

## Build, Test & Development Commands
- `npm install` — install dependencies (Node 20+ keeps parity with Next.js 15).
- `npm run dev` — start the Turbopack dev server at `http://localhost:3000`.
- `npm run lint` — run ESLint with the Next.js ruleset; must pass before opening a PR.
- `npm run build` — compile the production bundle; catches missing env variables.
- `npm run start` — serve the production build for local smoke testing.

## Coding Style & Naming Conventions
Write modern React + TypeScript with two-space indentation, double quotes, and no semicolons; ESLint enforces the defaults. Prefer server components; add `"use client"` only when hooks or browser APIs are required. Use Tailwind utilities for layout and wrap variant logic with `class-variance-authority` factories (see `components/ui/button.tsx`). Name route segments in kebab-case (`app/customers/page.tsx`) and components in PascalCase (`CustomerTable`). Keep Supabase access in `lib/supabase.ts` rather than spinning up new clients.

## Testing Guidelines
Automated tests are not yet wired up, so every PR must document manual verification steps (states exercised, browsers, breakpoints). If you introduce automated tests, use React Testing Library with co-located `__tests__/` directories and `*.test.tsx` files, and add the matching script to `package.json`. Until then, rely on `npm run lint` and thorough manual QA to catch regressions.

## Commit & Pull Request Guidelines
Follow the existing short, imperative commit style (`Fix image upload loading issue`). Keep commits focused and reorder to avoid “fixup” noise. Pull requests should describe the problem, the solution, and any Supabase schema impact; attach UI screenshots or screen recordings for visual changes. Link issues or TODOs, include environment variable updates, and wait for lint/build checks to pass before requesting review.

## Security & Configuration Tips
Create a `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` before running locally; never commit secrets. Review `SECURITY.md` when touching auth, logging, or rate limiting. Logins are throttled via `lib/rate-limiter`, so apply similar guards on new entry points.
