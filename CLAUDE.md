# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `npm run dev` (uses Turbopack for faster builds)
- **Build for production**: `npm run build`
- **Start production server**: `npm start`
- **Lint code**: `npm run lint`

## Architecture Overview

This is a Next.js 15 application using the App Router architecture with TypeScript and Tailwind CSS.

### Tech Stack
- **Framework**: Next.js 15.4.2 with App Router
- **Runtime**: React 19.1.0
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4 with PostCSS
- **Fonts**: Geist Sans and Geist Mono (Google Fonts)
- **Build Tool**: Turbopack (enabled in dev mode)

### Project Structure
- `app/` - App Router directory containing pages and layouts
  - `layout.tsx` - Root layout with global fonts and metadata
  - `page.tsx` - Home page component
  - `globals.css` - Global styles
- `public/` - Static assets (SVG icons, etc.)
- `tsconfig.json` - TypeScript configuration with `@/*` path mapping

### Key Configuration
- ESLint configured with Next.js preset
- TypeScript strict mode enabled
- Path aliasing: `@/*` maps to root directory
- App uses CSS custom properties for theming (dark/light mode support)

### Development Notes
- The app uses the modern App Router (not Pages Router)
- Tailwind CSS v4 is configured via PostCSS
- Development server runs on http://localhost:3000
- Hot reload is enabled for instant updates during development