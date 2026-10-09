<div align="center">

# Spanish Elections Simulator

A public web app where anyone can enter a vote estimate and instantly see the resulting seats in the **Congreso de los Diputados**, computed exactly as Spanish electoral law (LOREG) prescribes.

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.45-C5F74F)](https://orm.drizzle.team)
[![License: MIT](https://img.shields.io/badge/License-MIT-3DA639)](./LICENSE)

</div>

---

## Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Scripts](#scripts)
- [Project Structure](#project-structure)
- [The Electoral Engine](#the-electoral-engine)
- [Data Pipeline](#data-pipeline)
- [Testing](#testing)
- [Documentation](#documentation)
- [Roadmap](#roadmap)
- [License](#license)

## About

Polls publish national vote shares, but seats are decided in **52 constituencies** with D'Hondt and a 3% threshold. The gap between "% of vote" and "seats" is where most public misunderstanding lives — and existing tools are opaque about how they get from one to the other.

This simulator closes that gap:

- **Faithful allocation** — the same inputs as the official count produce the same seats, following the LOREG (Organic Law 5/1985), Title II, arts. 161–163.
- **Explainability** — every seat can be traced to its D'Hondt quotient.
- **Shareability** — any scenario is encoded in the URL, so links never expire and need no backend lookup.

## Features

- **Two input modes** — enter national shares projected to provinces, or fine-grained per-province editing with locked overrides.
- **Proportional swing projection** — national shares are turned into provincial shares over a base election (2016, Apr 2019, Nov 2019 or Jul 2023), then raked so the national aggregate matches the input exactly.
- **Visualisations** — hemicycle chart, provincial map, coalition calculator and per-province D'Hondt quotient detail.
- **Full transparency** — per-province D'Hondt detail, 3% threshold handling, last-seat ties and deterministic lot resolution are all inspectable.
- **Sharing & exports** — scenario state in a single URL plus CSV and PNG exports.
- **Accounts** — sign-in is required to edit or save simulations to a personal profile; shared scenario links remain public and read-only.
- **Instant recalculation** — the seat engine runs in the browser as a pure TypeScript module, recalculating on every keystroke.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| UI | [React 19](https://react.dev) · [Tailwind CSS 4](https://tailwindcss.com) · Inter Variable |
| Language | [TypeScript 5](https://www.typescriptlang.org) |
| Maps & geometry | [d3-geo](https://d3js.org/d3-geo) · [TopoJSON](https://github.com/topojson/topojson-client) · [es-atlas](https://github.com/deldersveld/topojson) |
| Database | [PostgreSQL](https://www.postgresql.org) on [Neon](https://neon.tech) via [Drizzle ORM](https://orm.drizzle.team) |
| Auth | [Better Auth](https://better-auth.com) (email/username + password) |
| Email | [Resend](https://resend.com) with [React Email](https://react.email) templates |
| State Encoding | [lz-string](https://github.com/pieroxy/lz-string) (URL-compressed scenarios) |
| Validation | [Zod](https://zod.dev) |
| Linting | [oxlint](https://oxc.rs) |
| Testing | [Vitest](https://vitest.dev) (unit + coverage) · [Playwright](https://playwright.dev) (E2E) |
| Runtime & Tooling | [pnpm](https://pnpm.io) · [tsx](https://github.com/privatenumber/tsx) |
| Hosting | [Vercel](https://vercel.com) |

## Getting Started

### Prerequisites

- Node.js 20+
- [pnpm](https://pnpm.io) 11+
- [Docker](https://docs.docker.com/get-docker/) with Compose, only for the end-to-end tests

> [!NOTE]
> Always use `pnpm` in this project.

### Installation

```bash
# Clone the repository
git clone https://github.com/PabloViniegra/spanish-elections-simulator.git
cd spanish-elections-simulator

# Install dependencies
pnpm install

# Configure environment (Neon connection string, Resend API key, etc.)
cp .env.example .env.local  # then fill in the values
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the development server |
| `pnpm build` | Build the production bundle |
| `pnpm start` | Serve the production build |
| `pnpm lint` | Lint with oxlint (`--deny-warnings`) |
| `pnpm typecheck` | Generate Next.js types and run `tsc --noEmit` |
| `pnpm test` | Run unit tests with Vitest |
| `pnpm test:coverage` | Run unit tests with coverage |
| `pnpm test:e2e` | Run Playwright end-to-end tests (see [Testing](#testing)) |
| `pnpm db:generate` | Generate Drizzle migrations |
| `pnpm db:migrate` | Apply Drizzle migrations |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm auth:generate` | Regenerate the Better Auth schema |
| `pnpm data:build` | Build election reference data |
| `pnpm map:build` | Build the provincial map data |
| `pnpm email:launch` | Send launch emails via Resend |

## Project Structure

```
src/
├── app/                  # Next.js App Router routes (home, simulator, auth, profile)
├── components/           # Presentational components by domain (simulator, home, auth…)
├── data/                 # Static reference data (election results, province map)
├── emails/               # React Email templates
└── lib/
    ├── engine/           # Core seat engine: D'Hondt, apportionment, thresholds, projection
    ├── elections/        # Electoral data loading & types
    ├── scenario/         # URL encoding, rebalancing, coalitions, exports
    ├── auth/             # Better Auth configuration & forms
    ├── db/               # Drizzle schema & serverless client
    └── simulations/      # Saved simulation queries & actions
scripts/                  # Data pipeline (election data, map, launch emails)
e2e/                      # Playwright end-to-end specs
drizzle/                  # SQL migrations
```

The codebase follows the **container-presentational pattern**: containers hold data and state logic, presentational components render it.

## The Electoral Engine

The seat engine (`src/lib/engine`) implements the Congreso rules as a pure, testable TypeScript module:

- **R-01–R-03** — 52 constituencies, 350 deputies, Hare quota with largest remainders for province seat apportionment.
- **R-04–R-05** — valid votes definition and the per-constituency 3% threshold.
- **R-06–R-07** — D'Hondt allocation with quotient tracing, tie-breaks and deterministic (seeded) lot resolution.
- **P-01–P-08** — proportional swing projection with exact raking, regional blocs, provincial overrides and an "Others" bucket.

Run `pnpm test` to execute the property-based and fixture-driven tests that back these rules.

## Data Pipeline

Official per-province figures (seat counts, census, results) are preprocessed into static JSON with `pnpm data:build` and `pnpm map:build`. The app ships them as reference data — no backend lookup is needed to compute a scenario, and links keep working forever.

## Testing

- **Unit** — Vitest with property-based testing ([fast-check](https://fast-check.dev)) covering the engine, projection and scenario logic.
- **E2E** — Playwright journeys for home, simulator access, auth and exports, plus signed-in sessions, editing, saving and rate limits (`pnpm test:e2e`).

### End-to-end database

The signed-in tests need a real database, so they never touch Neon or the one in `.env.local`. `compose.e2e.yml` starts a throwaway Postgres 17, kept in memory and built from the Drizzle migrations in `drizzle/`, behind [local-neon-http-proxy](https://github.com/TimoWilhelm/local-neon-http-proxy) on port 4444 so the Neon driver can talk to it unchanged.

```bash
docker compose -f compose.e2e.yml up -d --wait  # start the database
pnpm build
pnpm test:e2e
docker compose -f compose.e2e.yml down          # throw it away
```

- Playwright points the server at `postgres://postgres:postgres@db.localtest.me:5432/main`. `db.localtest.me` resolves to `127.0.0.1`, and only that host switches the driver to the local proxy.
- A setup project empties the database, registers an account, confirms its email in the database and signs in. The other tests reuse that session from `playwright/.auth/`, which is git-ignored.
- The server always starts on port 3100 with a placeholder auth secret and no Resend key, so no email is ever sent. Port 3100 must be free; an already running server is never reused.
- Postgres has no volume, so `down` discards every account and simulation. Re-running the tests without restarting it is fine: the setup resets the data.
- CI starts the same containers before the end-to-end job.

## Documentation

- [`docs/PRD.md`](docs/PRD.md) — full product specification, electoral rules and architecture decisions.
- [`DESIGN.md`](DESIGN.md) — visual and UX design notes.
- [`PRODUCT.md`](PRODUCT.md) — product rationale and scope.

## Roadmap

**v1 (current)** — Congreso only, two input modes, URL scenarios, accounts, exports.

**Possible later work**

- Senado and other elections (the engine is designed for additional rulesets).
- "What if" population scenarios for seat apportionment.
- Saved scenario history.

## License

Distributed under the [MIT License](./LICENSE).
