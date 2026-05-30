# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start        # start server at http://localhost:3000
```

No build step — `public/` files are served directly as-is.

## Architecture

This is a zero-dependency, no-framework stopwatch app. There is no bundler or transpile step.

- `server.js` — minimal Node `http` server; serves static files from `public/` with path-traversal protection. Respects `PORT` env var (Railway sets this automatically).
- `public/index.html` — markup only; loads `styles.css` and `app.js`
- `public/app.js` — all stopwatch logic in vanilla JS; no modules or build required
- `public/styles.css` — all styles; uses CSS custom properties for the color palette

**State model (`app.js`):** Stopwatch state is a plain object `{ elapsedMs, isRunning, startedAt }` persisted to `localStorage` under key `stopwatch-state-v1`. Elapsed time is computed as `elapsedMs + (Date.now() - startedAt)` while running, so closing and reopening the browser correctly resumes a running timer. The interval fires at 250 ms for display refresh only — it doesn't accumulate state.

**Constraints:**
- Display format is `HHHH:MM:SS` (4-digit hours, hard cap at `MAX_HOURS = 9999`).
- Time input accepts `H+:MM:SS`; minutes and seconds must be `00–59`.
- No server-side persistence; all state lives in the browser.
