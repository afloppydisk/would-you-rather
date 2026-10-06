# Would You Rather?

A two-choice voting website built with React, TypeScript, Vinext, and Cloudflare D1.

## Features

- Five starter dilemmas and category filters
- Add new questions dynamically
- Vote and view percentage results
- Persistent questions and votes
- One vote per question per browser ID (not verified user identity)
- Responsive desktop and mobile layout

## Source map

- `app/page.tsx`: interface and client interactions
- `app/globals.css`: styling
- `app/api/questions/route.ts`: question and vote API
- `db/schema.ts`: database schema
- `drizzle/`: schema migrations
- `.openai/hosting.json`: Sites deployment configuration

## Run locally

Requires Node.js 22.13+ and pnpm.

```sh
pnpm install
pnpm exec wrangler d1 migrations apply site-creator-d1 --local --config .wrangler/local-dev.json
pnpm dev
```

The install script prepares the local Wrangler configuration. If `.wrangler/local-dev.json` is unavailable, follow the local migration instructions in the starter guide below. Local database contents are separate from the hosted database. Starter questions are inserted on the first questions API request.

```sh
pnpm build
```

## Hosting and GitHub

The initial deployment is hosted by ChatGPT Sites. This repository contains a source snapshot. Pushing to GitHub does not automatically deploy or synchronize the Sites project. Ask ChatGPT to apply and publish changes, or set up a separate deployment workflow.

The current site is private. Before making it public, restrict question creation to an authenticated administrator and consider rate limiting. Browser identifiers reduce accidental repeat voting but are not abuse protection.

No production database contents or credentials are included.
