<h2 align="center"><em><code>Studently</code></em></h2>

<p align="center">Your semester, beautifully under control.</p>

Studently turns deadlines into a calm daily plan. Add what's due, and it splits the work into daily study blocks, times your focus sessions, and logs progress back to the right deadline.

![Studently landing page](/assets/studently-landing.jpg "Studently")

![Studently Today view](/assets/studently-today.jpg "Today")

## Features

- **Smart planner**: spreads each deadline's remaining hours across the days you have, most urgent first, inside a daily study budget you choose. It warns you early when a deadline won't fit and offers a one-tap fix.
- **Natural-language quick add**: type `Chem midterm next fri 8h !!!` and get an exam, due next Friday, 8 hours, critical priority. Understands `tomorrow`, weekdays, `nov 20`, `12/15`, `in 5 days`, `3h`, `90m`, `!`/`!!`/`!!!` and `#category`.
- **Focus timer**: Pomodoro-style sessions with breaks. Finished sessions log time to the deadline you picked, so the plan updates itself. Keeps running across views and reloads.
- **Today dashboard**: what's left today, task progress, streaks, a weekly focus chart and upcoming deadlines.
- **Tasks and categories**: color-coded boards, inline editing, search, filters, and undo for deletes.
- **Command palette**: press `⌘K` / `Ctrl+K` to jump anywhere, search, or add tasks and deadlines.
- **Make it yours**: light/dark/auto themes, 7 accent colors that re-tint the whole UI, 5 fonts, reduced-motion mode.
- **Sync or go guest**: sign in with email or Google to sync through Firebase (with offline support), or try it as a guest. Guest data moves into your account when you sign up.
- **Your data**: export and import JSON backups, or load a sample semester to explore.

## Keyboard shortcuts

| Keys        | Action                   |
| ----------- | ------------------------ |
| `⌘K`        | Command palette          |
| `N` or `/`  | Quick add                |
| `1`–`5`     | Switch views             |
| `T`         | Toggle theme             |
| `Space`     | Start / pause (Focus)    |
| `,`         | Settings                 |

## Development

```bash
npm install
npm run dev
```

Built with SvelteKit 2, Svelte 5, Firebase Auth + Firestore, and Lucide icons.
