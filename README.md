<div align="center">

<img src="src/app/icon.svg" alt="" width="88" height="88" />

# Spanish Elections Simulator

**From vote share to seats — exactly as the law counts them.**

Enter a vote estimate and instantly see the resulting seats in the **Congreso de los Diputados**,<br />
computed constituency by constituency as Spanish electoral law (LOREG) prescribes.

[![CI](https://github.com/PabloViniegra/spanish-elections-simulator/actions/workflows/ci.yml/badge.svg)](https://github.com/PabloViniegra/spanish-elections-simulator/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-3DA639)](./LICENSE)
[![pnpm](https://img.shields.io/badge/pnpm-11-F69220?logo=pnpm&logoColor=white)](https://pnpm.io)

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.45-C5F74F?logo=drizzle&logoColor=black)](https://orm.drizzle.team)
[![Vitest](https://img.shields.io/badge/Vitest-5-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev)
[![Playwright](https://img.shields.io/badge/Playwright-E2E-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev)

[About](#about) · [Features](#features) · [Getting Started](#getting-started) · [Electoral Engine](#the-electoral-engine) · [Testing](#testing) · [Roadmap](#roadmap)

</div>

---

<table>
<tr>
<td align="center" width="25%"><h3>350</h3>deputies</td>
<td align="center" width="25%"><h3>52</h3>constituencies</td>
<td align="center" width="25%"><h3>3%</h3>threshold per constituency</td>
<td align="center" width="25%"><h3>0 ms</h3>server round-trips to recalculate</td>
</tr>
</table>

## About

Polls publish national vote shares, but seats are decided in **52 constituencies** with D'Hondt and a 3% threshold. The gap between "% of vote" and "seats" is where most public misunderstanding lives — and existing tools are opaque about how they get from one to the other.

This simulator closes that gap:

| Principle | What it means |
| --- | --- |
| **Faithful allocation** | The same inputs as the official count produce the same seats, following the LOREG (Organic Law 5/1985), Title II, arts. 161–163. |
| **Explainability** | Every seat can be traced back to its D'Hondt quotient. |
| **Shareability** | Any scenario is encoded in the URL, so links never expire and need no backend lookup. |

## Features

<table>
<tr>
<td width="50%" valign="top">

### Two input modes
Enter national shares projected to provinces, or edit every province in detail with locked overrides.

</td>
<td width="50%" valign="top">

### Proportional swing projection
National shares become provincial shares over a base election (2016, Apr 2019, Nov 2019 or Jul 2023), then raked so the national aggregate matches the input exactly.

</td>
</tr>
<tr>
<td valign="top">

### Rich visualisations
Hemicycle chart, provincial map, coalition calculator and per-province D'Hondt quotient detail.

</td>
<td valign="top">

### Full transparency
3% threshold handling, last-seat ties and deterministic lot resolution are all inspectable.

</td>
</tr>
<tr>
<td valign="top">

### Election builder
Enter every party's votes province by province, watch each D'Hondt allocation live and, once all 52 are complete, get the full Congreso with the same views, exports and read-only share links.

</td>
<td valign="top">

### Sharing & exports
The whole scenario lives in a single URL, with short links, CSV and PNG exports.

</td>
</tr>
<tr>
<td valign="top">

### Accounts
Sign in to edit and save simulations to a personal profile. Shared scenario links stay public and read-only.

</td>
<td valign="top">

### Instant recalculation
The seat engine runs in the browser as a pure TypeScript module, recalculating on every keystroke.

</td>
</tr>
</table>

## Tech Stack

| Layer | Technology |
| --- | --- |
| **Framework** | [Next.js 16](https://nextjs.org) (App Router) |
| **UI** | [React 19](https://react.dev) · [Tailwind CSS 4](https://tailwindcss.com) · Hanken Grotesk Variable |
| **Language** | [TypeScript 5](https://www.typescriptlang.org) |
| **Maps & geometry** | [d3-geo](https://d3js.org/d3-geo) · [TopoJSON](https://github.com/topojson/topojson-client) · [es-atlas](https://github.com/deldersveld/topojson) |
| **Database** | [PostgreSQL](https://www.postgresql.org) on [Neon](https://neon.tech) via [Drizzle ORM](https://orm.drizzle.team) |
| **Auth** | [Better Auth](https://better-auth.com) (email/username + password) |
| **Email** | [Resend](https://resend.com) with [React Email](https://react.email) templates |
| **State encoding** | [lz-string](https://github.com/pieroxy/lz-string) (URL-compressed scenarios) |
| **Validation** | [Zod](https://zod.dev) |
| **Linting** | [oxlint](https://oxc.rs) |
| **Testing** | [Vitest](https://vitest.dev) (unit + coverage) · [fast-check](https://fast-check.dev) · [Playwright](https://playwright.dev) (E2E) |
| **Tooling** | [pnpm](https://pnpm.io) · [tsx](https://github.com/privatenumber/tsx) |
| **Hosting** | [Vercel](https://vercel.com) |

## Getting Started

### Prerequisites

- **Node.js** 20+
- **[pnpm](https://pnpm.io)** 11+
- **[Docker](https://docs.docker.com/get-docker/)** with Compose — only for the end-to-end tests

> [!IMPORTANT]
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

Open [http://localhost:3000](http://localhost:3000) and start simulating.

### Scripts

<details>
<summary><b>Show all scripts</b></summary>
<br />

| Command | Description |
| --- | --- |
| **App** | |
| `pnpm dev` | Start the development server |
| `pnpm build` | Build the production bundle |
| `pnpm start` | Serve the production build |
| **Quality** | |
| `pnpm lint` | Lint with oxlint (`--deny-warnings`) |
| `pnpm typecheck` | Generate Next.js types and run `tsc --noEmit` |
| `pnpm test` | Run unit tests with Vitest |
| `pnpm test:coverage` | Run unit tests with coverage |
| `pnpm test:e2e` | Run Playwright end-to-end tests (see [Testing](#testing)) |
| `pnpm test:e2e:db` | Start the end-to-end database |
| `pnpm test:e2e:db:down` | Stop and discard the end-to-end database |
| **Database & auth** | |
| `pnpm db:generate` | Generate Drizzle migrations |
| `pnpm db:migrate` | Apply Drizzle migrations |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm auth:generate` | Regenerate the Better Auth schema |
| **Data & email** | |
| `pnpm data:build` | Build election reference data |
| `pnpm data:builder` | Build the election builder data |
| `pnpm map:build` | Build the provincial map data |
| `pnpm email:launch` | Send launch emails via Resend |

</details>

## Project Structure

```
src/
├── app/                  # Next.js App Router routes (home, simulator, builder, auth, profile…)
├── components/           # Presentational components by domain (simulator, home, auth…)
├── data/                 # Static reference data (election results, province map)
├── emails/               # React Email templates
└── lib/
    ├── engine/           # Core seat engine: D'Hondt, apportionment, thresholds, projection
    ├── elections/        # Electoral data loading & types
    ├── scenario/         # URL encoding, rebalancing, coalitions, exports
    ├── builder/          # Province-by-province election builder
    ├── short-links/      # Short share links
    ├── auth/             # Better Auth configuration & forms
    ├── db/               # Drizzle schema & serverless client
    └── simulations/      # Saved simulation queries & actions
scripts/                  # Data pipeline (election data, map, launch emails)
e2e/                      # Playwright end-to-end specs
drizzle/                  # SQL migrations
```

> [!TIP]
> The codebase follows the **container-presentational pattern**: containers hold data and state logic, presentational components render it.

## The Electoral Engine

The seat engine (`src/lib/engine`) implements the Congreso rules as a pure, testable TypeScript module.

```mermaid
flowchart LR
 A["National vote shares"] --> B["Proportional swing<br/>over a base election"]
 B --> C["Raking to the<br/>national total"]
 C --> D["52 provincial<br/>vote tables"]
 M["Per-province input<br/>& locked overrides"] --> D
 D --> E["3% threshold<br/>per constituency"]
 E --> F["D'Hondt<br/>per constituency"]
 S["Seats per<br/>constituency"] --> F
 F --> G["350 seats<br/>in the Congreso"]
```

| Rules | Scope |
| --- | --- |
| **R-01 – R-03** | 52 constituencies, 350 deputies, Hare quota with largest remainders for province seat apportionment. |
| **R-04 – R-05** | Valid votes definition and the per-constituency 3% threshold. |
| **R-06 – R-07** | D'Hondt allocation with quotient tracing, tie-breaks and deterministic (seeded) lot resolution. |
| **P-01 – P-08** | Proportional swing projection with exact raking, regional blocs, provincial overrides and an "Others" bucket. |

<details>
<summary><b>How D'Hondt works — a worked example</b></summary>
<br />

A constituency elects **5 seats**. Each party's votes are divided by 1, 2, 3… and the 5 largest quotients win a seat (in **bold**):

| Party | Votes | ÷ 1 | ÷ 2 | ÷ 3 | ÷ 4 | Seats |
| --- | ---: | ---: | ---: | ---: | ---: | :---: |
| A | 100,000 | **100,000** | **50,000** | **33,333** | 25,000 | **3** |
| B | 80,000 | **80,000** | **40,000** | 26,667 | 20,000 | **2** |
| C | 30,000 | 30,000 | 15,000 | 10,000 | 7,500 | 0 |
| D | 20,000 | 20,000 | 10,000 | 6,667 | 5,000 | 0 |

C wins 13% of the vote but no seat: in small constituencies the effective threshold is far above the legal 3%. The simulator shows this table for every province.

</details>

## Data Pipeline

Official per-province figures (seat counts, census, results) are preprocessed into static JSON with `pnpm data:build` and `pnpm map:build`. The app ships them as reference data — no backend lookup is needed to compute a scenario, and links keep working forever.

## Testing

| Suite | Tooling | Coverage |
| --- | --- | --- |
| **Unit** | Vitest + [fast-check](https://fast-check.dev) | Property-based and fixture-driven tests for the engine, projection and scenario logic. |
| **E2E** | Playwright | Journeys for home, simulator access, auth and exports, plus signed-in sessions, editing, saving and rate limits. |

CI runs lint, typecheck, unit tests with coverage, a production dependency audit and the full end-to-end suite on every push to `main` and on every pull request.

### End-to-end database

The signed-in tests need a real database, so they never touch Neon or the one in `.env.local`. `compose.e2e.yml` starts a throwaway Postgres 17, kept in memory and built from the Drizzle migrations in `drizzle/`, behind [local-neon-http-proxy](https://github.com/TimoWilhelm/local-neon-http-proxy) on port 4444 so the Neon driver can talk to it unchanged.

```bash
pnpm test:e2e:db       # start the database
pnpm build
pnpm test:e2e
pnpm test:e2e:db:down  # throw it away
```

<details>
<summary><b>How the end-to-end setup works</b></summary>
<br />

- Playwright points the server at `postgres://postgres:postgres@db.localtest.me:5432/main`. `db.localtest.me` resolves to `127.0.0.1`, and only that host switches the driver to the local proxy.
- A setup project empties the database, registers an account, confirms its email in the database and signs in. The other tests reuse that session from `playwright/.auth/`, which is git-ignored.
- The server always starts on port 3100 with a placeholder auth secret and no Resend key, so no email is ever sent. Port 3100 must be free; an already running server is never reused.
- Postgres has no volume, so `down` discards every account and simulation. Re-running the tests without restarting it is fine: the setup resets the data.
- CI starts the same containers before the end-to-end job.

</details>

## Documentation

| Document | Contents |
| --- | --- |
| [`docs/PRD.md`](docs/PRD.md) | Full product specification, electoral rules and architecture decisions |
| [`DESIGN.md`](DESIGN.md) | Visual and UX design notes |
| [`PRODUCT.md`](PRODUCT.md) | Product rationale and scope |

## Roadmap

- [x] Congreso seat engine faithful to the LOREG
- [x] Two input modes and proportional swing projection
- [x] URL-encoded scenarios and short links
- [x] Election builder
- [x] Accounts and saved simulations
- [x] CSV and PNG exports
- [ ] Senado and other elections (the engine is designed for additional rulesets)
- [ ] "What if" population scenarios for seat apportionment
- [ ] Saved scenario history

## License

Distributed under the [MIT License](./LICENSE).

<div align="center">
<br />

Made in Spain by [Pablo Viniegra](https://github.com/PabloViniegra)

</div>
