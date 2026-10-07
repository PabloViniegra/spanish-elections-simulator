# Spanish Election Simulator — Software Specification v0.1

Oct 4, 2026 · @Pablo

## Vision and scope

A public web app where anyone can enter a vote estimate and instantly see the resulting seats in the Congreso de los Diputados, computed exactly as Spanish electoral law (LOREG) prescribes.

**Problem.** Polls publish national vote shares, but seats are decided in 52 constituencies with D'Hondt and a 3% threshold. The gap between "% of vote" and "seats" is where most public misunderstanding lives, and existing tools are opaque about how they get from one to the other.

**Goals (v1)**

- Faithful seat allocation for the Congreso: same inputs as the official count produce the same seats.
- Two input modes: national shares projected to provinces, and fine-grained per-province editing.
- Explainability: every seat can be traced to its D'Hondt quotient.
- Shareable scenarios through a single URL.

**Non-goals (v1)**

- Senado, autonómicas, municipales, europeas.
- Saved scenario history and server-side scenario storage.
- Poll aggregation or forecasting models: the user supplies the estimate.
- Pre-electoral coalition logic beyond treating a coalition as one candidacy.

**Target users.** Politically curious citizens, journalists and analysts who want quick "what if" scenarios, and teachers explaining the electoral system.

## Decision log

Nine product and architecture decisions are fixed for v1; each one is revisitable but shapes everything below.

| ID | Decision | Rationale |
| --- | --- | --- |
| D-01 | Congreso only | One well-understood ruleset; the engine is designed so other elections plug in later. |
| D-02 | Two input modes: national % projected, plus per-province overrides | Casual users think in national %, power users need provincial control. |
| D-03 | Proportional swing is the default projection | Never produces negative votes and respects each party's geographic shape. |
| D-04 | User accounts with email or username and password (Better Auth); scenarios still shared via URL | Revised Oct 2026 (was anonymous-only): accounts enable a user profile; personal data stays minimal (NFR-07). |
| D-05 | Scenario state encoded in the URL; the database stores only users and sessions | Links never expire and need no backend lookup. |
| D-06 | Single Next.js project | One codebase for UI, static reference data and any light server work. |
| D-07 | Seat engine runs in the browser as a pure TypeScript module | Instant recalculation on every keystroke; the same module is testable in isolation. |
| D-08 | Deploy on Vercel | Native Next.js hosting, preview deployments per branch, free tier is enough at launch. |
| D-09 | Neon Postgres accessed through Drizzle ORM | Serverless HTTP driver suits Vercel; typed queries and drizzle-kit migrations; first-class Better Auth adapter. |

Visualisations committed for v1: hemicycle, provincial map, coalition calculator and per-province D'Hondt detail.

## Electoral rules specification (Congreso)

The engine implements the Congreso rules of the [LOREG](https://www.boe.es/buscar/act.php?id=BOE-A-1985-11672) (Organic Law 5/1985), Title II, arts. 161–163, plus the vote definitions of art. 96. Each rule below gets its own ID so tests and code can reference it.

**R-01 Constituencies.** 52 constituencies: the 50 provinces plus Ceuta and Melilla.

**R-02 House size.** 350 deputies in total.

**R-03 Seat apportionment.** Ceuta and Melilla elect 1 deputy each. Every province gets an initial minimum of 2 (100 seats). The remaining 248 are distributed by population (población de derecho) using a Hare quota with largest remainders:

```latex
q = \frac{\sum_{p} \text{pop}_p}{248}, \qquad \text{seats}_p = 2 + \left\lfloor \frac{\text{pop}_p}{q} \right\rfloor + r_p
```

where r\_p is 1 for the provinces with the largest fractional parts until 248 seats are filled, else 0. The official per-province figures are published in the Real Decreto that calls each election. The app stores those official figures as reference data (R-03a) and also exposes the computation, so users can test "what if" population scenarios in a later version.

**R-04 Valid votes.** Valid votes = votes for candidacies + blank votes. Null votes are excluded from every calculation. Abstention only affects turnout display.

**R-05 Threshold.** A candidacy that gets less than 3% of the valid votes **in that constituency** (blank votes included in the denominator) is excluded from allocation there. The threshold is per constituency, never national.

**R-06 D'Hondt.** For each remaining candidacy, divide its votes by 1, 2, 3 … up to the constituency's seat count. Seats go to the largest quotients, one by one, until all are assigned.

**R-07 Ties.** If two quotients tie for a seat, it goes to the candidacy with more total votes in the constituency. If total votes are also equal, the first tie is broken by lot and later ties alternate. The engine resolves lot deterministically (seeded, documented) and flags the seat as "decided by lot" in the UI.

**R-08 Candidacies are per constituency.** A party may run under different labels or coalitions in different provinces. Nationally, results are aggregated through a user-editable mapping from local candidacy to national "bloc" (for example, a regional coalition counted with its national partner).

**R-09 Single-seat constituencies.** Ceuta and Melilla follow the same algorithm; with 1 seat, D'Hondt reduces to plurality.

## Projection model

National shares are turned into provincial shares by proportional swing over a base election, then raked so the national aggregate matches the user's input exactly.

**P-01 Inputs.** For each bloc i: target national share T\_i (% of valid votes). Plus a national blank-vote share and an optional turnout. A base election provides provincial shares s\_ip, national shares S\_i, and the census of each province.

**P-02 Proportional swing.** Each bloc scales its provincial share by its national ratio, then each province is normalised so shares sum to 100% of valid votes:

```latex
\hat{s}_{ip} = s_{ip} \cdot \frac{T_i}{S_i}, \qquad s'_{ip} = \frac{\hat{s}_{ip}}{\sum_j \hat{s}_{jp}}
```

**P-03 Exact national match (raking).** Normalisation shifts the national aggregate slightly. The engine runs iterative proportional fitting (alternating province and national rescaling) until every bloc's national share is within 0.001 points of T\_i, capped at 50 iterations.

**P-04 Blocs with no base vote.** A new bloc (S\_i = 0) cannot be swung. Default: uniform share T\_i in every province. The user can instead copy the geographic profile of an existing bloc ("distribute like X").

**P-05 Regional blocs.** A bloc that only runs in some provinces (for example a Basque or Catalan party) keeps zero share elsewhere. Its national T\_i is interpreted as share of the national total, so its provincial shares grow accordingly.

**P-06 Votes from shares.** Absolute votes per province = census × turnout × share. Absolute numbers matter only for display and for the R-07 tie-break; seats depend on shares. Default turnout per province = base election turnout scaled by the national turnout ratio.

**P-07 Provincial overrides.** Any province can be edited directly and is then marked locked. Locked provinces are excluded from P-02/P-03, and raking adjusts only the unlocked ones so the national aggregate still equals T\_i. If that is infeasible (for example locked provinces alone exceed a target), the engine keeps the locked values, reports the achieved national share and shows a warning.

**P-08 "Others".** Votes for blocs the user does not model go to an "Others" bucket. It counts for the 3% denominator but never wins seats, since it is not a real candidacy.

## Functional requirements

Fifteen requirements cover v1; Must items are the launch bar, Should items can slip to v1.1.

| ID | Priority | Requirement | Acceptance criteria |
| --- | --- | --- | --- |
| FR-01 | Must | Load a base election (default: most recent general election). | Base results load in under 1 s; the user can switch to any bundled past election. |
| FR-02 | Must | National mode: edit each bloc's national %, blank % and turnout. | Seats update on every change in under 100 ms; shares that do not sum to 100% show a clear error, or an "assign remainder to Others" action. |
| FR-03 | Must | Provincial mode: edit votes or % for any bloc in any province. | The edited province is shown as locked; national mode raking respects it (P-07). |
| FR-04 | Must | Reset a province or the whole scenario to the projected or base values. | One action per scope; reset is undoable. |
| FR-05 | Must | Compute seats per R-01 to R-09. | Reproduces official seats for every bundled election (see Test strategy). |
| FR-06 | Must | Hemicycle of 350 seats, coloured by bloc. | Totals match the engine; 176 majority line visible; accessible text alternative. |
| FR-07 | Must | Provincial map coloured by winner, with seats per bloc on hover or tap. | All 52 constituencies render, including Ceuta, Melilla and the Canary Islands inset. |
| FR-08 | Must | Coalition calculator: select blocs and see their total against 176. | Shows the sum, the gap to majority, and lists all minimal winning combinations. |
| FR-09 | Must | D'Hondt detail per province: quotient table, seat order, last seat won and votes needed to flip it. | Last seat and runner-up quotient are highlighted; ties decided by lot are flagged. |
| FR-10 | Must | Share a scenario as a URL. | Opening the URL restores exactly the same inputs and results; URL stays under 2,000 characters for national-only scenarios. |
| FR-11 | Must | Bloc management: rename, recolour, merge local candidacies into a bloc, add a new bloc. | Mapping changes recompute national totals; colours persist in the shared URL. |
| FR-12 | Should | Compare scenario against base: seat delta per bloc and per province. | Deltas shown as +/− next to each figure. |
| FR-13 | Should | Export results as CSV and the hemicycle as PNG. | CSV has one row per province × bloc with votes, % and seats. |
| FR-14 | Should | Explainer page on how the system works, linked to the D'Hondt detail. | Covers R-03 to R-07 in plain language. |
| FR-15 | Should | Spanish and English UI. | All UI strings externalised; Spanish is the default locale. |

## Non-functional requirements

The engine must be exact and instant; everything else is sized for a free-tier, no-backend launch.

| ID | Area | Requirement |
| --- | --- | --- |
| NFR-01 | Correctness | Engine matches official results for every bundled election, seat for seat. |
| NFR-02 | Performance | Full recalculation (projection + raking + 52 allocations) under 50 ms on a mid-range phone. |
| NFR-03 | Performance | First load under 2.5 s LCP on 4G; reference data for one election under 150 KB gzipped. |
| NFR-04 | Determinism | Same inputs always give the same seats, including ties decided by lot. |
| NFR-05 | Accessibility | WCAG 2.2 AA; every chart has a table or text alternative; colour is never the only signal. |
| NFR-06 | Responsiveness | Fully usable from 360 px width. |
| NFR-07 | Privacy | Minimal personal data: name, email, username, province and usage profile only; never political affiliation or voting intention. Passwords hashed by Better Auth; cookieless analytics only. |
| NFR-08 | Compatibility | Last two versions of Chrome, Safari, Firefox and Edge. |
| NFR-09 | Maintainability | Engine has zero UI or framework dependencies and at least 95% line coverage. |
| NFR-10 | Forward compatibility | Shared URLs carry a schema version; old links keep working after upgrades. |

## Domain model and reference data

Seven entities carry the whole domain; reference data is static JSON built offline from official sources and versioned in the repo.

| Entity | Key fields | Notes |
| --- | --- | --- |
| Election | id, date, constituencies\[\], seatsByConstituency | Immutable reference data, one file per election. |
| Constituency | code (INE 2-digit), name, community, seats, census, population | 52 rows per election; seats come from that election's convocation decree. |
| Candidacy | id, constituencyCode, name, acronym, votes | Local list as it appeared on the ballot (R-08). |
| Bloc | id, name, colour, candidacyIds\[\] | User-facing party grouping; default mapping shipped per election. |
| Scenario | schemaVersion, baseElectionId, mode, nationalInputs, blank, turnout, overrides, blocs | Everything the user changed; the only thing serialised to the URL. |
| Result | perConstituency (votes, shares, excluded, quotients, seats), national totals | Derived, never stored; recomputed from Scenario + Election. |
| User | id, name, email, username, province (INE code), usageProfile (citizen, journalist, teacher) | Stored in Neon Postgres and managed by Better Auth, with its session, account and verification tables. |

**Bundled elections (v1).** July 2023 as default base, plus November 2019, April 2019 and 2016 as validation fixtures and alternative bases. The last general election was held on 23 July 2023. On 5 October 2026 an early general election was called for 29 November 2026; its seat table (R-03a, from the 1 January 2025 population of Real Decreto 1117/2025) is the default seat distribution, with 2023 votes as the default base. Real Decreto 806/2026 (BOE-A-2026-20742) set it on 6 October 2026: Madrid 38 (+1) and Cádiz 8 (−1) against 2023.

**Sources**

- Results by constituency: Ministerio del Interior, [Infoelectoral](https://infoelectoral.interior.gob.es) downloadable results.
- Seats per constituency: the Real Decreto calling each election, published in the [BOE](https://www.boe.es).
- Population for R-03: [INE](https://www.ine.es) municipal register (padrón) figures referenced in the decree.
- Map geometry: provincial boundaries from the [CNIG](https://centrodedescargas.cnig.es) download centre, simplified to TopoJSON with a Canary Islands inset.

A build script (`scripts/build-data`) converts raw downloads into the Election JSON and fails the build if any constituency's computed seats differ from the official ones.

## Architecture

One Next.js (App Router) project on Vercel: pages are statically rendered, the seat engine runs in the browser, and Neon Postgres stores only users and sessions.

&#91;embedded content: architecture · build-time data, client-side engine\]

Official data is converted once at build time. In the browser, the URL and the scenario store stay in sync, and every edit reruns the engine and redraws the views.

**Repository layout**

```
/app                    Pages: /, /provincia/[code], /how-it-works
/app/api/og/route.tsx   Open Graph image for shared scenarios
/components             Hemicycle, ProvinceMap, CoalitionCalculator, DhondtTable
/lib/engine             Pure TypeScript: apportion, threshold, dhondt, project, rake
/lib/scenario           Scenario schema (zod), URL encode/decode, migrations
/lib/auth               Better Auth server config and React client
/lib/db                 Drizzle client and schema (Neon Postgres)
/drizzle                SQL migrations
/data/elections         Generated Election JSON, one file per election
/scripts/build-data     Official downloads to Election JSON, with seat validation
```

**Key technical choices**

- **Engine isolation.** `/lib/engine` imports nothing from React or Next.js, so it can move to its own package later and runs identically in the browser, in tests and in the OG route.
- **Exact arithmetic.** Votes are integers. D'Hondt compares quotients by cross-multiplication (a·j vs b·i) instead of floating division, so ties are detected exactly. Shares are stored in basis points (0.01%).
- **State.** One client store (Zustand) holds the Scenario. It syncs to `?s=` with `router.replace`, debounced 300 ms, so editing does not flood the browser history.
- **URL format.** `v1.` prefix + Scenario as compact JSON compressed with lz-string. Parsing goes through zod; an invalid or unknown-version link falls back to the base scenario with a notice.
- **Shared-link previews.** The OG route decodes `s`, runs the same engine on the server and renders a hemicycle PNG, so links shared on social media show the result.
- **Charts.** Custom SVG for the hemicycle and D'Hondt table; d3-geo with TopoJSON for the map.
- **Performance fallback.** If NFR-02 fails on low-end phones, the engine moves to a Web Worker without API changes.
- **Tooling.** TypeScript strict, Vitest + fast-check, Playwright, ESLint; Vercel preview deployment per pull request.

## Test strategy

The engine is proven against real elections first; UI tests only check that it is wired correctly.

1. **Golden tests (NFR-01).** For each bundled election, feed official votes per constituency and assert the official 350 seats, constituency by constituency.
2. **Rule unit tests.** One suite per rule ID: threshold exactly at 3% (included) and just below (excluded), blank votes in the denominator, single-seat constituencies, quotient ties broken by total votes, full ties broken by the seeded lot.
3. **Property-based tests** (fast-check). For random valid inputs: seats per constituency always sum to its size; a bloc never loses seats when only its own votes rise (D'Hondt monotonicity); no excluded bloc ever gets a seat.
4. **Projection tests.** With T\_i = S\_i the projection returns the base shares; after raking, national shares match T\_i within 0.001 points; locked provinces never change.
5. **URL round-trip.** Serialise and parse random scenarios and assert deep equality; decode every fixture URL from older schema versions.
6. **End-to-end** (Playwright). Edit a national share, see the hemicycle change, share the link, open it in a fresh context and see the same result.

CI on every pull request runs 1–5 in under a minute; Vercel preview deployments run 6.

## Open questions, risks and roadmap

The early general election of 29 November 2026 turned the main risk into a deadline: the roadmap now ships a national-mode simulator before the campaign and moves depth features after election day.

**Open questions**

- [x] Default bloc mapping for 2023: regional lists of PSOE, PP and Sumar (Compromís included) count with their national party; every other candidacy with a seat is its own bloc.
- [ ] Should the URL also carry provincial overrides, or should heavily edited scenarios warn that the link will be long?
- [ ] Which features require an account, and does the simulator stay usable without one?
- [ ] Product name and domain.
- [ ] Analytics: Vercel Analytics or another cookieless option such as Plausible?

**Risks**

| Risk | Impact | Mitigation |
| --- | --- | --- |
| A new general election is called before launch (**materialised 5 Oct 2026**, election on 29 Nov 2026) | Seat table per province and default base change | Seats live in data, not code; add the decree's table, checked against the engine's R-03 apportionment, and default to it. |
| Official data formats change between elections | Build script breaks | Golden tests fail loudly; the parser is isolated per election year. |
| Users read projections as forecasts | Reputational | Persistent "this is a simulation, not a forecast" notice, and no default poll data. |
| URL length with many overrides | Broken links on some platforms | Compression plus a size warning; short links can be added later with a store. |

**Roadmap**

1. **M0 – Engine. Done.** R-01 to R-09, golden tests green for 2016–2023, engine coverage gate.
2. **M1 – Data for 29N.** Done: build script and 2016–2023 bases; 2026 seat table from Real Decreto 806/2026, checked against R-03 with RD 1117/2025 population; default bloc mapping for 2023.
3. **M2 – Launch before the campaign (13 Nov 2026).** National mode on 2023 votes and 2026 seats, hemicycle, coalition calculator, URL sharing, "simulation, not a forecast" notice, accessibility of the shipped views, Spanish UI, Vercel production.
4. **M3 – Depth, after 29N.** Provincial mode with locks (FR-03), map (FR-07), D'Hondt detail (FR-09), 29 November 2026 results as a bundled election.
5. **M4 – Completion.** Full accessibility pass, explainer page, English UI.
6. **Later.** Senado, autonómicas, population what-ifs (R-03), short links.
