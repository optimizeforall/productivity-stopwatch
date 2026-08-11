# Productivity Stopwatch

A mobile-first PWA that pairs a to-do list with a stopwatch. Use it for the work in your notebook: start a task, time it, ship it, name the next one.

## Scripts

```bash
npm install
npm run dev
```

Then open the local URL on your phone (same Wi-Fi) or in the browser. In Chrome/Safari you can install it to the home screen.

```bash
npm run build
npm run preview
```

## GitHub Pages

Live URL after deploy: [https://optimizeforall.github.io/productivity-stopwatch/](https://optimizeforall.github.io/productivity-stopwatch/)

1. Push `main` to GitHub (includes the deploy workflow).
2. In the repo: **Settings → Pages → Build and deployment → Source → GitHub Actions**.
3. The **Deploy to GitHub Pages** workflow runs on every push to `main`. First load can take a minute.

## Usage

- **Begin** starts the current task timer.
- **Pause / Resume** freeze or continue both the current and total timers.
- **Ship** finishes the current task, adds a new row, and focuses the name field.
- **Reset** clears the day (tasks and timers). Theme preference is kept.
- Tasks and timers persist in `localStorage` across refresh and reopen.
