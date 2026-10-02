# Family Tasks

A private family game: kids earn real power in the family (not dollars) by completing
parents' tasks. Three story worlds — Pirates, Space, Dollhouse — each with its own
level, character, currency, shop and progress.

> Product north star: kids earn real-life privileges (e.g. parents 30 min without
> phones, picking dinner), never money. No dollar references anywhere.

## Stack

- **Server:** Node.js + Express + SQLite (`better-sqlite3`) — zero-config database,
  plenty for a family. Serves the API and the built client.
- **Client:** React + Vite, mobile-first, 3 languages (EN/UK/ES).
- **Deploy:** single Docker container (`Dockerfile` + `docker-compose.yml`).

## Repo layout

```
family-tasks-repo/
├── client/          # React frontend (Vite)
├── server/          # Express API + SQLite
│   └── src/
│       ├── index.js # app entry, static serving
│       └── db.js    # schema + migrations
├── assets/
│   ├── images/      # world art, ship modules, collage
│   └── videos/      # 30s backstory cartoons (EN/ES, UK deferred)
├── docs/
│   └── GAME_DESIGN.md  # full game design spec (source of truth)
├── Dockerfile
└── docker-compose.yml
```

## Run locally

```bash
# install everything
npm run install:all

# dev: API on :3001, client on :5173 (proxies /api)
npm run dev

# production build + serve
npm run build
npm start
```

Config via environment: `PORT` (default 3001), `DB_PATH` (default `./data/family.db`),
`SESSION_SECRET` (set a long random string in production).

## Docker

```bash
docker compose up --build
# app on http://localhost:3001, sqlite persisted in ./data
```

## Roadmap (rewrite phases)

1. Scaffold (this commit)
2. Auth — parents (email+password), kids (nickname+password), sessions
3. Tasks — CRUD + Ready → Working → Done → Parent check, kid notes & suggestions
4. Worlds/levels/EXP — 3 worlds, levels 1–10, journey map, level-up rewards
5. Shop — Programs (one-time gifts) vs Modules (permanent upgrades), chests
6. Modules — 5 bonuses/world, parent Game Setup tab, +10% EXP welcome gift
7. i18n — EN/UK/ES across UI
8. Backstory videos — first-entry playback + replay (EN/ES; UK deferred)
9. Paywall — levels 1–3 free, 4–10 Family Tasks Plus (logic only, no real payments)
