# Would You Rather?

A two-choice voting website built with React, TypeScript, Vinext, and Cloudflare D1.

## Features

- Minimal game: title, two choices, date, and edition number
- One shared question per configurable interval (default: 24 hours)
- Protected `/admin` page for adding questions and changing the release interval
- Percentage results after voting
- Persistent questions, editions, settings, and votes
- Signed-in voter identity; browser ID fallback for anonymous visitors
- Responsive desktop and mobile layout

## Source map

- `app/page.tsx`: interface and client interactions
- `app/globals.css`: styling
- `app/api/questions/route.ts`: current edition and voting API
- `app/api/admin/route.ts`: administrator-only question and settings API
- `app/admin/`: protected administration UI
- `lib/game.ts`: authorization and release scheduling
- `db/schema.ts`: database schema
- `drizzle/`: schema migrations
- `.openai/hosting.json`: Sites deployment configuration

## Run locally

Requires Node.js 22.13+ and pnpm.

```sh
pnpm install
pnpm build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_mixed_dreadnoughts.sql
pnpm start
```

Apply this migration only once to a fresh local database. See [the starter guide](docs/STARTER.md) for development details. Local database contents are separate from the hosted database. Starter questions are inserted on the first questions API request.

```sh
pnpm build
```

## Hosting and GitHub

The initial deployment is hosted by ChatGPT Sites. This repository contains a source snapshot. Pushing to GitHub does not automatically deploy or synchronize the Sites project. Ask ChatGPT to apply and publish changes, or set up a separate deployment workflow.

The current site is private. Question creation and settings changes are restricted server-side to the admin role. Consider rate limiting before making the site public. Anonymous browser identifiers reduce accidental repeat voting but are not abuse protection.

No production database contents or credentials are included.

## Administration and releases

Open `/admin` while signed into an authorized ChatGPT account. Configure `ADMIN_EMAILS` (a comma-separated allowlist) as a Sites runtime secret; no production email addresses are included in source. Authorization checks use the trusted identity headers supplied by Sites. Do not expose a self-hosted origin directly with client-controlled identity headers.

The default interval is 24 hours; administrators can choose a whole number from 1 to 8760. Interval changes apply after the current question closes. Questions release in queue order, with persistent edition numbers. The game checks for a new edition every 30 seconds and at its closing boundary. Releases are calculated on request, so they do not require an external scheduler. If the queue runs out, the last edition remains visible with voting closed; adding a new question restarts the schedule immediately.

Dates use Asia/Nicosia. Production and local databases are separate. Apply every pending migration in order, including `drizzle/0001_tearful_paper_doll.sql` after the initial migration. For local admin testing, set `ADMIN_EMAILS=seedy@sites.test` in an untracked `.dev.vars` file and use the starter's local ChatGPT sign-in flow.

