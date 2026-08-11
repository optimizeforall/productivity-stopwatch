# Productivity Stopwatch

A to-do list with a stopwatch. You write the day's work in a notebook; this is the timer for whatever you're actually doing.

Live: [https://optimizeforall.github.io/productivity-stopwatch/](https://optimizeforall.github.io/productivity-stopwatch/)

It's a mobile-first PWA. Open it in the browser, or add it to your phone's home screen.

## How it works

The big number is time on the **current task**. The gray number under it is the **day total**. When you're paused or between tasks, a **red idle time** appears under the total — time spent paused or waiting to name the next task.

1. Name the task and hit **Begin**.
2. Work. **Pause** / **Resume** if you step away.
3. **Ship** when you're done. That freezes the task, adds a new row, and focuses the name field.
4. Type the next task and **Begin** again.

Tasks are numbered in the order you started them, newest on top. The active row is highlighted. Double-click its name to rename it. **Reset** (with a confirmation) clears the day.

**Undo** steps back one action: from a running task back to its Begin screen, or from a Begin screen back to the task you just shipped. Any time it throws away is added to idle, so undoing never hides time.

Theme (light/dark) and the day's tasks, timers, and idle time persist in `localStorage`. A running timer keeps counting across refresh.

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). On your phone, use the same Wi-Fi and that machine's local IP.

```bash
npm run build
npm run preview
```

## Deploy

Pushes to `main` build and publish to GitHub Pages via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

1. Push `main`.
2. Repo **Settings → Pages → Build and deployment → Source → GitHub Actions**.
3. Wait for the **Deploy to GitHub Pages** workflow. First load can take a minute.
