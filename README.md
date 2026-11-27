# Daily Quote Feed

A swipeable, full-screen quote app. Choose from 12 belief systems and get a new quote each day.

## Features
- Choose one or more belief systems at the start; change them any time
- Daily quote, with no repeat until your chosen set is used up
- Save quotes and write your own; search and filter them
- Resumes where you left off in each tab; day streak
- Share a quote as a story-size image, copy it, or have it read aloud where supported
- Text size, backup and restore, erase all data
- Installable web app that works offline; no ads or tracking
- Android and iPhone builds: daily reminders, native storage and sharing

## Run
    npm install
    npm run build
    npm run serve      # http://localhost:3000

## Test
    npm test           # core logic and quote data
    npm run test:e2e   # browser checks (needs Playwright with Chromium)

## Layout
`src/` app code · `public/` web app files · `scripts/` build · `tests/` · `docs/`

See [docs/MOBILE.md](docs/MOBILE.md) for phones and [docs/SOURCES.md](docs/SOURCES.md) for **unfinished quote verification**.
