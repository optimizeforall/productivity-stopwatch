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

## Usage

- **Begin** starts the current task timer.
- **Pause / Resume** freeze or continue both the current and total timers.
- **Ship** finishes the current task, adds a new row, and focuses the name field.
- **Reset** clears the day (tasks and timers). Theme preference is kept.
- Tasks and timers persist in `localStorage` across refresh and reopen.
