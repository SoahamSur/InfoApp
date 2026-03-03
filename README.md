# GK Pulse

GK Pulse is a ready-to-deploy web app designed for students preparing for government exams where Current Affairs and General Knowledge are critical.

## Is it dynamic?
Yes — the app now loads content dynamically at runtime from `data/current-affairs.json`.
That means you can update facts and quiz questions daily **without changing application code**.

## What it offers
- Daily curated top happenings and quick facts.
- Topic filters (Economy, Polity, Environment, Science & Tech, etc.).
- Bookmarking for revision.
- Daily streak tracking to build habit.
- One-question daily quiz for retention.
- Data status indicator showing whether live dataset loaded.

## How to update daily content
Edit `data/current-affairs.json`:
- `lastUpdated`: date string
- `facts`: array of current affairs items
- `quizBank`: array of MCQ quiz objects

Deploying updated JSON instantly updates learner content.

## Run locally
Because this is a static app, you can run it with any static server.

```bash
python3 -m http.server 4173
```

Then open: `http://localhost:4173`

## Deploy options
You can deploy this as a static site on:
- Vercel
- Netlify
- GitHub Pages
- Cloudflare Pages

No build step required.

## Project structure
- `index.html` - app layout and content regions
- `styles.css` - styling and responsive UI
- `app.js` - dynamic loading, filtering, bookmarks, streak and quiz logic
- `data/current-affairs.json` - daily updatable content source
